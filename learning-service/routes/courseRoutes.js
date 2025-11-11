import express from "express";
import {
  getAllCourses,
  addCourse,
  updateCourse,
  deleteCourse,
} from "../models/courseModel.js";

const router = express.Router();

// Lấy danh sách khóa học
router.get("/", async (req, res) => {
  try {
    const courses = await getAllCourses();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách khóa học", error: err });
  }
});

// Thêm khóa học
router.post("/", async (req, res) => {
  try {
    const newCourse = await addCourse(req.body);
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi thêm khóa học", error: err });
  }
});

// Cập nhật khóa học
router.put("/:id", async (req, res) => {
  try {
    const updated = await updateCourse(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật khóa học", error: err });
  }
});

// Xóa khóa học
router.delete("/:id", async (req, res) => {
  try {
    await deleteCourse(req.params.id);
    res.json({ message: "Đã xóa khóa học" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa khóa học", error: err });
  }
});

export default router;
