"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageIdSchema = exports.markMessageReadSchema = exports.getMessagesQuerySchema = exports.removeReactionSchema = exports.reactToMessageSchema = exports.markAsReadSchema = exports.deleteMessageSchema = exports.editMessageSchema = exports.sendMessageSchema = void 0;
const zod_1 = require("zod");
exports.sendMessageSchema = zod_1.z.object({
    conversationId: zod_1.z.string().cuid("Invalid conversation ID"),
    content: zod_1.z.string().min(1, "Message cannot be empty").max(5000, "Message too long"),
    type: zod_1.z.enum(["TEXT", "IMAGE", "VIDEO", "FILE", "SYSTEM_MESSAGE"]).default("TEXT"),
    mediaUrls: zod_1.z.array(zod_1.z.string().url()).optional(),
});
exports.editMessageSchema = zod_1.z.object({
    messageId: zod_1.z.string().cuid("Invalid message ID"),
    newContent: zod_1.z.string().min(1, "Message cannot be empty").max(5000, "Message too long"),
});
exports.deleteMessageSchema = zod_1.z.object({
    messageId: zod_1.z.string().cuid("Invalid message ID"),
});
exports.markAsReadSchema = zod_1.z.object({
    conversationId: zod_1.z.string().cuid("Invalid conversation ID"),
});
exports.reactToMessageSchema = zod_1.z.object({
    messageId: zod_1.z.string().cuid("Invalid message ID"),
    emoji: zod_1.z.string().emoji("Must be a valid emoji"),
});
exports.removeReactionSchema = zod_1.z.object({
    messageId: zod_1.z.string().cuid("Invalid message ID"),
    emoji: zod_1.z.string().emoji("Must be a valid emoji"),
});
exports.getMessagesQuerySchema = zod_1.z.object({
    limit: zod_1.z.string().default("50").transform(Number),
    page: zod_1.z.string().default("1").transform(Number),
    fromDate: zod_1.z.string().datetime().optional(),
    toDate: zod_1.z.string().datetime().optional(),
});
exports.markMessageReadSchema = zod_1.z.object({
    messageIds: zod_1.z.array(zod_1.z.string().cuid()).min(1, "At least one message ID required"),
});
exports.messageIdSchema = zod_1.z.object({
    messageId: zod_1.z.string().cuid("Invalid message ID"),
});
//# sourceMappingURL=message.dto.js.map