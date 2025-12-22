import { axiosInstance } from "@/lib/axios";

/**
 * Message DTO
 */
export interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  isRead: boolean;
  isEdited?: boolean;
  editedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt: string;
}

/**
 * Reaction DTO
 */
export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

/**
 * Read Receipt DTO
 */
export interface ReadReceipt {
  id: string;
  name: string;
  readAt: string;
}

/**
 * Request/Response Types
 */
export interface SendMessageRequest {
  conversationId: string;
  content: string;
}

export interface SendMessageResponse {
  message: Message;
}

export interface GetMessagesRequest {
  conversationId: string;
  limit?: number;
  offset?: number;
}

export interface GetMessagesResponse {
  messages: Message[];
  total: number;
  limit: number;
  offset: number;
}

export interface EditMessageRequest {
  messageId: string;
  content: string;
}

export interface DeleteMessageRequest {
  messageId: string;
}

export interface MarkAsReadRequest {
  conversationId: string;
  messageIds: string[];
}

export interface MarkAsReadResponse {
  markedCount: number;
}

export interface ReactToMessageRequest {
  messageId: string;
  emoji: string;
}

export interface ReactToMessageResponse {
  reaction: MessageReaction;
}

export interface RemoveReactionRequest {
  reactionId: string;
}

export interface SearchMessagesRequest {
  query: string;
  conversationId: string;
  limit?: number;
}

export interface SearchMessagesResponse {
  messages: Message[];
}

/**
 * Messages Service
 * Handles all message-related API calls
 */
export const messagesService = {
  /**
   * Send message in conversation
   */
  async sendMessage(
    data: SendMessageRequest
  ): Promise<SendMessageResponse> {
    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
      data: SendMessageResponse;
    }>("/messages", data);

    return response.data.data;
  },

  /**
   * Get messages in conversation
   */
  async getMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<GetMessagesResponse> {
    const response = await axiosInstance.get<{
      success: boolean;
      message: string;
      data: GetMessagesResponse;
    }>(`/messages/${conversationId}`, {
      params: { limit, offset },
    });

    return response.data.data;
  },

  /**
   * Edit message
   */
  async editMessage(data: EditMessageRequest): Promise<void> {
    await axiosInstance.patch<{
      success: boolean;
      message: string;
    }>("/messages/edit", data);
  },

  /**
   * Delete message (soft delete)
   */
  async deleteMessage(data: DeleteMessageRequest): Promise<void> {
    await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>("/messages", { data });
  },

  /**
   * Mark messages as read
   */
  async markAsRead(data: MarkAsReadRequest): Promise<MarkAsReadResponse> {
    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
      data: MarkAsReadResponse;
    }>("/messages/mark-as-read", data);

    return response.data.data;
  },

  /**
   * Get read receipts for message
   */
  async getReadReceipts(messageId: string): Promise<ReadReceipt[]> {
    const response = await axiosInstance.get<{
      success: boolean;
      message: string;
      data: { readBy: ReadReceipt[] };
    }>(`/messages/${messageId}/read-receipts`);

    return response.data.data.readBy;
  },

  /**
   * React to message
   */
  async reactToMessage(
    data: ReactToMessageRequest
  ): Promise<ReactToMessageResponse> {
    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
      data: ReactToMessageResponse;
    }>("/messages/react", data);

    return response.data.data;
  },

  /**
   * Remove reaction from message
   */
  async removeReaction(data: RemoveReactionRequest): Promise<void> {
    await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>("/messages/react", { data });
  },

  /**
   * Get reactions for message
   */
  async getReactions(messageId: string): Promise<any[]> {
    const response = await axiosInstance.get<{
      success: boolean;
      message: string;
      data: { reactions: any[] };
    }>(`/messages/${messageId}/reactions`);

    return response.data.data.reactions;
  },

  /**
   * Search messages
   */
  async searchMessages(
    query: string,
    conversationId: string,
    limit: number = 20
  ): Promise<SearchMessagesResponse> {
    const response = await axiosInstance.get<{
      success: boolean;
      message: string;
      data: SearchMessagesResponse;
    }>("/messages/search", {
      params: { query, conversationId, limit },
    });

    return response.data.data;
  },
};
