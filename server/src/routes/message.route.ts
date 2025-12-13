import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
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
} from "../controllers/message.controller";

const router = Router();

/**
 * All routes require authentication
 * Order matters! Specific routes before dynamic routes
 */

// Mark messages as read (MUST be before /:conversationId)
router.post("/mark-as-read", authenticate, markAsRead);
router.patch("/mark-read", authenticate, markAsRead);

// Search messages (MUST be before /:messageId)
router.get("/search", authenticate, searchMessages);

// React to message
router.post("/react", authenticate, reactToMessage);

// Remove reaction
router.delete("/react", authenticate, removeReaction);

// Edit message
router.patch("/edit", authenticate, editMessage);

// Get reactions for a message (MUST be before /:conversationId)
router.get("/:messageId/reactions", authenticate, getReactions);

// Get read receipts for a message (MUST be before /:conversationId)
router.get("/:messageId/read-receipts", authenticate, getReadReceipts);

// Send message
router.post("/", authenticate, sendMessage);

// Delete message (soft delete)
router.delete("/", authenticate, deleteMessage);

// Get messages in conversation (dynamic route - LAST)
router.get("/:conversationId", authenticate, getMessages);

export default router;
