"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFriendHandler = exports.getFriendsHandler = exports.getFriendRequestsHandler = exports.cancelFriendRequestHandler = exports.rejectFriendRequestHandler = exports.acceptFriendRequestHandler = exports.sendFriendRequestHandler = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const friend_service_1 = require("../services/friend.service");
const friend_dto_1 = require("../dto/friend.dto");
exports.sendFriendRequestHandler = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const validationResult = friend_dto_1.sendFriendRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({
            message: "Validation failed",
            errors: validationResult.error.flatten().fieldErrors,
        });
        return;
    }
    const { receiverId } = validationResult.data;
    const friendRequest = await (0, friend_service_1.sendFriendRequest)(userId, receiverId);
    res.status(201).json({
        message: "Friend request sent successfully",
        data: friendRequest,
    });
});
exports.acceptFriendRequestHandler = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    const { requestId } = req.params;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const result = await (0, friend_service_1.acceptFriendRequest)(requestId, userId);
    res.status(200).json({
        message: "Friend request accepted successfully",
        data: result,
    });
});
exports.rejectFriendRequestHandler = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    const { requestId } = req.params;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const result = await (0, friend_service_1.rejectFriendRequest)(requestId, userId);
    res.status(200).json({
        message: "Friend request rejected successfully",
        data: result,
    });
});
exports.cancelFriendRequestHandler = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    const { requestId } = req.params;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const result = await (0, friend_service_1.cancelFriendRequest)(requestId, userId);
    res.status(200).json(result);
});
exports.getFriendRequestsHandler = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const validationResult = friend_dto_1.getFriendRequestsQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
        res.status(400).json({
            message: "Validation failed",
            errors: validationResult.error.flatten().fieldErrors,
        });
        return;
    }
    const { type } = validationResult.data;
    const limit = parseInt(validationResult.data.limit, 10);
    const page = parseInt(validationResult.data.page, 10);
    const skip = (page - 1) * limit;
    const requests = await (0, friend_service_1.getFriendRequests)(userId, type, limit, skip);
    const total = await (0, friend_service_1.getFriendRequestsCount)(userId, type);
    const message = type === "pending"
        ? "Pending friend requests retrieved successfully"
        : "Sent friend requests retrieved successfully";
    res.status(200).json({
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
});
exports.getFriendsHandler = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const validationResult = friend_dto_1.getFriendsQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
        res.status(400).json({
            message: "Validation failed",
            errors: validationResult.error.flatten().fieldErrors,
        });
        return;
    }
    const limit = parseInt(validationResult.data.limit, 10);
    const page = parseInt(validationResult.data.page, 10);
    const skip = (page - 1) * limit;
    const search = validationResult.data.search;
    const friends = await (0, friend_service_1.getFriends)(userId, limit, skip, search);
    const total = await (0, friend_service_1.getFriendsCount)(userId, search);
    res.status(200).json({
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
});
exports.removeFriendHandler = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    const { friendId } = req.params;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const result = await (0, friend_service_1.removeFriend)(userId, friendId);
    res.status(200).json(result);
});
//# sourceMappingURL=friend.controller.js.map