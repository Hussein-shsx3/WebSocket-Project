"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missCall = exports.getCallHistory = exports.getActiveCall = exports.declineCall = exports.endCall = exports.updateCallStatus = exports.initiateCall = void 0;
const call_service_1 = require("../services/call.service");
const response_util_1 = require("../utils/response.util");
const error_types_1 = require("../types/error.types");
const error_middleware_1 = require("../middleware/error.middleware");
exports.initiateCall = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const { conversationId, receiverId, callType } = req.body;
    if (!conversationId || !receiverId || !callType) {
        throw new error_types_1.BadRequestError("conversationId, receiverId, and callType are required");
    }
    if (!["AUDIO", "VIDEO"].includes(callType)) {
        throw new error_types_1.BadRequestError("callType must be AUDIO or VIDEO");
    }
    const call = await call_service_1.callService.initiateCall(conversationId, userId, receiverId, callType);
    (0, response_util_1.sendResponse)(res, 201, "Call initiated", call);
});
exports.updateCallStatus = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const { callId, status } = req.body;
    if (!callId || !status) {
        throw new error_types_1.BadRequestError("callId and status are required");
    }
    const validStatuses = [
        "INITIATING",
        "RINGING",
        "ACTIVE",
        "ENDED",
        "DECLINED",
        "MISSED",
        "CANCELED",
    ];
    if (!validStatuses.includes(status)) {
        throw new error_types_1.BadRequestError(`status must be one of: ${validStatuses.join(", ")}`);
    }
    const call = await call_service_1.callService.updateCallStatus(callId, status);
    (0, response_util_1.sendResponse)(res, 200, "Call status updated", call);
});
exports.endCall = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const { callId } = req.body;
    if (!callId) {
        throw new error_types_1.BadRequestError("callId is required");
    }
    const call = await call_service_1.callService.endCall(callId);
    (0, response_util_1.sendResponse)(res, 200, "Call ended", call);
});
exports.declineCall = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const { callId } = req.body;
    if (!callId) {
        throw new error_types_1.BadRequestError("callId is required");
    }
    const call = await call_service_1.callService.declineCall(callId);
    (0, response_util_1.sendResponse)(res, 200, "Call declined", call);
});
exports.getActiveCall = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const { conversationId } = req.params;
    if (!conversationId) {
        throw new error_types_1.BadRequestError("conversationId is required");
    }
    const call = await call_service_1.callService.getActiveCall(conversationId);
    if (!call) {
        (0, response_util_1.sendResponse)(res, 200, "No active call", null);
        return;
    }
    (0, response_util_1.sendResponse)(res, 200, "Active call retrieved", call);
});
exports.getCallHistory = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const { conversationId } = req.params;
    const limit = Number(req.query.limit) || 20;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;
    if (!conversationId) {
        throw new error_types_1.BadRequestError("conversationId is required");
    }
    const calls = await call_service_1.callService.getCallHistory(conversationId, userId, limit, skip);
    (0, response_util_1.sendResponse)(res, 200, "Call history retrieved", calls);
});
exports.missCall = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new error_types_1.AuthorizationError("Unauthorized");
    }
    const { callId } = req.body;
    if (!callId) {
        throw new error_types_1.BadRequestError("callId is required");
    }
    const call = await call_service_1.callService.missCall(callId);
    (0, response_util_1.sendResponse)(res, 200, "Call marked as missed", call);
});
//# sourceMappingURL=call.controller.js.map