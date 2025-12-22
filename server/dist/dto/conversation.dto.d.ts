import { z } from "zod";
export declare const createPrivateConversationSchema: z.ZodObject<{
    participantId: z.ZodString;
}, z.core.$strip>;
export declare const getOrCreateConversationSchema: z.ZodObject<{
    friendId: z.ZodString;
}, z.core.$strip>;
export type CreatePrivateConversationDTO = z.infer<typeof createPrivateConversationSchema>;
export declare const archiveConversationSchema: z.ZodObject<{
    conversationId: z.ZodString;
}, z.core.$strip>;
export type ArchiveConversationDTO = z.infer<typeof archiveConversationSchema>;
export declare const unarchiveConversationSchema: z.ZodObject<{
    conversationId: z.ZodString;
}, z.core.$strip>;
export type UnarchiveConversationDTO = z.infer<typeof unarchiveConversationSchema>;
export declare const deleteConversationSchema: z.ZodObject<{
    conversationId: z.ZodString;
}, z.core.$strip>;
export type DeleteConversationDTO = z.infer<typeof deleteConversationSchema>;
export declare const createGroupConversationSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    memberIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type CreateGroupConversationDTO = z.infer<typeof createGroupConversationSchema>;
export declare const updateGroupConversationSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateGroupConversationDTO = z.infer<typeof updateGroupConversationSchema>;
export declare const addMemberSchema: z.ZodObject<{
    memberId: z.ZodString;
}, z.core.$strip>;
export type AddMemberDTO = z.infer<typeof addMemberSchema>;
export declare const updateMemberRoleSchema: z.ZodObject<{
    memberId: z.ZodString;
    role: z.ZodEnum<{
        ADMIN: "ADMIN";
        MODERATOR: "MODERATOR";
        MEMBER: "MEMBER";
    }>;
}, z.core.$strip>;
export type UpdateMemberRoleDTO = z.infer<typeof updateMemberRoleSchema>;
export declare const updateConversationSettingsSchema: z.ZodObject<{
    isArchived: z.ZodOptional<z.ZodBoolean>;
    isMuted: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type UpdateConversationSettingsDTO = z.infer<typeof updateConversationSettingsSchema>;
export declare const getConversationsQuerySchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodEnum<{
        PRIVATE: "PRIVATE";
        GROUP: "GROUP";
        ALL: "ALL";
    }>>;
    limit: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
    page: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
    archived: z.ZodDefault<z.ZodEnum<{
        true: "true";
        false: "false";
    }>>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const getUserConversationsQuerySchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GetConversationsQueryDTO = z.infer<typeof getConversationsQuerySchema>;
export declare const conversationIdSchema: z.ZodObject<{
    conversationId: z.ZodString;
}, z.core.$strip>;
export declare const getConversationSchema: z.ZodObject<{
    conversationId: z.ZodString;
}, z.core.$strip>;
export type ConversationIdDTO = z.infer<typeof conversationIdSchema>;
//# sourceMappingURL=conversation.dto.d.ts.map