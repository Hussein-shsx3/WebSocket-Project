import { Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  getFriendRequests,
  getFriendRequestsCount,
  getFriends,
  getFriendsCount,
  removeFriend,
} from "../services/friend.service";
import {
  sendFriendRequestSchema,
  getFriendRequestsQuerySchema,
  getFriendsQuerySchema,
} from "../dto/friend.dto";

/**
 * Send a friend request
 * POST /api/v1/friends/request
 */
export const sendFriendRequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Validate request body
    const validationResult = sendFriendRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { receiverId } = validationResult.data;

    const friendRequest = await sendFriendRequest(userId, receiverId);

    res.status(201).json({
      success: true,
      message: "Friend request sent successfully",
      data: friendRequest,
    });
  }
);

/**
 * Accept a friend request
 * PATCH /api/v1/friends/request/:requestId/accept
 */
export const acceptFriendRequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { requestId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const result = await acceptFriendRequest(requestId, userId);

    res.status(200).json({
      success: true,
      message: "Friend request accepted successfully",
      data: result,
    });
  }
);

/**
 * Reject a friend request
 * PATCH /api/v1/friends/request/:requestId/reject
 */
export const rejectFriendRequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { requestId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const result = await rejectFriendRequest(requestId, userId);

    res.status(200).json({
      success: true,
      message: "Friend request rejected successfully",
      data: result,
    });
  }
);

/**
 * Cancel a sent friend request
 * DELETE /api/v1/friends/request/:requestId
 */
export const cancelFriendRequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { requestId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const result = await cancelFriendRequest(requestId, userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }
);

/**
 * Get friend requests (pending or sent)
 * GET /api/v1/friends/requests?type=pending
 * GET /api/v1/friends/requests?type=sent
 */
export const getFriendRequestsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Validate query parameters
    const validationResult = getFriendRequestsQuerySchema.safeParse(req.query);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { type } = validationResult.data;
    const limit = parseInt(validationResult.data.limit, 10);
    const page = parseInt(validationResult.data.page, 10);
    const skip = (page - 1) * limit;

    const requests = await getFriendRequests(userId, type, limit, skip);
    const total = await getFriendRequestsCount(userId, type);

    const message =
      type === "pending"
        ? "Pending friend requests retrieved successfully"
        : "Sent friend requests retrieved successfully";

    res.status(200).json({
      success: true,
      message,
      data: {
        requests,
        type,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }
);

/**
 * Get all friends
 * GET /api/v1/friends
 */
export const getFriendsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Validate query parameters
    const validationResult = getFriendsQuerySchema.safeParse(req.query);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    const limit = parseInt(validationResult.data.limit, 10);
    const page = parseInt(validationResult.data.page, 10);
    const skip = (page - 1) * limit;
    const search = validationResult.data.search;

    const friends = await getFriends(userId, limit, skip, search);
    const total = await getFriendsCount(userId, search);

    res.status(200).json({
      success: true,
      message: "Friends retrieved successfully",
      data: {
        friends,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }
);

/**
 * Remove a friend
 * DELETE /api/v1/friends/:friendId
 */
export const removeFriendHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { friendId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const result = await removeFriend(userId, friendId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }
);