"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteConversation = exports.unarchiveConversation = exports.archiveConversation = exports.getOtherUser = exports.getConversation = exports.getUserConversations = exports.getOrCreateConversation = void 0;
const conversation_service_1 = require("../services/conversation.service");
const message_service_1 = require("../services/message.service");
const conversation_dto_1 = require("../dto/conversation.dto");
const response_util_1 = require("../utils/response.util");
const error_types_1 = require("../types/error.types");
const error_middleware_1 = require("../middleware/error.middleware");
exports.getOrCreateConversation = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const { friendId } = conversation_dto_1.getOrCreateConversationSchema.parse(req.body);
    if (friendId === userId) {
        throw new error_types_1.BadRequestError("Cannot start conversation with yourself");
    }
    const conversation = await conversation_service_1.conversationService.getOrCreateConversation(userId, friendId);
    (0, response_util_1.sendResponse)(res, 200, "Conversation retrieved or created", conversation);
});
exports.getUserConversations = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const query = conversation_dto_1.getUserConversationsQuerySchema.parse(req.query || {});
    const limit = query.limit || 20;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const search = query.search;
    const conversations = await conversation_service_1.conversationService.getUserConversations(userId, limit, skip, search);
    (0, response_util_1.sendResponse)(res, 200, "Conversations retrieved", conversations);
});
exports.getConversation = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const { conversationId } = conversation_dto_1.getConversationSchema.parse(req.params);
    const conversation = await conversation_service_1.conversationService.getConversation(conversationId, userId);
    if (!conversation) {
        throw new error_types_1.NotFoundError("Conversation not found");
    }
    await message_service_1.messageService.markMessagesAsRead(conversationId, userId);
    (0, response_util_1.sendResponse)(res, 200, "Conversation retrieved", conversation);
});
exports.getOtherUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const { conversationId } = conversation_dto_1.getConversationSchema.parse(req.params);
    const otherUser = await conversation_service_1.conversationService.getOtherUser(conversationId, userId);
    if (!otherUser) {
        throw new error_types_1.NotFoundError("User not found in this conversation");
    }
    (0, response_util_1.sendResponse)(res, 200, "Other user retrieved", otherUser);
});
exports.archiveConversation = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const { conversationId } = conversation_dto_1.archiveConversationSchema.parse(req.body || {});
    const conversation = await conversation_service_1.conversationService.archiveConversation(conversationId, userId);
    (0, response_util_1.sendResponse)(res, 200, "Conversation archived", conversation);
});
exports.unarchiveConversation = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const { conversationId } = conversation_dto_1.unarchiveConversationSchema.parse(req.body || {});
    const conversation = await conversation_service_1.conversationService.unarchiveConversation(conversationId, userId);
    (0, response_util_1.sendResponse)(res, 200, "Conversation unarchived", conversation);
});
exports.deleteConversation = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const { conversationId } = conversation_dto_1.deleteConversationSchema.parse(req.body || {});
    await conversation_service_1.conversationService.deleteConversation(conversationId, userId);
    (0, response_util_1.sendResponse)(res, 204, "Conversation deleted", null);
});
//# sourceMappingURL=conversation.controller.js.map