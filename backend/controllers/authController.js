// backend/controllers/authController.js
import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export const createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json("Username & password required");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ FULL HASH GENERATED:", hashedPassword);
    db.query(
      "INSERT INTO admin (username, password) VALUES (?, ?)",
      [username, hashedPassword],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json("DB Error");
        }
        res.json("✅ Admin created successfully");
      }
    );
  } catch (err) {
    res.status(500).json(err);
  }
};

export const login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json("Username & password required");
  }
  db.query(
    "SELECT * FROM admin WHERE username = ?",
    [username],
    async (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0)
        return res.status(404).json("User not found");
      const admin = result[0];
      console.log("👉 STORED PASSWORD:", admin.password);
      const isMatch = await bcrypt.compare(password, admin.password);
      console.log("👉 MATCH RESULT:", isMatch);
      if (!isMatch)
        return res.status(400).json("Wrong username or password");
      const token = jwt.sign({ id: admin.id }, JWT_SECRET, {
        expiresIn: "12h",
      });
      res.json({ token });
    }
  );
};

export const verifySession = (req, res) => {
  res.json({ ok: true });
};
