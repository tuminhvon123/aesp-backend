import db from "./db.js";

export const getAllCourses = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM courses", (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

export const addCourse = (title, description, level, duration) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO courses (title, description, level, duration) VALUES (?, ?, ?, ?)",
      [title, description, level, duration],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
};
