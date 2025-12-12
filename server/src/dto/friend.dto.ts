import { z } from "zod";

/**
 * Send Friend Request DTO
 * Used when sending a friend request to another user
 */
export const sendFriendRequestSchema = z.object({
  receiverId: z.string().min(1, "Receiver ID is required"),
});

export type SendFriendRequestDTO = z.infer<typeof sendFriendRequestSchema>;

/**
 * Friend Request ID Param DTO
 * Used for accept/reject/cancel operations
 */
export const friendRequestIdSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
});

export type FriendRequestIdDTO = z.infer<typeof friendRequestIdSchema>;

/**
 * Remove Friend DTO
 * Used when removing a friend
 */
export const removeFriendSchema = z.object({
  friendId: z.string().min(1, "Friend ID is required"),
});

export type RemoveFriendDTO = z.infer<typeof removeFriendSchema>;

/**
 * Get Friend Requests Query DTO
 * Used for pagination when fetching friend requests
 */
export const getFriendRequestsQuerySchema = z.object({
  type: z.enum(["pending", "sent"]).default("pending"),
  limit: z.string().optional().default("10"),
  page: z.string().optional().default("1"),
});

export type GetFriendRequestsQueryDTO = z.infer<typeof getFriendRequestsQuerySchema>;

/**
 * Get Friends Query DTO
 * Used for pagination when fetching friends list
 */
export const getFriendsQuerySchema = z.object({
  limit: z.string().optional().default("10"),
  page: z.string().optional().default("1"),
  search: z.string().optional(),
});

export type GetFriendsQueryDTO = z.infer<typeof getFriendsQuerySchema>;