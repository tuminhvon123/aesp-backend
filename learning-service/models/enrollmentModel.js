// aesp-backend/learning-service/models/enrollmentModel.js
import pool from "../db.js";

// Lấy tất cả enrollment
export const getAllEnrollments = async () => {
  const [rows] = await pool.query("SELECT * FROM enrollments");
  return rows;
};

// Lấy enrollment theo user
export const getEnrollmentsByUser = async (userId) => {
  const [rows] = await pool.query(
    "SELECT * FROM enrollments WHERE user_id = ?",
    [userId]
  );
  return rows;
};

// Lấy enrollment theo user + course
export const getEnrollment = async (userId, courseId) => {
  const [rows] = await pool.query(
    "SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?",
    [userId, courseId]
  );
  return rows[0] || null;
};

// Tạo enrollment mới
export const createEnrollment = async ({ userId, courseId, withMentor }) => {
  const withMentorFlag = withMentor ? 1 : 0;
  const [result] = await pool.query(
    "INSERT INTO enrollments (user_id, course_id, with_mentor) VALUES (?, ?, ?)",
    [userId, courseId, withMentorFlag]
  );

  return {
    id: result.insertId,
    user_id: userId,
    course_id: courseId,
    with_mentor: withMentorFlag,
  };
};
