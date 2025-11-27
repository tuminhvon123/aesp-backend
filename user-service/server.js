// aesp-backend/user-service/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/aesp_user";

// Admin duy nhất
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123";

app.use(cors());
app.use(express.json());

/* ==========================
   1. SCHEMA
========================== */

// User
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // demo, chưa hash
  role: {
    type: String,
    enum: ["learner", "mentor", "admin"],
    default: "learner",
  },
  isActive: { type: Boolean, default: true },
  skills: { type: [String], default: [] }, // dùng cho mentor
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Support ticket
const supportTicketSchema = new mongoose.Schema({
  userId: { type: String, required: false },
  username: { type: String, required: false },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ["open", "in_progress", "resolved"],
    default: "open",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);

// Feedback
const feedbackSchema = new mongoose.Schema({
  courseId: { type: Number, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

// Policy
const policySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // vd: terms, privacy
  title: { type: String, required: true },
  content: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

const Policy = mongoose.model("Policy", policySchema);

/* ==========================
   2. KẾT NỐI DB + TẠO ADMIN
========================== */

async function ensureAdminUser() {
  const existingAdmin = await User.findOne({ role: "admin" });

  if (!existingAdmin) {
    const admin = new User({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      role: "admin",
      isActive: true,
    });
    await admin.save();
    console.log(`Đã tạo admin mặc định: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}`);
  } else {
    console.log(`Đã tồn tại admin: ${existingAdmin.username}`);
  }
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("User Service: Đã kết nối MongoDB");
    await ensureAdminUser();
  })
  .catch((err) => {
    console.error("User Service: Lỗi kết nối MongoDB", err);
  });

/* ==========================
   3. HELPER
========================== */

const sanitizeUser = (user) => ({
  _id: user._id,
  username: user.username,
  role: user.role,
  isActive: user.isActive,
  skills: user.skills,
  createdAt: user.createdAt,
});

/* ==========================
   4. AUTH: REGISTER / LOGIN
========================== */

// Đăng ký - luôn là learner
app.post("/api/users/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Vui lòng nhập tên đăng nhập và mật khẩu" });
    }

    // Không cho đăng ký trùng admin
    if (username === ADMIN_USERNAME) {
      return res
        .status(403)
        .json({ error: "Không thể đăng ký tài khoản admin" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Tài khoản đã tồn tại" });
    }

    const newUser = new User({
      username,
      password,
      role: "learner",
    });

    await newUser.save();

    res.status(201).json({
      message: "Đăng ký thành công",
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ error: "Lỗi server khi đăng ký" });
  }
});

// Đăng nhập
app.post("/api/users/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res
        .status(400)
        .json({ error: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.",
      });
    }

    res.json({
      message: "Đăng nhập thành công",
      token: "fake-jwt-token-" + user._id,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ error: "Lỗi server khi đăng nhập" });
  }
});

/* ==========================
   5. ADMIN - USER MANAGEMENT
========================== */

// Danh sách user
app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Lỗi lấy danh sách user:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách user" });
  }
});

// Tạo user (learner hoặc mentor)
app.post("/api/admin/users", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res
        .status(400)
        .json({ error: "Vui lòng nhập đầy đủ username, password, role" });
    }

    if (role === "admin") {
      return res
        .status(403)
        .json({ error: "Không thể tạo thêm tài khoản admin" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: "Tài khoản đã tồn tại" });
    }

    const newUser = new User({
      username,
      password,
      role: role === "mentor" ? "mentor" : "learner",
    });

    await newUser.save();

    res.status(201).json(sanitizeUser(newUser));
  } catch (error) {
    console.error("Lỗi admin tạo user:", error);
    res.status(500).json({ error: "Lỗi khi admin tạo user" });
  }
});

// Xóa user (không cho xóa admin)
app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    if (user.role === "admin") {
      return res
        .status(403)
        .json({ error: "Không được xóa tài khoản admin" });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: "Đã xóa người dùng thành công" });
  } catch (error) {
    console.error("Lỗi xóa user:", error);
    res.status(500).json({ error: "Lỗi khi xóa người dùng" });
  }
});

