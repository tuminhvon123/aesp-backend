import express from "express";
import { getProgressByUser, updateProgress } from "../models/progressModel.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const progress = await getProgressByUser(req.params.userId);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy tiến độ học tập", error: err });
  }
});

router.put("/", async (req, res) => {
  const { userId, courseId, completedLessons } = req.body;
  if (!userId || !courseId) {
    return res.status(400).json({ message: "Thiếu thông tin tiến độ" });
  }

  try {
    await updateProgress(userId, courseId, completedLessons);
    res.json({ message: "Cập nhật tiến độ thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật tiến độ", error: err });
  }
});

export default router;
