export declare class ConversationService {
    getOrCreateConversation(userId: string, friendId: string): Promise<{
        participants: ({
            user: {
                name: string | null;
                id: string;
                email: string;
                avatar: string | null;
            };
        } & {
            id: string;
            userId: string;
            conversationId: string;
            isArchived: boolean;
            isMuted: boolean;
            lastReadAt: Date | null;
            joinedAt: Date;
        })[];
        messages: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isArchived: boolean;
        lastMessageAt: Date | null;
    }>;
    getUserConversations(userId: string, limit?: number, skip?: number, search?: string): Promise<({
        participants: ({
            user: {
                name: string | null;
                id: string;
                email: string;
                avatar: string | null;
                status: string;
            };
        } & {
            id: string;
            userId: string;
            conversationId: string;
            isArchived: boolean;
            isMuted: boolean;
            lastReadAt: Date | null;
            joinedAt: Date;
        })[];
        messages: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isArchived: boolean;
        lastMessageAt: Date | null;
    })[]>;
    getConversation(conversationId: string, userId: string): Promise<{
        participants: ({
            user: {
                name: string | null;
                id: string;
                email: string;
                avatar: string | null;
                status: string;
            };
        } & {
            id: string;
            userId: string;
            conversationId: string;
            isArchived: boolean;
            isMuted: boolean;
            lastReadAt: Date | null;
            joinedAt: Date;
        })[];
        messages: ({
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
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isArchived: boolean;
        lastMessageAt: Date | null;
    }>;
    getOtherUser(conversationId: string, userId: string): Promise<{
        name: string | null;
        id: string;
        email: string;
        avatar: string | null;
        status: string;
    }>;
    archiveConversation(conversationId: string, userId: string): Promise<{
        id: string;
        userId: string;
        conversationId: string;
        isArchived: boolean;
        isMuted: boolean;
        lastReadAt: Date | null;
        joinedAt: Date;
    }>;
    unarchiveConversation(conversationId: string, userId: string): Promise<{
        id: string;
        userId: string;
        conversationId: string;
        isArchived: boolean;
        isMuted: boolean;
        lastReadAt: Date | null;
        joinedAt: Date;
    }>;
    deleteConversation(conversationId: string, userId: string): Promise<void>;
    updateConversationLastMessage(conversationId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isArchived: boolean;
        lastMessageAt: Date | null;
    }>;
}
export declare const conversationService: ConversationService;
//# sourceMappingURL=conversation.service.d.ts.map