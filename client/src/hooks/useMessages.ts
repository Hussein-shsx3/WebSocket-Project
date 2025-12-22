import { useMutation, useQuery } from "@tanstack/react-query";
import {
  messagesService,
  SendMessageRequest,
  EditMessageRequest,
  DeleteMessageRequest,
  MarkAsReadRequest,
  ReactToMessageRequest,
  RemoveReactionRequest,
} from "@/services/messages.service";

/**
 * Hook for sending message
 */
export const useSendMessage = () => {
  return useMutation({
    mutationFn: (data: SendMessageRequest) =>
      messagesService.sendMessage(data),
    onError: (error) => {
      console.error("Send message failed:", error);
    },
  });
};

/**
 * Hook for getting messages in conversation
 */
export const useMessages = (
  conversationId: string,
  limit: number = 50,
  offset: number = 0
) => {
  return useQuery({
    queryKey: ["messages", conversationId, { limit, offset }],
    queryFn: () => messagesService.getMessages(conversationId, limit, offset),
    select: (data) => data.messages,
    enabled: !!conversationId,
  });
};

/**
 * Hook for editing message
 */
export const useEditMessage = () => {
  return useMutation({
    mutationFn: (data: EditMessageRequest) =>
      messagesService.editMessage(data),
    onError: (error) => {
      console.error("Edit message failed:", error);
    },
  });
};

/**
 * Hook for deleting message
 */
export const useDeleteMessage = () => {
  return useMutation({
    mutationFn: (data: DeleteMessageRequest) =>
      messagesService.deleteMessage(data),
    onError: (error) => {
      console.error("Delete message failed:", error);
    },
  });
};

/**
 * Hook for marking messages as read
 */
export const useMarkAsRead = () => {
  return useMutation({
    mutationFn: (data: MarkAsReadRequest) =>
      messagesService.markAsRead(data),
    onError: (error) => {
      console.error("Mark as read failed:", error);
    },
  });
};

/**
 * Hook for getting read receipts
 */
export const useReadReceipts = (messageId: string) => {
  return useQuery({
    queryKey: ["readReceipts", messageId],
    queryFn: () => messagesService.getReadReceipts(messageId),
    enabled: !!messageId,
  });
};

/**
 * Hook for reacting to message
 */
export const useReactToMessage = () => {
  return useMutation({
    mutationFn: (data: ReactToMessageRequest) =>
      messagesService.reactToMessage(data),
    onError: (error) => {
      console.error("React to message failed:", error);
    },
  });
};

/**
 * Hook for removing reaction
 */
export const useRemoveReaction = () => {
  return useMutation({
    mutationFn: (data: RemoveReactionRequest) =>
      messagesService.removeReaction(data),
    onError: (error) => {
      console.error("Remove reaction failed:", error);
    },
  });
};

/**
 * Hook for getting reactions on message
 */
export const useMessageReactions = (messageId: string) => {
  return useQuery({
    queryKey: ["reactions", messageId],
    queryFn: () => messagesService.getReactions(messageId),
    enabled: !!messageId,
  });
};

/**
 * Hook for searching messages
 */
export const useSearchMessages = (
  query: string,
  conversationId: string,
  limit: number = 20
) => {
  return useQuery({
    queryKey: ["searchMessages", { query, conversationId, limit }],
    queryFn: () =>
      messagesService.searchMessages(query, conversationId, limit),
    select: (data) => data.messages,
    enabled: !!query && !!conversationId,
  });
};
