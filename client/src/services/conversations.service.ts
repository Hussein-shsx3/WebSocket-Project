import { axiosInstance } from "@/lib/axios";

/**
 * User DTO (for use in conversations)
 */
export interface ConversationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "online" | "offline" | "away";
}

/**
 * Message DTO
 */
export interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: ConversationUser;
  isRead: boolean;
  createdAt: string;
}

/**
 * Conversation DTO
 */
export interface Conversation {
  id: string;
  participants: ConversationUser[];
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Conversation with other user info (for list view)
 */
export interface ConversationListItem {
  id: string;
  otherUser: ConversationUser;
  lastMessage?: {
    content: string;
    sender: string;
    createdAt: string;
  };
  unreadCount: number;
  isArchived: boolean;
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

export interface ArchiveConversationRequest {
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
   */
  async getConversations(
    limit: number = 50,
    offset: number = 0
  ): Promise<GetConversationsResponse> {
    const response = await axiosInstance.get<{
      success: boolean;
      message: string;
      data: GetConversationsResponse;
    }>("/conversations", {
      params: { limit, offset },
    });

    return response.data.data;
  },

  /**
   * Get single conversation by ID
   */
  async getConversation(conversationId: string): Promise<GetConversationResponse> {
    const response = await axiosInstance.get<{
      success: boolean;
      message: string;
      data: GetConversationResponse;
    }>(`/conversations/${conversationId}`);

    return response.data.data;
  },

  /**
   * Get other user in conversation
   */
  async getOtherUser(conversationId: string): Promise<GetOtherUserResponse> {
    const response = await axiosInstance.get<{
      success: boolean;
      message: string;
      data: GetOtherUserResponse;
    }>(`/conversations/${conversationId}/user`);

    return response.data.data;
  },

  /**
   * Archive conversation
   */
  async archiveConversation(
    data: ArchiveConversationRequest
  ): Promise<void> {
    await axiosInstance.patch<{
      success: boolean;
      message: string;
    }>("/conversations/archive", data);
  },

  /**
   * Unarchive conversation
   */
  async unarchiveConversation(
    data: ArchiveConversationRequest
  ): Promise<void> {
    await axiosInstance.patch<{
      success: boolean;
      message: string;
    }>("/conversations/unarchive", data);
  },

  /**
   * Delete conversation
   */
  async deleteConversation(data: DeleteConversationRequest): Promise<void> {
    await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>("/conversations", { data });
  },
};
