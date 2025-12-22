import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  getOrCreateConversation,
  getUserConversations,
  getConversation,
  getOtherUser,
  archiveConversation,
  unarchiveConversation,
  deleteConversation,
} from "../controllers/conversation.controller";

const router = Router();

/**
 * All routes require authentication
 */

// Create or get existing conversation with a friend
router.post("/", authenticate, getOrCreateConversation);

// Get all conversations for the user
router.get("/", authenticate, getUserConversations);

// Archive conversation
router.patch("/archive", authenticate, archiveConversation);

// Unarchive conversation
router.patch("/unarchive", authenticate, unarchiveConversation);

// Delete conversation
router.delete("/", authenticate, deleteConversation);

// Get other user in conversation (specific route before dynamic)
router.get("/:conversationId/user", authenticate, getOtherUser);

// Get single conversation (dynamic route last)
router.get("/:conversationId", authenticate, getConversation);

export default router;
