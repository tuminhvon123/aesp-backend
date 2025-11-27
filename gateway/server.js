// aesp-backend/gateway/server.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// Gateway port trùng với frontend
const PORT = process.env.PORT || 5050;

// Dùng localhost khi chạy local, có thể override bằng env khi dùng Docker
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5003";
const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:5001";
const LEARNING_SERVICE_URL =
  process.env.LEARNING_SERVICE_URL || "http://localhost:5002";
const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL || "http://payment-service:5003";

app.use(cors());
app.use(express.json());

// 1. Health check
app.get("/", (req, res) => {
  res.send("Gateway is running!");
});

// 2. AI service

// Phân tích 1 câu (route cũ)
app.post("/api/ai/analyze/text", async (req, res) => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/ai/analyze/text`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    console.error("Lỗi gateway ai analyze:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { message: "Lỗi gateway ai analyze" });
  }
});

// Chat nhiều lượt (route mới, QUAN TRỌNG)
app.post("/api/ai/chat", async (req, res) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/ai/chat`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Lỗi gateway ai chat:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { message: "Lỗi gateway ai chat" });
  }
});

// 3. Auth user
app.post("/api/users/register", async (req, res) => {
  try {
    const url = `${USER_SERVICE_URL}/api/users/register`;
    const response = await axios.post(url, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Lỗi gateway register:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { message: "Lỗi gateway register" });
  }
});

app.post("/api/users/login", async (req, res) => {
  try {
    const url = `${USER_SERVICE_URL}/api/users/login`;
    const response = await axios.post(url, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Lỗi gateway login:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { message: "Lỗi gateway login" });
  }
});

// 4. Admin users
app.get("/api/admin/users", async (req, res) => {
  const url = `${USER_SERVICE_URL}/api/admin/users`;
  try {
    console.log("Gateway -> GET admin users:", url);
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Lỗi gateway get admin users:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || {
        message: "Lỗi gateway get admin users",
      });
  }
});

app.post("/api/admin/users", async (req, res) => {
  const url = `${USER_SERVICE_URL}/api/admin/users`;
  try {
    console.log("Gateway -> POST admin user:", url);
    const response = await axios.post(url, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Lỗi gateway admin create user:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || {
        message: "Lỗi gateway admin create",
      });
  }
});

app.patch("/api/admin/users/:id/toggle-active", async (req, res) => {
  const url = `${USER_SERVICE_URL}/api/admin/users/${req.params.id}/toggle-active`;
  try {
    console.log("Gateway -> PATCH toggle active:", url);
    const response = await axios.patch(url);
    res.json(response.data);
  } catch (error) {
    console.error("Lỗi gateway admin toggle:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || {
        message: "Lỗi gateway admin toggle",
      });
  }
});

// 5. Courses
app.get("/api/courses", async (req, res) => {
  const url = `${LEARNING_SERVICE_URL}/api/courses`;
  try {
    console.log("Gateway -> GET courses:", url);
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Lỗi gateway get courses:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || {
        message: "Lỗi gateway get courses",
      });
  }
});

app.post("/api/courses", async (req, res) => {
  const url = `${LEARNING_SERVICE_URL}/api/courses`;
  try {
    console.log("Gateway -> POST course:", url);
    const response = await axios.post(url, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Lỗi gateway create course:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || {
        message: "Lỗi gateway create course",
      });
  }
});

app.put("/api/courses/:id", async (req, res) => {
  const url = `${LEARNING_SERVICE_URL}/api/courses/${req.params.id}`;
  try {
    console.log("Gateway -> PUT course:", url);
    const response = await axios.put(url, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Lỗi gateway update course:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || {
        message: "Lỗi gateway update course",
      });
  }
});

app.delete("/api/courses/:id", async (req, res) => {
  const url = `${LEARNING_SERVICE_URL}/api/courses/${req.params.id}`;
  try {
    console.log("Gateway -> DELETE course:", url);
    const response = await axios.delete(url);
    res.json(response.data);
  } catch (error) {
    console.error("Lỗi gateway delete course:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || {
        message: "Lỗi gateway delete course",
      });
  }
});

// 6. Enrollments
app.post("/api/enrollments", async (req, res) => {
  const url = `${LEARNING_SERVICE_URL}/api/enrollments`;
  try {
    console.log("Gateway -> POST enrollment:", url);
    const response = await axios.post(url, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Lỗi gateway create enrollment:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || {
        message: "Lỗi gateway create enrollment",
      });
  }
});

app.get("/api/enrollments/user/:userId", async (req, res) => {
  const url = `${LEARNING_SERVICE_URL}/api/enrollments/user/${req.params.userId}`;
  try {
    console.log("Gateway -> GET enrollments by user:", url);
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Lỗi gateway get enrollments:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || {
        message: "Lỗi gateway get enrollments",
      });
  }
});

app.get("/api/enrollments/check", async (req, res) => {
  const url = `${LEARNING_SERVICE_URL}/api/enrollments/check`;
  try {
    console.log("Gateway -> GET enrollment check:", url, req.query);
    const response = await axios.get(url, { params: req.query });
    res.json(response.data);
  } catch (error) {
    console.error("Lỗi gateway check enrollment:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || {
        message: "Lỗi gateway check enrollment",
      });
  }
});
// 7. Payments

// Tạo thanh toán mới
app.post("/api/payments", async (req, res) => {
  const url = `${PAYMENT_SERVICE_URL}/api/payments`;
  try {
    console.log("Gateway -> POST payment:", url);
    const response = await axios.post(url, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Lỗi gateway create payment:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || {
        message: "Lỗi gateway create payment",
      });
  }
});

// Lấy lịch sử thanh toán theo userId
// Frontend đang gọi /api/payments/<userId> nên dùng :userId 
app.get("/api/payments/:userId", async (req, res) => {
  const { userId } = req.params;
  const url = `${PAYMENT_SERVICE_URL}/api/payments/${userId}`;
  try {
    console.log("Gateway -> GET payments by user:", url);
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Lỗi gateway get payments:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || {
        message: "Lỗi gateway get payments",
      });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});
