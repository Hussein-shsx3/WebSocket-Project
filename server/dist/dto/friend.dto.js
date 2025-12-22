"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFriendsQuerySchema = exports.getFriendRequestsQuerySchema = exports.removeFriendSchema = exports.friendRequestIdSchema = exports.sendFriendRequestSchema = void 0;
const zod_1 = require("zod");
exports.sendFriendRequestSchema = zod_1.z.object({
    receiverId: zod_1.z.string().min(1, "Receiver ID is required"),
});
exports.friendRequestIdSchema = zod_1.z.object({
    requestId: zod_1.z.string().min(1, "Request ID is required"),
});
exports.removeFriendSchema = zod_1.z.object({
    friendId: zod_1.z.string().min(1, "Friend ID is required"),
});
exports.getFriendRequestsQuerySchema = zod_1.z.object({
    type: zod_1.z.enum(["pending", "sent"]).default("pending"),
    limit: zod_1.z.string().optional().default("10"),
    page: zod_1.z.string().optional().default("1"),
});
exports.getFriendsQuerySchema = zod_1.z.object({
    limit: zod_1.z.string().optional().default("10"),
    page: zod_1.z.string().optional().default("1"),
    search: zod_1.z.string().optional(),
});
//# sourceMappingURL=friend.dto.js.map