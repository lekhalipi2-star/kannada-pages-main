import express from "express";
import { login, verifySession } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/create-admin", createAdmin); // use once
router.post("/login", login);
router.get("/verify", verifyToken, verifySession);

export default router;
