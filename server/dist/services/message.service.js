"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageService = exports.MessageService = void 0;
const db_1 = __importDefault(require("../config/db"));
const error_types_1 = require("../types/error.types");
class MessageService {
    async sendMessage(conversationId, senderId, content, type, mediaUrls) {
        const conversation = await db_1.default.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: true,
            },
        });
        if (!conversation) {
            throw new error_types_1.NotFoundError("Conversation not found");
        }
        const isParticipant = conversation.participants.some((p) => p.userId === senderId);
        if (!isParticipant) {
            throw new error_types_1.AuthorizationError("You are not part of this conversation");
        }
        const message = await db_1.default.message.create({
            data: {
                conversationId,
                senderId,
                content,
                type: (type || "TEXT"),
                mediaUrls: mediaUrls || [],
                status: "SENT",
            },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
            },
        });
        await db_1.default.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
        });
        return message;
    }
    async getMessages(conversationId, limit = 20, skip = 0) {
        const conversation = await db_1.default.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new error_types_1.NotFoundError("Conversation not found");
        }
        const messages = await db_1.default.message.findMany({
            where: { conversationId },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
                readBy: { select: { userId: true, readAt: true } },
                reactions: { select: { emoji: true, userId: true } },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip,
        });
        return messages;
    }
    async editMessage(messageId, userId, newContent) {
        const message = await db_1.default.message.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            throw new error_types_1.NotFoundError("Message not found");
        }
        if (message.senderId !== userId) {
            throw new error_types_1.AuthorizationError("You can only edit your own messages");
        }
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (message.createdAt < fiveMinutesAgo) {
            throw new error_types_1.BadRequestError("Message can only be edited within 5 minutes of sending");
        }
        const updated = await db_1.default.message.update({
            where: { id: messageId },
            data: {
                content: newContent,
                isEdited: true,
                editedAt: new Date(),
                editedContent: message.content,
            },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
                reactions: { select: { emoji: true, userId: true } },
            },
        });
        return updated;
    }
    async deleteMessage(messageId, userId) {
        const message = await db_1.default.message.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            throw new error_types_1.NotFoundError("Message not found");
        }
        if (message.senderId !== userId) {
            throw new error_types_1.AuthorizationError("You can only delete your own messages");
        }
        await db_1.default.message.delete({
            where: { id: messageId },
        });
        return { success: true, message: "Message deleted" };
    }
    async markMessagesAsRead(conversationId, userId) {
        const conversation = await db_1.default.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new error_types_1.NotFoundError("Conversation not found");
        }
        const unreadMessages = await db_1.default.message.findMany({
            where: {
                conversationId,
                senderId: { not: userId },
            },
            select: { id: true },
        });
        if (unreadMessages.length === 0) {
            return;
        }
        await db_1.default.messageRead.createMany({
            data: unreadMessages.map((msg) => ({
                messageId: msg.id,
                userId,
                readAt: new Date(),
            })),
            skipDuplicates: true,
        });
    }
    async getMessageReadReceipts(messageId) {
        const message = await db_1.default.message.findUnique({
            where: { id: messageId },
            include: {
                readBy: {
                    include: {
                        user: { select: { id: true, name: true, avatar: true } },
                    },
                },
            },
        });
        if (!message) {
            throw new error_types_1.NotFoundError("Message not found");
        }
        return message.readBy;
    }
    async reactToMessage(messageId, userId, emoji) {
        const message = await db_1.default.message.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            throw new error_types_1.NotFoundError("Message not found");
        }
        const conversation = await db_1.default.conversation.findUnique({
            where: { id: message.conversationId },
            include: {
                participants: true,
            },
        });
        if (!conversation) {
            throw new error_types_1.NotFoundError("Conversation not found");
        }
        const isParticipant = conversation.participants.some((p) => p.userId === userId);
        if (!isParticipant) {
            throw new error_types_1.AuthorizationError("You are not a member of this conversation");
        }
        const existingReaction = await db_1.default.messageReaction.findUnique({
            where: {
                messageId_userId_emoji: {
                    messageId,
                    userId,
                    emoji,
                },
            },
        });
        if (existingReaction) {
            await db_1.default.messageReaction.delete({
                where: {
                    messageId_userId_emoji: {
                        messageId,
                        userId,
                        emoji,
                    },
                },
            });
            return { removed: true };
        }
        const reaction = await db_1.default.messageReaction.create({
            data: {
                messageId,
                userId,
                emoji,
            },
        });
        return reaction;
    }
    async getMessageReactions(messageId) {
        const message = await db_1.default.message.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            throw new error_types_1.NotFoundError("Message not found");
        }
        const reactions = await db_1.default.messageReaction.findMany({
            where: { messageId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });
        const grouped = reactions.reduce((acc, reaction) => {
            if (!acc[reaction.emoji]) {
                acc[reaction.emoji] = [];
            }
            acc[reaction.emoji].push({
                userId: reaction.user.id,
                userName: reaction.user.name,
                userAvatar: reaction.user.avatar,
            });
            return acc;
        }, {});
        return grouped;
    }
    async removeReaction(messageId, userId, emoji) {
        const reaction = await db_1.default.messageReaction.findUnique({
            where: {
                messageId_userId_emoji: {
                    messageId,
                    userId,
                    emoji,
                },
            },
        });
        if (!reaction) {
            throw new error_types_1.NotFoundError("Reaction not found");
        }
        await db_1.default.messageReaction.delete({
            where: { id: reaction.id },
        });
        return { success: true, message: "Reaction removed" };
    }
    async searchMessages(conversationId, searchText) {
        const conversation = await db_1.default.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new error_types_1.NotFoundError("Conversation not found");
        }
        const messages = await db_1.default.message.findMany({
            where: {
                conversationId,
                content: {
                    contains: searchText,
                    mode: "insensitive",
                },
            },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
                reactions: { select: { emoji: true, userId: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
        return messages;
    }
}
exports.MessageService = MessageService;
exports.messageService = new MessageService();
//# sourceMappingURL=message.service.js.map