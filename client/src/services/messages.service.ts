import { axiosInstance } from "@/lib/axios";

/**
 * Message Types
 */
export type MessageType = "TEXT" | "IMAGE" | "FILE" | "AUDIO" | "VIDEO";
export type MessageStatus = "SENDING" | "SENT" | "DELIVERED" | "READ";

/**
 * Message Sender
 */
export interface MessageSender {
  id: string;
  name: string | null;
  avatar: string | null;
}

/**
 * Message Read Receipt
 */
export interface MessageReadReceipt {
  userId: string;
  readAt: string;
}

/**
 * Message Reaction
 */
export interface MessageReaction {
  emoji: string;
  userId: string;
}

/**
 * Message DTO
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  mediaUrls: string[];
  status: MessageStatus;
  isEdited: boolean;
  isDeleted: boolean;
  replyToId: string | null;
  createdAt: string;
  updatedAt: string;
  sender: MessageSender;
  readBy?: MessageReadReceipt[];
  reactions?: MessageReaction[];
}

/**
 * Send Message Request
 */
export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type?: MessageType;
  mediaUrls?: string[];
  replyToId?: string;
}

/**
 * Get Messages Response
 */
export interface GetMessagesResponse {
  messages: Message[];
  hasMore: boolean;
}

/**
 * Messages Service
 */
export const messagesService = {
  /**
   * Get messages from a conversation
   */
  async getMessages(
    conversationId: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<GetMessagesResponse> {
    const response = await axiosInstance.get<{
      success: boolean;
      message: string;
      data: Message[];
    }>(`/messages/${conversationId}`, {
      params: { limit, skip },
    });

    return {
      messages: response.data.data || [],
      hasMore: (response.data.data?.length || 0) === limit,
    };
  },

  /**
   * Send a message
   */
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
      data: Message;
    }>("/messages", data);

    return response.data.data;
  },

  /**
   * Edit a message
   */
  async editMessage(messageId: string, content: string): Promise<Message> {
    const response = await axiosInstance.patch<{
      success: boolean;
      message: string;
      data: Message;
    }>("/messages/edit", { messageId, content });

    return response.data.data;
  },

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    await axiosInstance.delete("/messages", {
      data: { messageId },
    });
  },

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string, messageIds: string[]): Promise<void> {
    await axiosInstance.post("/messages/mark-as-read", {
      conversationId,
      messageIds,
    });
  },

  /**
   * Upload media for message
   */
  async uploadMedia(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
      data: { url: string };
    }>("/messages/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data.url;
  },

  /**
   * React to a message
   */
  async reactToMessage(messageId: string, emoji: string): Promise<void> {
    await axiosInstance.post("/messages/react", { messageId, emoji });
  },

  /**
   * Remove reaction from message
   */
  async removeReaction(messageId: string, emoji: string): Promise<void> {
    await axiosInstance.delete("/messages/react", {
      data: { messageId, emoji },
    });
  },
};
