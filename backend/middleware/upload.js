import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix dirname (ES module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct uploads path (inside backend)
const uploadDir = path.join(__dirname, "..", "uploads");

// 🔥 FORCE CREATE FOLDER BEFORE ANY UPLOAD
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Uploads folder created at:", uploadDir);
}

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure folder exists AGAIN (extra safety)
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });