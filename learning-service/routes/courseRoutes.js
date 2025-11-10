import express from "express";
import { getAllCourses, addCourse } from "../models/courseModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const courses = await getAllCourses();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách khóa học", error: err });
  }
});

router.post("/", async (req, res) => {
  const { title, description, level, duration } = req.body;
  if (!title || !level) {
    return res.status(400).json({ message: "Thiếu thông tin khóa học" });
  }

  try {
    await addCourse(title, description, level, duration);
    res.json({ message: "Thêm khóa học thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi thêm khóa học", error: err });
  }
});

export default router;
