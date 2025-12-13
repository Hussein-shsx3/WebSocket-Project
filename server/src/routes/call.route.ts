import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  initiateCall,
  updateCallStatus,
  endCall,
  declineCall,
  getActiveCall,
  getCallHistory,
  missCall,
} from "../controllers/call.controller";

const router = Router();

/**
 * All routes require authentication
 */

// Initiate a call
router.post("/", authenticate, initiateCall);

// Update call status
router.patch("/status", authenticate, updateCallStatus);

// End call
router.patch("/end", authenticate, endCall);

// Decline call
router.patch("/decline", authenticate, declineCall);

// Miss call
router.patch("/miss", authenticate, missCall);

// Get call history (specific route before dynamic)
router.get("/:conversationId/history", authenticate, getCallHistory);

// Get active call in conversation (dynamic route last)
router.get("/:conversationId", authenticate, getActiveCall);

export default router;
