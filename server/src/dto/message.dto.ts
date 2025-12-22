import { z } from "zod";

/**
 * Send Message DTO
 */
export const sendMessageSchema = z.object({
  conversationId: z.string().cuid("Invalid conversation ID"),
  content: z.string().min(1, "Message cannot be empty").max(5000, "Message too long"),
  type: z.enum(["TEXT", "IMAGE", "VIDEO", "FILE", "SYSTEM_MESSAGE"]).default("TEXT"),
  mediaUrls: z.array(z.string().url()).optional(),
});

export type SendMessageDTO = z.infer<typeof sendMessageSchema>;

/**
 * Edit Message DTO
 */
export const editMessageSchema = z.object({
  messageId: z.string().cuid("Invalid message ID"),
  newContent: z.string().min(1, "Message cannot be empty").max(5000, "Message too long"),
});

export type EditMessageDTO = z.infer<typeof editMessageSchema>;

/**
 * Delete Message DTO
 */
export const deleteMessageSchema = z.object({
  messageId: z.string().cuid("Invalid message ID"),
});

export type DeleteMessageDTO = z.infer<typeof deleteMessageSchema>;

/**
 * Mark as Read DTO
 */
export const markAsReadSchema = z.object({
  conversationId: z.string().cuid("Invalid conversation ID"),
});

export type MarkAsReadDTO = z.infer<typeof markAsReadSchema>;

/**
 * React to Message DTO
 */
export const reactToMessageSchema = z.object({
  messageId: z.string().cuid("Invalid message ID"),
  emoji: z.string().emoji("Must be a valid emoji"),
});

export type ReactToMessageDTO = z.infer<typeof reactToMessageSchema>;

/**
 * Remove Reaction DTO
 */
export const removeReactionSchema = z.object({
  messageId: z.string().cuid("Invalid message ID"),
  emoji: z.string().emoji("Must be a valid emoji"),
});

export type RemoveReactionDTO = z.infer<typeof removeReactionSchema>;

/**
 * Get Messages Query DTO
 */
export const getMessagesQuerySchema = z.object({
  limit: z.string().default("50").transform(Number),
  page: z.string().default("1").transform(Number),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export type GetMessagesQueryDTO = z.infer<typeof getMessagesQuerySchema>;

/**
 * Mark Message Read DTO
 */
export const markMessageReadSchema = z.object({
  messageIds: z.array(z.string().cuid()).min(1, "At least one message ID required"),
});

export type MarkMessageReadDTO = z.infer<typeof markMessageReadSchema>;

/**
 * Message ID Param DTO
 */
export const messageIdSchema = z.object({
  messageId: z.string().cuid("Invalid message ID"),
});

export type MessageIdDTO = z.infer<typeof messageIdSchema>;
