"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationSchema = exports.conversationIdSchema = exports.getUserConversationsQuerySchema = exports.getConversationsQuerySchema = exports.updateConversationSettingsSchema = exports.updateMemberRoleSchema = exports.addMemberSchema = exports.updateGroupConversationSchema = exports.createGroupConversationSchema = exports.deleteConversationSchema = exports.unarchiveConversationSchema = exports.archiveConversationSchema = exports.getOrCreateConversationSchema = exports.createPrivateConversationSchema = void 0;
const zod_1 = require("zod");
exports.createPrivateConversationSchema = zod_1.z.object({
    participantId: zod_1.z.string().cuid("Invalid participant ID"),
});
exports.getOrCreateConversationSchema = zod_1.z.object({
    friendId: zod_1.z.string().cuid("Invalid friend ID"),
});
exports.archiveConversationSchema = zod_1.z.object({
    conversationId: zod_1.z.string().cuid("Invalid conversation ID"),
});
exports.unarchiveConversationSchema = zod_1.z.object({
    conversationId: zod_1.z.string().cuid("Invalid conversation ID"),
});
exports.deleteConversationSchema = zod_1.z.object({
    conversationId: zod_1.z.string().cuid("Invalid conversation ID"),
});
exports.createGroupConversationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Group name is required").max(100, "Group name too long"),
    description: zod_1.z.string().max(500, "Description too long").optional(),
    avatar: zod_1.z.string().url("Invalid avatar URL").optional(),
    memberIds: zod_1.z.array(zod_1.z.string().cuid()).min(2, "At least 2 members required"),
});
exports.updateGroupConversationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().max(500).optional(),
    avatar: zod_1.z.string().url().optional(),
});
exports.addMemberSchema = zod_1.z.object({
    memberId: zod_1.z.string().cuid("Invalid member ID"),
});
exports.updateMemberRoleSchema = zod_1.z.object({
    memberId: zod_1.z.string().cuid("Invalid member ID"),
    role: zod_1.z.enum(["ADMIN", "MODERATOR", "MEMBER"]),
});
exports.updateConversationSettingsSchema = zod_1.z.object({
    isArchived: zod_1.z.boolean().optional(),
    isMuted: zod_1.z.boolean().optional(),
});
exports.getConversationsQuerySchema = zod_1.z.object({
    type: zod_1.z.enum(["PRIVATE", "GROUP", "ALL"]).default("ALL"),
    limit: zod_1.z.string().default("20").transform(Number),
    page: zod_1.z.string().default("1").transform(Number),
    archived: zod_1.z.enum(["true", "false"]).default("false"),
    search: zod_1.z.string().optional(),
});
exports.getUserConversationsQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().optional(),
    page: zod_1.z.coerce.number().optional(),
    search: zod_1.z.string().optional(),
});
exports.conversationIdSchema = zod_1.z.object({
    conversationId: zod_1.z.string().cuid("Invalid conversation ID"),
});
exports.getConversationSchema = zod_1.z.object({
    conversationId: zod_1.z.string().cuid("Invalid conversation ID"),
});
//# sourceMappingURL=conversation.dto.js.map