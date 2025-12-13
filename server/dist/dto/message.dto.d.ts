import { z } from "zod";
export declare const sendMessageSchema: z.ZodObject<{
    conversationId: z.ZodString;
    content: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<{
        TEXT: "TEXT";
        IMAGE: "IMAGE";
        VIDEO: "VIDEO";
        FILE: "FILE";
        SYSTEM_MESSAGE: "SYSTEM_MESSAGE";
    }>>;
    mediaUrls: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type SendMessageDTO = z.infer<typeof sendMessageSchema>;
export declare const editMessageSchema: z.ZodObject<{
    messageId: z.ZodString;
    newContent: z.ZodString;
}, z.core.$strip>;
export type EditMessageDTO = z.infer<typeof editMessageSchema>;
export declare const deleteMessageSchema: z.ZodObject<{
    messageId: z.ZodString;
}, z.core.$strip>;
export type DeleteMessageDTO = z.infer<typeof deleteMessageSchema>;
export declare const markAsReadSchema: z.ZodObject<{
    conversationId: z.ZodString;
}, z.core.$strip>;
export type MarkAsReadDTO = z.infer<typeof markAsReadSchema>;
export declare const reactToMessageSchema: z.ZodObject<{
    messageId: z.ZodString;
    emoji: z.ZodString;
}, z.core.$strip>;
export type ReactToMessageDTO = z.infer<typeof reactToMessageSchema>;
export declare const removeReactionSchema: z.ZodObject<{
    messageId: z.ZodString;
    emoji: z.ZodString;
}, z.core.$strip>;
export type RemoveReactionDTO = z.infer<typeof removeReactionSchema>;
export declare const getMessagesQuerySchema: z.ZodObject<{
    limit: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
    page: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GetMessagesQueryDTO = z.infer<typeof getMessagesQuerySchema>;
export declare const markMessageReadSchema: z.ZodObject<{
    messageIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type MarkMessageReadDTO = z.infer<typeof markMessageReadSchema>;
export declare const messageIdSchema: z.ZodObject<{
    messageId: z.ZodString;
}, z.core.$strip>;
export type MessageIdDTO = z.infer<typeof messageIdSchema>;
//# sourceMappingURL=message.dto.d.ts.map