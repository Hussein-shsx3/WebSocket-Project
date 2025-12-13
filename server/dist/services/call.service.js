"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callService = exports.CallService = void 0;
const db_1 = __importDefault(require("../config/db"));
const error_types_1 = require("../types/error.types");
class CallService {
    async initiateCall(conversationId, callerId, receiverId, callType) {
        const conversation = await db_1.default.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: true,
            },
        });
        if (!conversation) {
            throw new error_types_1.NotFoundError("Conversation not found");
        }
        const callerParticipant = conversation.participants.find((p) => p.userId === callerId);
        const receiverParticipant = conversation.participants.find((p) => p.userId === receiverId);
        if (!callerParticipant || !receiverParticipant) {
            throw new error_types_1.AuthorizationError("Both users must be in the conversation");
        }
        const activeCall = await db_1.default.call.findFirst({
            where: {
                conversationId,
                status: {
                    in: ["INITIATING", "RINGING", "ACTIVE"],
                },
            },
        });
        if (activeCall) {
            throw new error_types_1.BadRequestError("There is already an active call in this conversation");
        }
        const call = await db_1.default.call.create({
            data: {
                conversationId,
                callerId,
                receiverId,
                type: callType,
                status: "INITIATING",
                startedAt: new Date(),
            },
        });
        return call;
    }
    async updateCallStatus(callId, status) {
        const call = await db_1.default.call.findUnique({
            where: { id: callId },
        });
        if (!call) {
            throw new error_types_1.NotFoundError("Call not found");
        }
        const validTransitions = {
            INITIATING: ["RINGING", "CANCELED"],
            RINGING: ["ACTIVE", "DECLINED", "MISSED"],
            ACTIVE: ["ENDED"],
            ENDED: [],
            DECLINED: [],
            MISSED: [],
            CANCELED: [],
        };
        if (!validTransitions[call.status].includes(status)) {
            throw new error_types_1.BadRequestError(`Cannot transition from ${call.status} to ${status}`);
        }
        const updateData = {
            status,
        };
        if (status === "ACTIVE") {
            updateData.startedAt = new Date();
        }
        else if (status === "ENDED") {
            updateData.endedAt = new Date();
            if (call.startedAt) {
                const duration = Math.floor((new Date().getTime() - call.startedAt.getTime()) / 1000);
                updateData.duration = duration;
            }
        }
        const updated = await db_1.default.call.update({
            where: { id: callId },
            data: updateData,
        });
        return updated;
    }
    async endCall(callId) {
        const call = await db_1.default.call.findUnique({
            where: { id: callId },
        });
        if (!call) {
            throw new error_types_1.NotFoundError("Call not found");
        }
        const endedAt = new Date();
        let duration = 0;
        if (call.startedAt) {
            duration = Math.floor((endedAt.getTime() - call.startedAt.getTime()) / 1000);
        }
        const updated = await db_1.default.call.update({
            where: { id: callId },
            data: {
                status: "ENDED",
                endedAt,
                duration,
            },
        });
        return updated;
    }
    async declineCall(callId) {
        const call = await db_1.default.call.findUnique({
            where: { id: callId },
        });
        if (!call) {
            throw new error_types_1.NotFoundError("Call not found");
        }
        if (call.status !== "RINGING") {
            throw new error_types_1.BadRequestError("Can only decline a ringing call");
        }
        const updated = await db_1.default.call.update({
            where: { id: callId },
            data: {
                status: "DECLINED",
                endedAt: new Date(),
            },
        });
        return updated;
    }
    async missCall(callId) {
        const call = await db_1.default.call.findUnique({
            where: { id: callId },
        });
        if (!call) {
            throw new error_types_1.NotFoundError("Call not found");
        }
        if (!["INITIATING", "RINGING"].includes(call.status)) {
            throw new error_types_1.BadRequestError("Call must be ringing to mark as missed");
        }
        const updated = await db_1.default.call.update({
            where: { id: callId },
            data: {
                status: "MISSED",
                endedAt: new Date(),
            },
        });
        return updated;
    }
    async getActiveCall(conversationId) {
        const call = await db_1.default.call.findFirst({
            where: {
                conversationId,
                status: {
                    in: ["INITIATING", "RINGING", "ACTIVE"],
                },
            },
        });
        return call || null;
    }
    async getCallHistory(conversationId, userId, limit = 20, skip = 0) {
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
            throw new error_types_1.AuthorizationError("You are not a member of this conversation");
        }
        const calls = await db_1.default.call.findMany({
            where: {
                conversationId,
            },
            orderBy: {
                startedAt: "desc",
            },
            take: limit,
            skip,
        });
        return calls;
    }
}
exports.CallService = CallService;
exports.callService = new CallService();
//# sourceMappingURL=call.service.js.map