export declare class MessageService {
    sendMessage(conversationId: string, senderId: string, content: string, type?: string, mediaUrls?: string[]): Promise<{
        sender: {
            name: string | null;
            id: string;
            avatar: string | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.MessageStatus;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        conversationId: string;
        content: string;
        type: import(".prisma/client").$Enums.MessageType;
        mediaUrls: string[];
        isEdited: boolean;
        editedAt: Date | null;
        editedContent: string | null;
    }>;
    getMessages(conversationId: string, limit?: number, skip?: number): Promise<({
        sender: {
            name: string | null;
            id: string;
            avatar: string | null;
        };
        readBy: {
            userId: string;
            readAt: Date;
        }[];
        reactions: {
            userId: string;
            emoji: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.MessageStatus;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        conversationId: string;
        content: string;
        type: import(".prisma/client").$Enums.MessageType;
        mediaUrls: string[];
        isEdited: boolean;
        editedAt: Date | null;
        editedContent: string | null;
    })[]>;
    editMessage(messageId: string, userId: string, newContent: string): Promise<{
        sender: {
            name: string | null;
            id: string;
            avatar: string | null;
        };
        reactions: {
            userId: string;
            emoji: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.MessageStatus;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        conversationId: string;
        content: string;
        type: import(".prisma/client").$Enums.MessageType;
        mediaUrls: string[];
        isEdited: boolean;
        editedAt: Date | null;
        editedContent: string | null;
    }>;
    deleteMessage(messageId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
    getMessageReadReceipts(messageId: string): Promise<({
        user: {
            name: string | null;
            id: string;
            avatar: string | null;
        };
    } & {
        id: string;
        userId: string;
        messageId: string;
        readAt: Date;
    })[]>;
    reactToMessage(messageId: string, userId: string, emoji: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        messageId: string;
        emoji: string;
    } | {
        removed: boolean;
    }>;
    getMessageReactions(messageId: string): Promise<Record<string, {
        userId: string;
        userName: string | null;
        userAvatar: string | null;
    }[]>>;
    removeReaction(messageId: string, userId: string, emoji: string): Promise<{
        success: boolean;
        message: string;
    }>;
    searchMessages(conversationId: string, searchText: string): Promise<({
        sender: {
            name: string | null;
            id: string;
            avatar: string | null;
        };
        reactions: {
            userId: string;
            emoji: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.MessageStatus;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        conversationId: string;
        content: string;
        type: import(".prisma/client").$Enums.MessageType;
        mediaUrls: string[];
        isEdited: boolean;
        editedAt: Date | null;
        editedContent: string | null;
    })[]>;
}
export declare const messageService: MessageService;
//# sourceMappingURL=message.service.d.ts.map