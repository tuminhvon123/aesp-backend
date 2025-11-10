import db from "./db.js";

export const getProgressByUser = (userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM progress WHERE user_id = ?",
      [userId],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
};

export const updateProgress = (userId, courseId, completedLessons) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE progress SET completed_lessons = ? WHERE user_id = ? AND course_id = ?",
      [completedLessons, userId, courseId],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
};
