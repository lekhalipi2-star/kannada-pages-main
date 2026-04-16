import express from "express";
import { getStories, getStoryById, addStory, updateStory, deleteStory, addFeedback, getFeedback } from "../controllers/storyController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getStories);
router.post("/", verifyToken, upload.single("cover"), addStory);
router.put("/:id", verifyToken, updateStory);
router.delete("/:id", verifyToken, deleteStory);
router.post("/feedback", addFeedback);
router.get("/feedback", verifyToken, getFeedback);
router.get("/:id", getStoryById);

export default router;
