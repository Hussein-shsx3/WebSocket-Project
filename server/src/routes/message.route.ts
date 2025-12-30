import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  markAsRead,
  getReadReceipts,
  reactToMessage,
  removeReaction,
  getReactions,
  searchMessages,
  uploadMessageMedia,
} from "../controllers/message.controller";

// REORDER specific routes BEFORE dynamic routes

const router = Router();

// ✅ SPECIFIC ROUTES FIRST
router.post("/upload", authenticate, upload.single("file"), uploadMessageMedia);
router.post("/mark-as-read", authenticate, markAsRead);
router.get("/search", authenticate, searchMessages);
router.post("/react", authenticate, reactToMessage);
router.delete("/react", authenticate, removeReaction);
router.patch("/edit", authenticate, editMessage);

// ✅ THEN PARAMETERIZED ROUTES
router.get("/:messageId/reactions", authenticate, getReactions);
router.get("/:messageId/read-receipts", authenticate, getReadReceipts);

// ✅ FINALLY GENERIC ROUTES
router.post("/", authenticate, sendMessage);
router.delete("/", authenticate, deleteMessage);
router.get("/:conversationId", authenticate, getMessages);

export default router;
