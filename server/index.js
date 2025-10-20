import express from "express";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
// Route trang chủ để tránh "Cannot GET /"
app.get('/', (req, res) => {
  res.send('Server is up. Try GET /api/health');
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
