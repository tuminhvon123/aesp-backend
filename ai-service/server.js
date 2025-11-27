// aesp-backend/ai-service/server.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5003;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Route cũ (nếu bạn đang dùng ở nơi khác, có thể bỏ qua hoặc giữ nguyên)
app.post("/ai/analyze/text", async (req, res) => {
  try {
    const { text } = req.body;

    if (!OPENAI_API_KEY) {
      return res
        .status(500)
        .json({ message: "Thiếu OPENAI_API_KEY trong biến môi trường" });
    }

    const prompt = `
Bạn là trợ lý tiếng Anh, giúp người học sửa lỗi phát âm, ngữ pháp và gợi ý cách nói tự nhiên hơn.
Hãy phân tích câu sau, chỉ ra lỗi và đưa ra phiên bản đề xuất:
"${text}"
    `;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Bạn là gia sư tiếng Anh thân thiện." },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Lỗi ai analyze:", error.response?.data || error.message);
    res
      .status(500)
      .json({ message: "Lỗi từ ai-service analyze", error: error.message });
  }
});

// Route mới: chat nhiều lượt
app.post("/ai/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!OPENAI_API_KEY) {
      return res
        .status(500)
        .json({ message: "Thiếu OPENAI_API_KEY trong biến môi trường" });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ message: "messages phải là mảng có ít nhất 1 phần tử" });
    }

    // Chèn system message để AI biết vai trò
    const systemMessage = {
      role: "system",
      content:
        "Bạn là gia sư tiếng Anh, nói chuyện thân thiện, giải thích ngắn gọn, giúp người học luyện nói, sửa lỗi phát âm, ngữ pháp và cách dùng từ tự nhiên hơn.",
    };

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [systemMessage, ...messages],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Lỗi ai chat:", error.response?.data || error.message);
    res
      .status(500)
      .json({ message: "Lỗi từ ai-service chat", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`AI service running on port ${PORT}`);
});
