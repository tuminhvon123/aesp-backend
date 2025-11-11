import pool from "../db.js";

export const getAllProgress = async () => {
  const [rows] = await pool.query("SELECT * FROM progress");
  return rows;
};

export const getProgressByUserId = async (user_id) => {
  const [rows] = await pool.query(
    "SELECT * FROM progress WHERE user_id = ?", 
    [user_id]
  );
  return rows;
};

export const getProgressByUserAndCourse = async (user_id, course_id) => {
  const [rows] = await pool.query(
    "SELECT * FROM progress WHERE user_id = ? AND course_id = ?", 
    [user_id, course_id]
  );
  return rows[0]; // Trả về một record duy nhất
};

export const addProgress = async (progress) => {
  const { user_id, course_id, completed_lessons, total_lessons } = progress;
  const [result] = await pool.query(
    "INSERT INTO progress (user_id, course_id, completed_lessons, total_lessons) VALUES (?, ?, ?, ?)",
    [user_id, course_id, completed_lessons, total_lessons]
  );
  return { id: result.insertId, ...progress };
};

export const updateProgress = async (id, progress) => {
  const { user_id, course_id, completed_lessons, total_lessons } = progress;
  await pool.query(
    "UPDATE progress SET user_id=?, course_id=?, completed_lessons=?, total_lessons=? WHERE id=?",
    [user_id, course_id, completed_lessons, total_lessons, id]
  );
  return { id, ...progress };
};

export const updateProgressByUserAndCourse = async (user_id, course_id, progress) => {
  const { completed_lessons, total_lessons } = progress;
  await pool.query(
    "UPDATE progress SET completed_lessons=?, total_lessons=? WHERE user_id=? AND course_id=?",
    [completed_lessons, total_lessons, user_id, course_id]
  );
  return { user_id, course_id, ...progress };
};

export const incrementCompletedLessons = async (user_id, course_id) => {
  await pool.query(
    "UPDATE progress SET completed_lessons = completed_lessons + 1 WHERE user_id=? AND course_id=?",
    [user_id, course_id]
  );
  const [rows] = await pool.query(
    "SELECT * FROM progress WHERE user_id=? AND course_id=?",
    [user_id, course_id]
  );
  return rows[0];
};

export const deleteProgress = async (id) => {
  await pool.query("DELETE FROM progress WHERE id=?", [id]);
  return true;
};

export const deleteProgressByUser = async (user_id) => {
  await pool.query("DELETE FROM progress WHERE user_id=?", [user_id]);
  return true;
};

// Tính toán phần trăm tiến độ
export const calculateProgressPercentage = async (user_id, course_id) => {
  const [rows] = await pool.query(
    "SELECT completed_lessons, total_lessons FROM progress WHERE user_id=? AND course_id=?",
    [user_id, course_id]
  );
  
  if (rows.length === 0) return 0;
  
  const { completed_lessons, total_lessons } = rows[0];
  if (total_lessons === 0) return 0;
  
  return ((completed_lessons / total_lessons) * 100).toFixed(2);
};

// Lấy tổng quan tiến độ của user
export const getUserProgressOverview = async (user_id) => {
  const [rows] = await pool.query(`
    SELECT 
      p.*,
      c.title as course_name,
      c.mentor_name,
      ROUND((p.completed_lessons / p.total_lessons) * 100, 2) as progress_percentage
    FROM progress p
    JOIN courses c ON p.course_id = c.id
    WHERE p.user_id = ?
  `, [user_id]);
  
  return rows;
};