// aesp-backend/payment-service/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const paymentRoutes = require("./routes/paymentRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://mongo:27017/aesp_payment";

app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Payment service đã kết nối MongoDB");
  })
  .catch((err) => {
    console.error("Không kết nối được MongoDB cho payment:", err.message);
  });

app.get("/", (req, res) => {
  res.send("Payment service is running");
});

app.use("/api/payments", paymentRoutes);

app.listen(PORT, () => {
  console.log(`Payment service chạy trên port ${PORT}`);
});
