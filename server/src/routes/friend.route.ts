import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  sendFriendRequestHandler,
  acceptFriendRequestHandler,
  rejectFriendRequestHandler,
  cancelFriendRequestHandler,
  getFriendRequestsHandler,
  getFriendsHandler,
  removeFriendHandler,
} from "../controllers/friend.controller";

const router = Router();

/**
 * All routes require authentication
 */

// Friend request routes (specific routes first)
router.post("/request", authenticate, sendFriendRequestHandler);
router.patch("/request/:requestId/accept", authenticate, acceptFriendRequestHandler);
router.patch("/request/:requestId/reject", authenticate, rejectFriendRequestHandler);
router.delete("/request/:requestId", authenticate, cancelFriendRequestHandler);

// Get friend requests (with type filter: pending or sent)
router.get("/requests", authenticate, getFriendRequestsHandler);

// Friends list
router.get("/", authenticate, getFriendsHandler);

// Remove friend (dynamic route last)
router.delete("/:friendId", authenticate, removeFriendHandler);

export default router;
