export declare function sendFriendRequest(senderId: string, receiverId: string): Promise<{
    sender: {
        name: string | null;
        id: string;
        email: string;
        avatar: string | null;
    };
    receiver: {
        name: string | null;
        id: string;
        email: string;
        avatar: string | null;
    };
} & {
    id: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    senderId: string;
    receiverId: string;
}>;
export declare function acceptFriendRequest(requestId: string, userId: string): Promise<{
    request: {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        receiverId: string;
    };
    friendship: {
        id: string;
        createdAt: Date;
        userId: string;
        friendId: string;
    };
    conversation: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isArchived: boolean;
        lastMessageAt: Date | null;
    } | null;
}>;
export declare function rejectFriendRequest(requestId: string, userId: string): Promise<{
    id: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    senderId: string;
    receiverId: string;
}>;
export declare function cancelFriendRequest(requestId: string, userId: string): Promise<{
    message: string;
}>;
export declare function getFriendRequests(userId: string, type: "pending" | "sent", limit: number, skip: number): Promise<({} & {
    id: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    senderId: string;
    receiverId: string;
})[]>;
export declare function getFriendRequestsCount(userId: string, type: "pending" | "sent"): Promise<number>;
export declare function getFriends(userId: string, limit: number, skip: number, search?: string): Promise<{
    name: string | null;
    id: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    status: string;
}[]>;
export declare function getFriendsCount(userId: string, search?: string): Promise<number>;
export declare function removeFriend(userId: string, friendId: string): Promise<{
    message: string;
}>;
//# sourceMappingURL=friend.service.d.ts.map