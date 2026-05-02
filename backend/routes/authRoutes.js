// backend/routes/authRoutes.js
import express from "express";
import { login, verifySession, createAdmin } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/create-admin", createAdmin);
router.get("/verify", verifyToken, verifySession);

export default router;
