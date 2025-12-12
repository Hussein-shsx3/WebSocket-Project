import { z } from "zod";
export declare const sendFriendRequestSchema: z.ZodObject<{
    receiverId: z.ZodString;
}, z.core.$strip>;
export type SendFriendRequestDTO = z.infer<typeof sendFriendRequestSchema>;
export declare const friendRequestIdSchema: z.ZodObject<{
    requestId: z.ZodString;
}, z.core.$strip>;
export type FriendRequestIdDTO = z.infer<typeof friendRequestIdSchema>;
export declare const removeFriendSchema: z.ZodObject<{
    friendId: z.ZodString;
}, z.core.$strip>;
export type RemoveFriendDTO = z.infer<typeof removeFriendSchema>;
export declare const getFriendRequestsQuerySchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodEnum<{
        pending: "pending";
        sent: "sent";
    }>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type GetFriendRequestsQueryDTO = z.infer<typeof getFriendRequestsQuerySchema>;
export declare const getFriendsQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GetFriendsQueryDTO = z.infer<typeof getFriendsQuerySchema>;
//# sourceMappingURL=friend.dto.d.ts.map