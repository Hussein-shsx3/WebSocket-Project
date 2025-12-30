"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { SocketEventHandlers } from "@/types/socket.types";
import type {
  Message,
  InfiniteMessagesData,
  ConversationsResponse,
  MessageRead,
  MessageReaction,
} from "@/types/chat.types";
import type { GetConversationsResponse } from "@/services/conversations.service";
import toast from "react-hot-toast";

export const useSocketHandlers = (): SocketEventHandlers => {
  const queryClient = useQueryClient();

  return {
    // ============================================
    // NEW MESSAGE RECEIVED
    // ============================================
    onMessageReceived: (data) => {
      // new message received (log removed)

      // Convert socket data to Message type
      const newMessage: Message = {
        id: data.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
        type: data.type,
        mediaUrls: [],
        status: data.status,
        isEdited: false,
        editedAt: null,
        editedContent: null,
        createdAt: data.createdAt,
        updatedAt: data.createdAt,
        sender: data.sender,
        readBy: [],
        reactions: [],
      };

      // 1️⃣ Update messages list (infinite query)
      queryClient.setQueryData<InfiniteMessagesData>(
        ["messages", data.conversationId],
        (oldData) => {
          if (!oldData?.pages) return oldData;

          const newPages = [...oldData.pages];
          if (newPages[0]) {
            newPages[0] = [newMessage, ...newPages[0]];
          }

          return {
            ...oldData,
            pages: newPages,
          };
        }
      );

      // 2️⃣ Update conversations list
      queryClient.setQueryData<ConversationsResponse>(
        ["conversations", { limit: 50, offset: 0 }],
        (oldData) => {
          if (!oldData) return oldData;

          const conversations = oldData.conversations || [];

          // Find conversation index
          const conversationIndex = conversations.findIndex(
            (conv) => conv.id === data.conversationId
          );

          if (conversationIndex === -1) return oldData;

          // Create updated conversations array
          const updatedConversations = [...conversations];
          const conversation = updatedConversations[conversationIndex];

          // Update conversation with new message
          updatedConversations[conversationIndex] = {
            ...conversation,
            lastMessageAt: data.createdAt,
            messages: [newMessage],
          };

          // Move to top
          const [updated] = updatedConversations.splice(conversationIndex, 1);
          updatedConversations.unshift(updated);

          return {
            ...oldData,
            conversations: updatedConversations,
          };
        }
      );

      // 3️⃣ Invalidate single conversation
      queryClient.invalidateQueries({
        queryKey: ["conversation", data.conversationId],
      });
    },

    // ============================================
    // MESSAGE EDITED
    // ============================================
    onMessageEdited: (data) => {
      // message edited (log removed)

      queryClient.setQueryData<InfiniteMessagesData>(
        ["messages", data.conversationId],
        (oldData) => {
          if (!oldData?.pages) return oldData;

          const newPages = oldData.pages.map((page) =>
            page.map((msg) =>
              msg.id === data.messageId
                ? {
                    ...msg,
                    content: data.newContent,
                    isEdited: data.isEdited,
                    editedAt: data.editedAt,
                  }
                : msg
            )
          );

          return {
            ...oldData,
            pages: newPages,
          };
        }
      );
    },

    // ============================================
    // MESSAGE DELETED
    // ============================================
    onMessageDeleted: (data) => {
      // message deleted (log removed)

      queryClient.setQueryData<InfiniteMessagesData>(
        ["messages", data.conversationId],
        (oldData) => {
          if (!oldData?.pages) return oldData;

          const newPages = oldData.pages.map((page) =>
            page.filter((msg) => msg.id !== data.messageId)
          );

          return {
            ...oldData,
            pages: newPages,
          };
        }
      );
    },

    // ============================================
    // MESSAGES READ
    // ============================================
    onMessagesRead: (data) => {
      // messages marked as read (log removed)

      queryClient.setQueryData<InfiniteMessagesData>(
        ["messages", data.conversationId],
        (oldData) => {
          if (!oldData?.pages) return oldData;

          const newReadReceipt: MessageRead = {
            userId: data.userId,
            readAt: data.readAt,
          };

          const newPages = oldData.pages.map((page) =>
            page.map((msg) => ({
              ...msg,
              status: "READ" as const,
              readBy: [...(msg.readBy || []), newReadReceipt],
            }))
          );

          return {
            ...oldData,
            pages: newPages,
          };
        }
      );
    },

    // ============================================
    // MESSAGE REACTION
    // ============================================
    onReaction: (data) => {
      // reaction received (log removed)

      queryClient.setQueryData<InfiniteMessagesData>(
        ["messages", data.conversationId],
        (oldData) => {
          if (!oldData?.pages) return oldData;

          const newPages = oldData.pages.map((page) =>
            page.map((msg) => {
              if (msg.id === data.messageId) {
                let reactions = msg.reactions || [];

                if (data.removed) {
                  // Remove reaction
                  reactions = reactions.filter(
                    (r) => !(r.userId === data.userId && r.emoji === data.emoji)
                  );
                } else {
                  // Add reaction
                  const newReaction: MessageReaction = {
                    id: `${data.messageId}-${data.userId}-${data.emoji}`,
                    messageId: data.messageId,
                    userId: data.userId,
                    emoji: data.emoji,
                    createdAt: new Date().toISOString(),
                  };
                  reactions = [...reactions, newReaction];
                }

                return { ...msg, reactions };
              }
              return msg;
            })
          );

          return {
            ...oldData,
            pages: newPages,
          };
        }
      );
    },

    // ============================================
    // TYPING INDICATOR
    // ============================================
    onTyping: (data) => {
      // typing event received (log removed)

      queryClient.setQueryData<string[]>(
        ["typing", data.conversationId],
        (oldData) => {
          const typingUsers = oldData || [];

          if (data.isTyping) {
            // Add user to typing list
            if (!typingUsers.includes(data.userId)) {
              return [...typingUsers, data.userId];
            }
            return typingUsers;
          } else {
            // Remove user from typing list
            return typingUsers.filter((id) => id !== data.userId);
          }
        }
      );
    },

    // ============================================
    // USER STATUS
    // ============================================
    onUserStatus: (data) => {
      // user status event received (log removed)

      // Update in conversations list - need to update all possible query keys
      queryClient.setQueriesData<GetConversationsResponse>(
        { queryKey: ["conversations"] },
        (oldData) => {
          if (!oldData?.conversations) return oldData;

          const updatedConversations = oldData.conversations.map((conv) => {
            // Check if the otherUser matches the userId
            if (conv.otherUser?.id === data.userId) {
              return {
                ...conv,
                otherUser: {
                  ...conv.otherUser,
                  status: data.status,
                },
              };
            }
            return conv;
          });

          return {
            ...oldData,
            conversations: updatedConversations,
          };
        }
      );

      // Invalidate other user queries
      queryClient.invalidateQueries({
        queryKey: ["conversation"],
        predicate: (query) => query.queryKey[2] === "otherUser",
      });
    },

    // ============================================
    // READ RECEIPT
    // ============================================
    onReadReceipt: (data) => {
      // read receipt received (log removed)

      queryClient.setQueryData<InfiniteMessagesData>(
        ["messages", data.conversationId],
        (oldData) => {
          if (!oldData?.pages) return oldData;

          const newReadReceipt: MessageRead = {
            userId: data.userId,
            readAt: data.readAt,
          };

          const newPages = oldData.pages.map((page) =>
            page.map((msg) => {
              if (data.messageIds.includes(msg.id)) {
                return {
                  ...msg,
                  readBy: [...(msg.readBy || []), newReadReceipt],
                };
              }
              return msg;
            })
          );

          return {
            ...oldData,
            pages: newPages,
          };
        }
      );
    },

    // ============================================
    // ERROR
    // ============================================
    onError: (error) => {
      console.error("❌ Socket error:", error);
      toast.error(error.message || "Something went wrong");
    },
  };
};
