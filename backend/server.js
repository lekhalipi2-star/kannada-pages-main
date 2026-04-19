// backend/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";

dotenv.config();

const app = express();

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CORS FIX (IMPORTANT)
app.use(cors({
  origin: [
    "https://lekhalipi.com",
    "https://www.lekhalipi.com"
  ],
  credentials: true
}));

// Middleware
app.use(express.json());

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/stories", storyRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ PORT FIX (CRITICAL FOR RAILWAY)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ✅ GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ error: "Something went wrong" });
});
