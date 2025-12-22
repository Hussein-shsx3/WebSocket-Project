import { useMutation, useQuery } from "@tanstack/react-query";
import {
  conversationsService,
  GetOrCreateConversationRequest,
} from "@/services/conversations.service";

/**
 * Hook for getting or creating conversation with a friend
 */
export const useGetOrCreateConversation = () => {
  return useMutation({
    mutationFn: (data: GetOrCreateConversationRequest) =>
      conversationsService.getOrCreateConversation(data),
    onError: (error) => {
      console.error("Get or create conversation failed:", error);
    },
  });
};

/**
 * Hook for getting all conversations
 */
export const useConversations = (limit: number = 50, offset: number = 0) => {
  return useQuery({
    queryKey: ["conversations", { limit, offset }],
    queryFn: () => conversationsService.getConversations(limit, offset),
    select: (data) => data.conversations,
  });
};

/**
 * Hook for getting single conversation
 */
export const useConversation = (conversationId: string) => {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => conversationsService.getConversation(conversationId),
    select: (data) => data.conversation,
    enabled: !!conversationId,
  });
};

/**
 * Hook for getting other user in conversation
 */
export const useConversationOtherUser = (conversationId: string) => {
  return useQuery({
    queryKey: ["conversation", conversationId, "otherUser"],
    queryFn: () => conversationsService.getOtherUser(conversationId),
    select: (data) => data.user,
    enabled: !!conversationId,
  });
};

/**
 * Hook for archiving conversation
 */
export const useArchiveConversation = () => {
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationsService.archiveConversation({ conversationId }),
    onError: (error) => {
      console.error("Archive conversation failed:", error);
    },
  });
};

/**
 * Hook for unarchiving conversation
 */
export const useUnarchiveConversation = () => {
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationsService.unarchiveConversation({ conversationId }),
    onError: (error) => {
      console.error("Unarchive conversation failed:", error);
    },
  });
};

/**
 * Hook for deleting conversation
 */
export const useDeleteConversation = () => {
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationsService.deleteConversation({ conversationId }),
    onError: (error) => {
      console.error("Delete conversation failed:", error);
    },
  });
};
