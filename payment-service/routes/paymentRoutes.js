// aesp-backend/payment-service/routes/paymentRoutes.js
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    packageName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "VND" },
    method: { type: String, default: "bank_transfer" },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "success",
    },
    transactionId: { type: String, required: true },
  },
  { timestamps: true }
);

const Payment =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

router.get("/health", (req, res) => {
  res.json({ ok: true });
});

router.get("/", async (req, res) => {
  try {
    const list = await Payment.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error("Lỗi lấy danh sách thanh toán:", err);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách thanh toán", error: err });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const list = await Payment.find({ userId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error("Lỗi lấy thanh toán theo user:", err);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy lịch sử thanh toán", error: err });
  }
});

router.post("/", async (req, res) => {
  try {
    const { userId, packageName, amount, currency, method } = req.body;

    if (!userId || !packageName || !amount) {
      return res.status(400).json({
        message: "Thiếu userId, packageName hoặc amount",
      });
    }

    const txId = "TX" + Date.now();

    const payment = new Payment({
      userId,
      packageName,
      amount,
      currency: currency || "VND",
      method: method || "bank_transfer",
      status: "success",
      transactionId: txId,
    });

    await payment.save();

    res.json({ success: true, payment });
  } catch (err) {
    console.error("Lỗi tạo thanh toán:", err);
    res
      .status(500)
      .json({ message: "Lỗi khi tạo thanh toán mới", error: err });
  }
});

module.exports = router;
