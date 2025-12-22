"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchMessages = exports.getReactions = exports.removeReaction = exports.reactToMessage = exports.getReadReceipts = exports.markAsRead = exports.deleteMessage = exports.editMessage = exports.getMessages = exports.sendMessage = void 0;
const message_service_1 = require("../services/message.service");
const message_dto_1 = require("../dto/message.dto");
const response_util_1 = require("../utils/response.util");
const error_types_1 = require("../types/error.types");
const error_middleware_1 = require("../middleware/error.middleware");
exports.sendMessage = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const payload = message_dto_1.sendMessageSchema.parse(req.body);
    const message = await message_service_1.messageService.sendMessage(payload.conversationId, userId, payload.content, payload.type, payload.mediaUrls);
    (0, response_util_1.sendResponse)(res, 201, "Message sent", message);
});
exports.getMessages = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const { conversationId } = req.params;
    const limit = Number(req.query.limit) || 20;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const messages = await message_service_1.messageService.getMessages(conversationId, limit, skip);
    (0, response_util_1.sendResponse)(res, 200, "Messages retrieved", messages);
});
exports.editMessage = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const payload = message_dto_1.editMessageSchema.parse(req.body);
    const message = await message_service_1.messageService.editMessage(payload.messageId, userId, payload.newContent);
    (0, response_util_1.sendResponse)(res, 200, "Message edited", message);
});
exports.deleteMessage = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const payload = message_dto_1.deleteMessageSchema.parse(req.body);
    await message_service_1.messageService.deleteMessage(payload.messageId, userId);
    (0, response_util_1.sendResponse)(res, 204, "Message deleted", null);
});
exports.markAsRead = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const payload = message_dto_1.markAsReadSchema.parse(req.body);
    await message_service_1.messageService.markMessagesAsRead(payload.conversationId, userId);
    (0, response_util_1.sendResponse)(res, 200, "Messages marked as read", null);
});
exports.getReadReceipts = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const { messageId } = req.params;
    const receipts = await message_service_1.messageService.getMessageReadReceipts(messageId);
    (0, response_util_1.sendResponse)(res, 200, "Read receipts retrieved", receipts);
});
exports.reactToMessage = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const payload = message_dto_1.reactToMessageSchema.parse(req.body);
    const reaction = await message_service_1.messageService.reactToMessage(payload.messageId, userId, payload.emoji);
    (0, response_util_1.sendResponse)(res, 201, "Reaction added", reaction);
});
exports.removeReaction = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const payload = message_dto_1.removeReactionSchema.parse(req.body);
    await message_service_1.messageService.removeReaction(payload.messageId, userId, payload.emoji);
    (0, response_util_1.sendResponse)(res, 204, "Reaction removed", null);
});
exports.getReactions = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { messageId } = req.params;
    const reactions = await message_service_1.messageService.getMessageReactions(messageId);
    (0, response_util_1.sendResponse)(res, 200, "Reactions retrieved", reactions);
});
exports.searchMessages = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const { conversationId, q } = req.query;
    if (!q || typeof q !== "string") {
        throw new error_types_1.BadRequestError("Search query required");
    }
    if (!conversationId || typeof conversationId !== "string") {
        throw new error_types_1.BadRequestError("Conversation ID required");
    }
    const messages = await message_service_1.messageService.searchMessages(conversationId, q);
    (0, response_util_1.sendResponse)(res, 200, "Messages found", messages);
});
//# sourceMappingURL=message.controller.js.map