// server/index.js
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors()); // nếu muốn giới hạn domain FE, xem ghi chú bên dưới
app.use(express.json({ limit: "1mb" }));

// Health-check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Route trang chủ để tránh "Cannot GET /"
app.get("/", (req, res) => {
  res.send("Server is up. Try GET /api/health");
});

// Tạo OpenAI client (đang dùng openai@^4.x theo package.json)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // đã set trong Render > Environment
});

/**
 * POST /api/gpt
 * Body:
 * {
 *   "prompt": "string",                  // bắt buộc
 *   "system": "string (optional)",       // mặc định "You are a helpful assistant."
 *   "temperature": number (optional),    // mặc định 0.7
 *   "max_tokens": number (optional),     // mặc định 256
 *   "model": "string (optional)"         // mặc định "gpt-3.5-turbo" hoặc "gpt-4o-mini" (nếu key có)
 * }
 */
app.post("/api/gpt", async (req, res) => {
  try {
    const {
      prompt,
      system = "You are a helpful assistant.",
      temperature = 0.7,
      max_tokens = 256,
      model = "gpt-3.5-turbo", // đổi "gpt-4o-mini" nếu key của bạn có quyền
    } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res
        .status(400)
        .json({ ok: false, error: "Missing 'prompt' (string) in request body." });
    }

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature,
      max_tokens,
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || "";
    res.json({
      ok: true,
      text,
      model: completion.model,
      usage: completion.usage, // token usage
    });
  } catch (err) {
    console.error("GPT error:", err);
    const status = err?.status ?? 500;
    res.status(status).json({ ok: false, error: err?.message || "Server error" });
  }
});

// Port & listen
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
