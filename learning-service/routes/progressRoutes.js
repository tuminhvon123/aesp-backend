import express from "express";
import {
  getAllProgress,
  getProgressByUserId,
  getProgressByUserAndCourse,
  addProgress,
  updateProgress,
  updateProgressByUserAndCourse,
  incrementCompletedLessons,
  deleteProgress,
  deleteProgressByUser,
  getUserProgressOverview
} from "../models/progressModel.js";

const router = express.Router();

// Lấy tất cả progress
router.get("/", async (req, res) => {
  try {
    const progress = await getAllProgress();
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách tiến độ", error: err });
  }
});

// Lấy progress theo user_id
router.get("/user/:user_id", async (req, res) => {
  try {
    const progress = await getProgressByUserId(req.params.user_id);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy tiến độ người dùng", error: err });
  }
});

// Lấy overview progress của user (có thông tin khóa học)
router.get("/user/:user_id/overview", async (req, res) => {
  try {
    const progress = await getUserProgressOverview(req.params.user_id);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy tổng quan tiến độ", error: err });
  }
});

// Lấy progress cụ thể của user theo course
router.get("/user/:user_id/course/:course_id", async (req, res) => {
  try {
    const { user_id, course_id } = req.params;
    const progress = await getProgressByUserAndCourse(user_id, course_id);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy tiến độ khóa học", error: err });
  }
});

// Thêm progress mới
router.post("/", async (req, res) => {
  try {
    const newProgress = await addProgress(req.body);
    res.status(201).json(newProgress);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi thêm tiến độ", error: err });
  }
});

// Cập nhật progress theo ID
router.put("/:id", async (req, res) => {
  try {
    const updated = await updateProgress(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật tiến độ", error: err });
  }
});

// Cập nhật progress theo user_id và course_id
router.put("/user/:user_id/course/:course_id", async (req, res) => {
  try {
    const { user_id, course_id } = req.params;
    const updated = await updateProgressByUserAndCourse(user_id, course_id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật tiến độ", error: err });
  }
});

// Tăng số lesson đã hoàn thành
router.patch("/user/:user_id/course/:course_id/increment", async (req, res) => {
  try {
    const { user_id, course_id } = req.params;
    const updated = await incrementCompletedLessons(user_id, course_id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật tiến độ", error: err });
  }
});

// Xóa progress theo ID
router.delete("/:id", async (req, res) => {
  try {
    await deleteProgress(req.params.id);
    res.json({ message: "Đã xóa tiến độ" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa tiến độ", error: err });
  }
});

// Xóa tất cả progress của user
router.delete("/user/:user_id", async (req, res) => {
  try {
    await deleteProgressByUser(req.params.user_id);
    res.json({ message: "Đã xóa tất cả tiến độ của người dùng" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa tiến độ người dùng", error: err });
  }
});

export default router;