// aesp-backend/learning-service/routes/enrollmentRoutes.js
import express from "express";
import {
  getAllEnrollments,
  getEnrollmentsByUser,
  getEnrollment,
  createEnrollment,
} from "../models/enrollmentModel.js";

const router = express.Router();

// Lấy tất cả enrollment (admin dùng, tạm để sẵn)
router.get("/", async (req, res) => {
  try {
    const data = await getAllEnrollments();
    res.json(data);
  } catch (err) {
    console.error("Lỗi get all enrollments:", err);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách đăng ký", error: err });
  }
});

// Lấy enrollment của một user
router.get("/user/:userId", async (req, res) => {
  try {
    const data = await getEnrollmentsByUser(req.params.userId);
    res.json(data);
  } catch (err) {
    console.error("Lỗi get enrollments by user:", err);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy gói học của người dùng", error: err });
  }
});

// Check đã đăng ký hay chưa
router.get("/check", async (req, res) => {
  try {
    const { userId, courseId } = req.query;
    if (!userId || !courseId) {
      return res
        .status(400)
        .json({ message: "Thiếu userId hoặc courseId trong query" });
    }

    const enrollment = await getEnrollment(userId, courseId);
    res.json({ enrolled: !!enrollment });
  } catch (err) {
    console.error("Lỗi check enrollment:", err);
    res
      .status(500)
      .json({ message: "Lỗi khi kiểm tra đăng ký khóa học", error: err });
  }
});

// Đăng ký khóa học
router.post("/", async (req, res) => {
  try {
    const { userId, courseId, withMentor } = req.body;

    if (!userId || !courseId) {
      return res
        .status(400)
        .json({ message: "Thiếu userId hoặc courseId trong body" });
    }

    const existing = await getEnrollment(userId, courseId);
    if (existing) {
      return res.json({ alreadyEnrolled: true, enrollment: existing });
    }

    const enrollment = await createEnrollment({ userId, courseId, withMentor });
    res.json({ alreadyEnrolled: false, enrollment });
  } catch (err) {
    console.error("Lỗi tạo enrollment:", err);
    res
      .status(500)
      .json({ message: "Lỗi khi đăng ký khóa học", error: err });
  }
});

export default router;
