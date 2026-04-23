import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$/;

export const createAdmin = async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  console.log("FULL HASH:", hashedPassword);

  db.query(
    "INSERT INTO admin (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json("Admin created");
    }
  );
};

export const login = (req, res) => {
  const { username, password } = req.body;

  db.query("SELECT * FROM admin WHERE username = ?", [username], async (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json("User not found");

    const admin = result[0];

    const isStoredAsHash = BCRYPT_HASH_PATTERN.test(admin.password || "");
    const isMatch = isStoredAsHash
      ? await bcrypt.compare(password, admin.password)
      : password === admin.password;
    if (!isMatch) return res.status(400).json("Wrong password");

    const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: "12h" });

    res.json({ token });
  });
};

export const verifySession = (_req, res) => {
  res.json({ ok: true });
};
