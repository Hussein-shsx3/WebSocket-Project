import { axiosInstance } from "@/lib/axios";
import Cookies from "js-cookie";

/**
 * User Status Type
 */
export type UserStatus = "online" | "offline" | "away";

/**
 * User DTO (simplified for conversation list)
 */
export interface ConversationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  status: UserStatus;
  bio?: string | null;
}

/**
 * Last Message DTO (summary for conversation list)
 */
export interface LastMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  isRead: boolean;
}

/**
 * Conversation List Item DTO
 * This is what we display in the conversations list
 */
export interface ConversationListItem {
  id: string;
  otherUser: ConversationUser;
  lastMessage?: LastMessage | null;
  unreadCount: number;
  isArchived: boolean;
  isMuted: boolean;
  lastReadAt?: string | null;
  updatedAt: string;
  createdAt: string;
}

/**
 * Full Conversation DTO (for detailed view)
 */
export interface Conversation {
  id: string;
  participants: ConversationUser[];
  lastMessage?: LastMessage | null;
  unreadCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request/Response Types
 */
export interface GetOrCreateConversationRequest {
  friendId: string;
}

export interface GetOrCreateConversationResponse {
  conversation: Conversation;
}

export interface GetConversationsResponse {
  conversations: ConversationListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface GetConversationResponse {
  conversation: Conversation;
}

export interface GetOtherUserResponse {
  user: ConversationUser;
}

/**
 * Generic API response wrapper used by the server
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface ArchiveConversationRequest {
  conversationId: string;
}

export interface MuteConversationRequest {
  conversationId: string;
}

export interface DeleteConversationRequest {
  conversationId: string;
}

/**
 * Conversations Service
 * Handles all conversation-related API calls
 */
export const conversationsService = {
  /**
   * Get or create conversation with a friend
   * @param data - Friend ID to create conversation with
   * @returns Conversation object
   */
  async getOrCreateConversation(
    data: GetOrCreateConversationRequest
  ): Promise<GetOrCreateConversationResponse> {
    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
      data: GetOrCreateConversationResponse;
    }>("/conversations", data);

    return response.data.data;
  },

  /**
   * Get all conversations for current user
   * @param limit - Maximum number of conversations to return
   * @param page - Page number (for pagination, starts at 1)
   * @param archived - Filter by archived status (optional)
   * @returns List of conversations with pagination info
   */
  /**
   * Decode JWT token to get user ID
   */
  getCurrentUserId(): string | null {
    try {
      const token = Cookies.get("accessToken");
      if (!token) return null;

      const base64Payload = token.split(".")[1];
      const jsonPayload = atob(
        base64Payload.replace(/-/g, "+").replace(/_/g, "/")
      );
      const payload = JSON.parse(jsonPayload);
      return payload.userId || null;
    } catch {
      return null;
    }
  },

