"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFriendRequest = sendFriendRequest;
exports.acceptFriendRequest = acceptFriendRequest;
exports.rejectFriendRequest = rejectFriendRequest;
exports.cancelFriendRequest = cancelFriendRequest;
exports.getFriendRequests = getFriendRequests;
exports.getFriendRequestsCount = getFriendRequestsCount;
exports.getFriends = getFriends;
exports.getFriendsCount = getFriendsCount;
exports.removeFriend = removeFriend;
const db_1 = __importDefault(require("../config/db"));
const error_types_1 = require("../types/error.types");
async function sendFriendRequest(senderId, receiverId) {
    if (senderId === receiverId) {
        throw new error_types_1.BadRequestError("You cannot send a friend request to yourself");
    }
    const receiver = await db_1.default.user.findUnique({
        where: { id: receiverId },
    });
    if (!receiver) {
        throw new error_types_1.NotFoundError("User not found");
    }
    const existingFriendship = await db_1.default.friend.findFirst({
        where: {
            OR: [
                { userId: senderId, friendId: receiverId },
                { userId: receiverId, friendId: senderId },
            ],
        },
    });
    if (existingFriendship) {
        throw new error_types_1.BadRequestError("You are already friends with this user");
    }
    const pendingRequest = await db_1.default.friendRequest.findFirst({
        where: {
            OR: [
                { senderId, receiverId, status: "PENDING" },
                { senderId: receiverId, receiverId: senderId, status: "PENDING" },
            ],
        },
    });
    if (pendingRequest) {
        if (pendingRequest.senderId === senderId) {
            throw new error_types_1.BadRequestError("Friend request already sent");
        }
        else {
            throw new error_types_1.BadRequestError("This user has already sent you a friend request");
        }
    }
    return db_1.default.friendRequest.upsert({
        where: {
            senderId_receiverId: { senderId, receiverId },
        },
        update: {
            status: "PENDING",
        },
        create: {
            senderId,
            receiverId,
            status: "PENDING",
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
            receiver: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
        },
    });
}
async function acceptFriendRequest(requestId, userId) {
    const request = await db_1.default.friendRequest.findUnique({
        where: { id: requestId },
    });
    if (!request) {
        throw new error_types_1.NotFoundError("Friend request not found");
    }
    if (request.receiverId !== userId) {
        throw new error_types_1.BadRequestError("You can only accept requests sent to you");
    }
    if (request.status === "ACCEPTED") {
        throw new error_types_1.BadRequestError("Friend request already accepted");
    }
    if (request.status === "REJECTED") {
        throw new error_types_1.BadRequestError("Cannot accept a rejected friend request");
    }
    const result = await db_1.default.$transaction(async (tx) => {
        const updatedRequest = await tx.friendRequest.update({
            where: { id: requestId },
            data: { status: "ACCEPTED" },
        });
        const friendship = await tx.friend.create({
            data: {
                userId: request.senderId,
                friendId: request.receiverId,
            },
        });
        return { request: updatedRequest, friendship };
    });
    return result;
}
async function rejectFriendRequest(requestId, userId) {
    const request = await db_1.default.friendRequest.findUnique({
        where: { id: requestId },
    });
    if (!request) {
        throw new error_types_1.NotFoundError("Friend request not found");
    }
    if (request.receiverId !== userId) {
        throw new error_types_1.BadRequestError("You can only reject requests sent to you");
    }
    if (request.status === "REJECTED") {
        throw new error_types_1.BadRequestError("Friend request already rejected");
    }
    if (request.status === "ACCEPTED") {
        throw new error_types_1.BadRequestError("Cannot reject an accepted friend request");
    }
    return db_1.default.friendRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
    });
}
async function cancelFriendRequest(requestId, userId) {
    const request = await db_1.default.friendRequest.findUnique({
        where: { id: requestId },
    });
    if (!request) {
        throw new error_types_1.NotFoundError("Friend request not found");
    }
    if (request.senderId !== userId) {
        throw new error_types_1.BadRequestError("You can only cancel requests you sent");
    }
    if (request.status === "ACCEPTED") {
        throw new error_types_1.BadRequestError("Cannot cancel an accepted friend request");
    }
    await db_1.default.friendRequest.delete({
        where: { id: requestId },
    });
    return { message: "Friend request cancelled successfully" };
}
async function getFriendRequests(userId, type, limit, skip) {
    const isPending = type === "pending";
    return db_1.default.friendRequest.findMany({
        where: {
            ...(isPending ? { receiverId: userId } : { senderId: userId }),
            status: "PENDING",
        },
        include: {
            ...(isPending
                ? {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            bio: true,
                        },
                    },
                }
                : {
                    receiver: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            bio: true,
                        },
                    },
                }),
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
    });
}
async function getFriendRequestsCount(userId, type) {
    const isPending = type === "pending";
    return db_1.default.friendRequest.count({
        where: {
            ...(isPending ? { receiverId: userId } : { senderId: userId }),
            status: "PENDING",
        },
    });
}
async function getFriends(userId, limit, skip, search) {
    const friendships = await db_1.default.friend.findMany({
        where: {
            OR: [{ userId }, { friendId: userId }],
        },
        select: {
            userId: true,
            friendId: true,
        },
    });
    const friendIds = friendships.map((f) => f.userId === userId ? f.friendId : f.userId);
    const whereClause = {
        id: { in: friendIds },
    };
    if (search) {
        whereClause.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
        ];
    }
    return db_1.default.user.findMany({
        where: whereClause,
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            status: true,
        },
        orderBy: { name: "asc" },
        take: limit,
        skip,
    });
}
async function getFriendsCount(userId, search) {
    const friendships = await db_1.default.friend.findMany({
        where: {
            OR: [{ userId }, { friendId: userId }],
        },
        select: {
            userId: true,
            friendId: true,
        },
    });
    const friendIds = friendships.map((f) => f.userId === userId ? f.friendId : f.userId);
    const whereClause = {
        id: { in: friendIds },
    };
    if (search) {
        whereClause.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
        ];
    }
    return db_1.default.user.count({ where: whereClause });
}
async function removeFriend(userId, friendId) {
    const friendship = await db_1.default.friend.findFirst({
        where: {
            OR: [
                { userId, friendId },
                { userId: friendId, friendId: userId },
            ],
        },
    });
    if (!friendship) {
        throw new error_types_1.NotFoundError("Friendship not found");
    }
    await db_1.default.friend.delete({
        where: { id: friendship.id },
    });
    return { message: "Friend removed successfully" };
}
//# sourceMappingURL=friend.service.js.map