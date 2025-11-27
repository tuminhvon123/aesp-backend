// aesp-backend/learning-service/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import courseRoutes from "./routes/courseRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Learning service is running");
});

// Routes
app.use("/api/courses", courseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/enrollments", enrollmentRoutes);

app.listen(PORT, () => {
  console.log(`Learning service running on port ${PORT}`);
});