  async getConversations(
    limit: number = 50,
    page: number = 1,
    archived?: boolean
  ): Promise<GetConversationsResponse> {
    const params: Record<string, string | number | boolean> = {
      limit,
      page,
    };

    if (archived !== undefined) {
      params.archived = archived;
    }

    // Define the raw API response type
    interface RawConversationParticipant {
      userId: string;
      user: {
        id: string;
        name: string | null;
        email: string;
        avatar: string | null;
        status: string;
      };
    }

    interface RawMessage {
      id: string;
      content: string;
      senderId: string;
      createdAt: string;
      sender?: {
        name: string | null;
      };
    }

    interface RawConversation {
      id: string;
      participants: RawConversationParticipant[];
      messages: RawMessage[];
      isArchived?: boolean;
      isMuted?: boolean;
      updatedAt: string;
      createdAt: string;
    }

    const response = await axiosInstance.get<{
      success: boolean;
      message: string;
      data: RawConversation[];
    }>("/conversations", { params });

    // Get current user ID from token
    const currentUserId = this.getCurrentUserId();

    // Transform the API response to match our interface
    const conversations: ConversationListItem[] = response.data.data.map(
      (conv) => {
        // Find the other user (not the current user)
        const participants = conv.participants || [];
        const otherParticipant = currentUserId
          ? participants.find((p) => p.userId !== currentUserId && p.user)
          : participants.find((p) => p.user) || participants[0];
        const otherUser = otherParticipant?.user || null;

        // Get last message
        const lastMessage =
          conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;

        return {
          id: conv.id,
          otherUser: otherUser
            ? {
                id: otherUser.id,
                name: otherUser.name || "",
                email: otherUser.email || "",
                avatar: otherUser.avatar || null,
                status: (otherUser.status || "offline") as UserStatus,
                bio: null,
              }
            : {
                id: "",
                name: "Unknown",
                email: "",
                avatar: null,
                status: "offline" as UserStatus,
                bio: null,
              },
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content || "",
                senderId: lastMessage.senderId || "",
                senderName: lastMessage.sender?.name || "",
                createdAt: lastMessage.createdAt,
                isRead: false, // TODO: Get from messageReads
              }
            : null,
          unreadCount: 0, // TODO: Calculate from messageReads
          isArchived: conv.isArchived || false,
          isMuted: conv.isMuted || false,
          lastReadAt: null, // TODO: Get from participant
          updatedAt: conv.updatedAt || conv.createdAt,
          createdAt: conv.createdAt,
        };
      }
    );

    return {
      conversations,
      total: conversations.length,
      limit,
      offset: (page - 1) * limit,
    };
  },

  /**
   * Get single conversation by ID
   * @param conversationId - ID of the conversation
   * @returns Full conversation details
   */
  async getConversation(
    conversationId: string
  ): Promise<GetConversationResponse> {
    const response = await axiosInstance.get<{
      success: boolean;
      message: string;
      data: GetConversationResponse;
    }>(`/conversations/${conversationId}`);

    return response.data.data;
  },

  /**
   * Get other user in conversation
   * @param conversationId - ID of the conversation
   * @returns Other user's information
   */
  async getOtherUser(conversationId: string): Promise<ConversationUser> {
    const response = await axiosInstance.get<ApiResponse<ConversationUser | GetOtherUserResponse>>(
      `/conversations/${conversationId}/user`
    );

    // Normalize server shape: some endpoints return { user: ConversationUser }
    // while others return the ConversationUser directly in `data`.
    const payload = response.data.data;

    // If payload has `user` property, return that, otherwise treat payload as ConversationUser
    if ((payload as GetOtherUserResponse).user) {
      return (payload as GetOtherUserResponse).user;
    }

    return payload as ConversationUser;
  },

  /**
   * Archive conversation
   * @param data - Conversation ID to archive
   */
  async archiveConversation(data: ArchiveConversationRequest): Promise<void> {
    await axiosInstance.patch<{
      success: boolean;
      message: string;
    }>("/conversations/archive", data);
  },

  /**
   * Unarchive conversation
   * @param data - Conversation ID to unarchive
   */
  async unarchiveConversation(data: ArchiveConversationRequest): Promise<void> {
    await axiosInstance.patch<{
      success: boolean;
      message: string;
    }>("/conversations/unarchive", data);
  },

  /**
   * Mute conversation
   * @param data - Conversation ID to mute
   */
  async muteConversation(data: MuteConversationRequest): Promise<void> {
    await axiosInstance.patch<{
      success: boolean;
      message: string;
    }>("/conversations/mute", data);
  },

  /**
   * Unmute conversation
   * @param data - Conversation ID to unmute
   */
  async unmuteConversation(data: MuteConversationRequest): Promise<void> {
    await axiosInstance.patch<{
      success: boolean;
      message: string;
    }>("/conversations/unmute", data);
  },

  /**
   * Delete conversation
   * @param data - Conversation ID to delete
   */
  async deleteConversation(data: DeleteConversationRequest): Promise<void> {
    await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>("/conversations", { data });
  },
};