// Kích hoạt / vô hiệu hóa tài khoản
app.patch("/api/admin/users/:id/toggle-active", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    if (user.role === "admin") {
      return res
        .status(403)
        .json({ error: "Không thể vô hiệu hóa tài khoản admin" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: "Cập nhật trạng thái thành công",
      isActive: user.isActive,
    });
  } catch (error) {
    console.error("Lỗi toggle active:", error);
    res.status(500).json({ error: "Lỗi cập nhật trạng thái tài khoản" });
  }
});

/* ==========================
   6. ADMIN - MENTOR & SKILLS
========================== */

// Danh sách mentor
app.get("/api/admin/mentors", async (req, res) => {
  try {
    const mentors = await User.find(
      { role: "mentor" },
      "-password"
    ).sort({ createdAt: -1 });

    res.json(mentors);
  } catch (error) {
    console.error("Lỗi lấy danh sách mentor:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách mentor" });
  }
});

// Cập nhật kỹ năng mentor
app.put("/api/admin/mentors/:id/skills", async (req, res) => {
  try {
    const { id } = req.params;
    const { skills } = req.body;

    const mentor = await User.findById(id);
    if (!mentor || mentor.role !== "mentor") {
      return res.status(404).json({ error: "Không tìm thấy mentor" });
    }

    mentor.skills = Array.isArray(skills)
      ? skills.map((s) => String(s).trim()).filter(Boolean)
      : [];
    await mentor.save();

    res.json({
      message: "Cập nhật kỹ năng thành công",
      skills: mentor.skills,
    });
  } catch (error) {
    console.error("Lỗi cập nhật kỹ năng:", error);
    res.status(500).json({ error: "Lỗi cập nhật kỹ năng mentor" });
  }
});

/* ==========================
   7. SUPPORT TICKETS
========================== */

// Học viên gửi ticket
app.post("/api/support/tickets", async (req, res) => {
  try {
    const { userId, username, subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ nội dung" });
    }

    const ticket = new SupportTicket({
      userId,
      username,
      subject,
      message,
    });
    await ticket.save();

    res.status(201).json(ticket);
  } catch (error) {
    console.error("Lỗi tạo ticket:", error);
    res.status(500).json({ error: "Lỗi tạo ticket hỗ trợ" });
  }
});

// Học viên xem ticket của mình
app.get("/api/support/my/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const tickets = await SupportTicket.find({ userId }).sort({
      createdAt: -1,
    });
    res.json(tickets);
  } catch (error) {
    console.error("Lỗi lấy ticket:", error);
    res.status(500).json({ error: "Lỗi lấy ticket hỗ trợ" });
  }
});

// Admin xem tất cả ticket
app.get("/api/admin/support/tickets", async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const tickets = await SupportTicket.find(query).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    console.error("Lỗi lấy ticket admin:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách ticket" });
  }
});

// Admin đổi trạng thái ticket
app.patch("/api/admin/support/tickets/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["open", "in_progress", "resolved"].includes(status)) {
      return res.status(400).json({ error: "Trạng thái không hợp lệ" });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: "Không tìm thấy ticket" });
    }

    ticket.status = status;
    ticket.updatedAt = new Date();
    await ticket.save();

    res.json({ message: "Cập nhật ticket thành công", ticket });
  } catch (error) {
    console.error("Lỗi cập nhật ticket:", error);
    res.status(500).json({ error: "Lỗi cập nhật ticket" });
  }
});

/* ==========================
   8. FEEDBACK & COMMENT
========================== */

// Học viên gửi feedback
app.post("/api/feedback", async (req, res) => {
  try {
    const { courseId, userId, username, rating, comment } = req.body;

    if (!courseId || !userId || !username || !rating || !comment) {
      return res.status(400).json({ error: "Thiếu thông tin feedback" });
    }

    const feedback = new Feedback({
      courseId,
      userId,
      username,
      rating,
      comment,
    });
    await feedback.save();

    res.status(201).json({
      message: "Gửi feedback thành công, đợi admin kiểm duyệt",
    });
  } catch (error) {
    console.error("Lỗi gửi feedback:", error);
    res.status(500).json({ error: "Lỗi gửi feedback" });
  }
});

