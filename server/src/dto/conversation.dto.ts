import { z } from "zod";

/**
 * Create Private Conversation DTO
 */
export const createPrivateConversationSchema = z.object({
  participantId: z.string().cuid("Invalid participant ID"),
});

export const getOrCreateConversationSchema = z.object({
  friendId: z.string().cuid("Invalid friend ID"),
});

export type CreatePrivateConversationDTO = z.infer<typeof createPrivateConversationSchema>;

/**
 * Archive Conversation DTO
 */
export const archiveConversationSchema = z.object({
  conversationId: z.string().cuid("Invalid conversation ID"),
});

export type ArchiveConversationDTO = z.infer<typeof archiveConversationSchema>;

/**
 * Unarchive Conversation DTO
 */
export const unarchiveConversationSchema = z.object({
  conversationId: z.string().cuid("Invalid conversation ID"),
});

export type UnarchiveConversationDTO = z.infer<typeof unarchiveConversationSchema>;

/**
 * Delete Conversation DTO
 */
export const deleteConversationSchema = z.object({
  conversationId: z.string().cuid("Invalid conversation ID"),
});

export type DeleteConversationDTO = z.infer<typeof deleteConversationSchema>;

/**
 * Create Group Conversation DTO
 */
export const createGroupConversationSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100, "Group name too long"),
  description: z.string().max(500, "Description too long").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  memberIds: z.array(z.string().cuid()).min(2, "At least 2 members required"),
});

export type CreateGroupConversationDTO = z.infer<typeof createGroupConversationSchema>;

/**
 * Update Group Conversation DTO
 */
export const updateGroupConversationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

export type UpdateGroupConversationDTO = z.infer<typeof updateGroupConversationSchema>;

/**
 * Add Member to Group DTO
 */
export const addMemberSchema = z.object({
  memberId: z.string().cuid("Invalid member ID"),
});

export type AddMemberDTO = z.infer<typeof addMemberSchema>;

/**
 * Update Member Role DTO
 */
export const updateMemberRoleSchema = z.object({
  memberId: z.string().cuid("Invalid member ID"),
  role: z.enum(["ADMIN", "MODERATOR", "MEMBER"]),
});

export type UpdateMemberRoleDTO = z.infer<typeof updateMemberRoleSchema>;

/**
 * Update User Conversation Settings DTO
 */
export const updateConversationSettingsSchema = z.object({
  isArchived: z.boolean().optional(),
  isMuted: z.boolean().optional(),
});

export type UpdateConversationSettingsDTO = z.infer<typeof updateConversationSettingsSchema>;

/**
 * Get Conversations Query DTO
 */
export const getConversationsQuerySchema = z.object({
  type: z.enum(["PRIVATE", "GROUP", "ALL"]).default("ALL"),
  limit: z.string().default("20").transform(Number),
  page: z.string().default("1").transform(Number),
  archived: z.enum(["true", "false"]).default("false"),
  search: z.string().optional(),
});

export const getUserConversationsQuerySchema = z.object({
  limit: z.coerce.number().optional(),
  page: z.coerce.number().optional(),
  search: z.string().optional(),
});

export type GetConversationsQueryDTO = z.infer<typeof getConversationsQuerySchema>;

/**
 * Conversation ID DTO
 */
export const conversationIdSchema = z.object({
  conversationId: z.string().cuid("Invalid conversation ID"),
});

export const getConversationSchema = z.object({
  conversationId: z.string().cuid("Invalid conversation ID"),
});

export type ConversationIdDTO = z.infer<typeof conversationIdSchema>;
