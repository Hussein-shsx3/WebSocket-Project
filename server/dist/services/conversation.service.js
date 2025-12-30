"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationService = exports.ConversationService = void 0;
const db_1 = __importDefault(require("../config/db"));
const error_types_1 = require("../types/error.types");
class ConversationService {
    async getOrCreateConversation(userId, friendId) {
        const friend = await db_1.default.user.findUnique({
            where: { id: friendId },
        });
        if (!friend) {
            throw new error_types_1.NotFoundError("Friend not found");
        }
        const friendship = await db_1.default.friend.findFirst({
            where: {
                OR: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId },
                ],
            },
        });
        if (!friendship) {
            throw new error_types_1.BadRequestError("You must be friends to create a conversation");
        }
        const existingConversation = await db_1.default.conversation.findFirst({
            where: {
                participants: {
                    every: {
                        userId: { in: [userId, friendId] },
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatar: true },
                        },
                    },
                },
                messages: { take: 1, orderBy: { createdAt: "desc" } },
            },
        });
        if (existingConversation) {
            return existingConversation;
        }
        const conversation = await db_1.default.conversation.create({
            data: {
                participants: {
                    createMany: {
                        data: [{ userId }, { userId: friendId }],
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatar: true },
                        },
                    },
                },
                messages: { take: 1, orderBy: { createdAt: "desc" } },
            },
        });
        return conversation;
    }
    async getUserConversations(userId, limit = 20, skip = 0, search) {
        const conversations = await db_1.default.conversation.findMany({
            where: {
                participants: {
                    some: { userId },
                },
                AND: search
                    ? {
                        participants: {
                            some: {
                                user: {
                                    name: { contains: search, mode: "insensitive" },
                                },
                            },
                        },
                    }
                    : {},
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                                status: true,
                            },
                        },
                    },
                },
                messages: { take: 1, orderBy: { createdAt: "desc" } },
            },
            orderBy: {
                lastMessageAt: "desc",
            },
            take: limit,
            skip,
        });
        return conversations;
    }
    async getConversation(conversationId, userId) {
        const conversation = await db_1.default.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                                status: true,
                            },
                        },
                    },
                },
                messages: {
                    take: 50,
                    orderBy: { createdAt: "desc" },
                    include: {
                        sender: { select: { id: true, name: true, avatar: true } },
                    },
                },
            },
        });
        if (!conversation) {
            throw new error_types_1.NotFoundError("Conversation not found");
        }
        const isParticipant = conversation.participants.some((p) => p.userId === userId);
        if (!isParticipant) {
            throw new error_types_1.AuthorizationError("You are not part of this conversation");
        }
        return conversation;
    }
    async getOtherUser(conversationId, userId) {
        const conversation = await db_1.default.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        });
        if (!conversation) {
            throw new error_types_1.NotFoundError("Conversation not found");
        }
        const participant = conversation.participants.find((p) => p.userId === userId);
        if (!participant) {
            throw new error_types_1.AuthorizationError("You are not part of this conversation");
        }
        const otherParticipant = conversation.participants.find((p) => p.userId !== userId);
        if (!otherParticipant) {
            throw new error_types_1.NotFoundError("Other user not found in conversation");
        }
        return otherParticipant.user;
    }
    async archiveConversation(conversationId, userId) {
        const conversation = await db_1.default.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: true,
            },
        });
        if (!conversation) {
            throw new error_types_1.NotFoundError("Conversation not found");
        }
        const isParticipant = conversation.participants.some((p) => p.userId === userId);
        if (!isParticipant) {
            throw new error_types_1.AuthorizationError("You are not part of this conversation");
        }
        const updated = await db_1.default.conversationParticipant.update({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId,
                },
            },
            data: { isArchived: true },
        });
        return updated;
    }
    async unarchiveConversation(conversationId, userId) {
        const conversation = await db_1.default.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: true,
            },
        });
        if (!conversation) {
            throw new error_types_1.NotFoundError("Conversation not found");
        }
        const isParticipant = conversation.participants.some((p) => p.userId === userId);
        if (!isParticipant) {
            throw new error_types_1.AuthorizationError("You are not part of this conversation");
        }
        const updated = await db_1.default.conversationParticipant.update({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId,
                },
            },
            data: { isArchived: false },
        });
        return updated;
    }
    async deleteConversation(conversationId, userId) {
        const conversation = await db_1.default.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: true,
            },
        });
        if (!conversation) {
            throw new error_types_1.NotFoundError("Conversation not found");
        }
        const isParticipant = conversation.participants.some((p) => p.userId === userId);
        if (!isParticipant) {
            throw new error_types_1.AuthorizationError("You are not part of this conversation");
        }
        await db_1.default.messageReaction.deleteMany({
            where: {
                message: { conversationId },
            },
        });
        await db_1.default.messageRead.deleteMany({
            where: {
                message: { conversationId },
            },
        });
        await db_1.default.message.deleteMany({
            where: { conversationId },
        });
        await db_1.default.call.deleteMany({
            where: { conversationId },
        });
        await db_1.default.conversationParticipant.deleteMany({
            where: { conversationId },
        });
        await db_1.default.conversation.delete({
            where: { id: conversationId },
        });
    }
    async updateConversationLastMessage(conversationId) {
        const updated = await db_1.default.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
        });
        return updated;
    }
}
exports.ConversationService = ConversationService;
exports.conversationService = new ConversationService();
//# sourceMappingURL=conversation.service.js.map