// Lấy feedback đã được duyệt theo khóa học
app.get("/api/feedback/course/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const list = await Feedback.find({
      courseId: Number(courseId),
      isApproved: true,
    }).sort({ createdAt: -1 });

    res.json(list);
  } catch (error) {
    console.error("Lỗi lấy feedback:", error);
    res.status(500).json({ error: "Lỗi lấy feedback" });
  }
});

// Admin xem feedback chờ duyệt
app.get("/api/admin/feedback/pending", async (req, res) => {
  try {
    const list = await Feedback.find({ isApproved: false }).sort({
      createdAt: -1,
    });
    res.json(list);
  } catch (error) {
    console.error("Lỗi lấy feedback pending:", error);
    res.status(500).json({ error: "Lỗi lấy feedback chờ duyệt" });
  }
});

// Admin duyệt feedback
app.patch("/api/admin/feedback/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const fb = await Feedback.findById(id);
    if (!fb) {
      return res.status(404).json({ error: "Không tìm thấy feedback" });
    }
    fb.isApproved = true;
    await fb.save();
    res.json({ message: "Đã duyệt feedback" });
  } catch (error) {
    console.error("Lỗi duyệt feedback:", error);
    res.status(500).json({ error: "Lỗi duyệt feedback" });
  }
});

/* ==========================
   9. POLICIES
========================== */

// Public - lấy policy theo key
app.get("/api/policies/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const p = await Policy.findOne({ key });
    if (!p) {
      return res.status(404).json({ error: "Không tìm thấy policy" });
    }
    res.json(p);
  } catch (error) {
    console.error("Lỗi lấy policy:", error);
    res.status(500).json({ error: "Lỗi lấy policy" });
  }
});

// Admin - danh sách policy
app.get("/api/admin/policies", async (req, res) => {
  try {
    const list = await Policy.find({}).sort({ updatedAt: -1 });
    res.json(list);
  } catch (error) {
    console.error("Lỗi lấy danh sách policy:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách policy" });
  }
});

// Admin - tạo policy
app.post("/api/admin/policies", async (req, res) => {
  try {
    const { key, title, content } = req.body;

    if (!key || !title || !content) {
      return res.status(400).json({ error: "Thiếu thông tin policy" });
    }

    const existing = await Policy.findOne({ key });
    if (existing) {
      return res.status(400).json({ error: "Key policy đã tồn tại" });
    }

    const p = new Policy({ key, title, content, updatedAt: new Date() });
    await p.save();

    res.status(201).json(p);
  } catch (error) {
    console.error("Lỗi tạo policy:", error);
    res.status(500).json({ error: "Lỗi tạo policy" });
  }
});

// Admin - cập nhật policy
app.put("/api/admin/policies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const p = await Policy.findById(id);
    if (!p) {
      return res.status(404).json({ error: "Không tìm thấy policy" });
    }

    p.title = title ?? p.title;
    p.content = content ?? p.content;
    p.updatedAt = new Date();
    await p.save();

    res.json(p);
  } catch (error) {
    console.error("Lỗi cập nhật policy:", error);
    res.status(500).json({ error: "Lỗi cập nhật policy" });
  }
});

// Admin - xóa policy
app.delete("/api/admin/policies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Policy.findByIdAndDelete(id);
    res.json({ message: "Đã xóa policy" });
  } catch (error) {
    console.error("Lỗi xóa policy:", error);
    res.status(500).json({ error: "Lỗi xóa policy" });
  }
});

/* ==========================
   10. STATS
========================== */

app.get("/api/admin/stats/overview", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLearners = await User.countDocuments({ role: "learner" });
    const totalMentors = await User.countDocuments({ role: "mentor" });
    const totalActive = await User.countDocuments({ isActive: true });

    res.json({
      totalUsers,
      totalLearners,
      totalMentors,
      totalActive,
    });
  } catch (error) {
    console.error("Lỗi stats:", error);
    res.status(500).json({ error: "Lỗi lấy thống kê" });
  }
});

/* ==========================
   11. SERVER
========================== */

app.get("/", (req, res) => {
  res.send("User Service is running");
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
