import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  conversationsService,
  GetOrCreateConversationRequest,
  ConversationUser,
} from "@/services/conversations.service";

/**
 * Hook for getting or creating conversation with a friend
 */
export const useGetOrCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GetOrCreateConversationRequest) =>
      conversationsService.getOrCreateConversation(data),
    onSuccess: () => {
      // Invalidate conversations list to refetch
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Get or create conversation failed:", error);
    },
  });
};

/**
 * Hook for getting all conversations
 * @param limit - Maximum number of conversations to return (default: 50)
 * @param page - Page number for pagination (default: 1)
 * @param archived - Filter by archived status (optional)
 * @param enabled - Whether the query should run (default: true)
 */
export const useConversations = (
  limit: number = 50,
  page: number = 1,
  archived?: boolean,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["conversations", { limit, page, archived }],
    queryFn: () => conversationsService.getConversations(limit, page, archived),
    select: (data) => data.conversations,
    staleTime: 1000 * 60, // 1 minute
    enabled,
  });
};

/**
 * Hook for getting single conversation
 * @param conversationId - ID of the conversation to fetch
 */
export const useConversation = (conversationId: string | null) => {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => conversationsService.getConversation(conversationId!),
    select: (data) => data.conversation,
    enabled: !!conversationId,
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Hook for getting other user in conversation
 * @param conversationId - ID of the conversation
 */
export const useConversationOtherUser = (conversationId: string | null) => {
  return useQuery<ConversationUser>({
    queryKey: ["conversation", conversationId, "otherUser"],
    queryFn: () => conversationsService.getOtherUser(conversationId!),
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook for archiving conversation
 */
export const useArchiveConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationsService.archiveConversation({ conversationId }),
    onSuccess: () => {
      // Refetch conversations list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Archive conversation failed:", error);
    },
  });
};

/**
 * Hook for unarchiving conversation
 */
export const useUnarchiveConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationsService.unarchiveConversation({ conversationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Unarchive conversation failed:", error);
    },
  });
};

/**
 * Hook for muting conversation
 */
export const useMuteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationsService.muteConversation({ conversationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Mute conversation failed:", error);
    },
  });
};

/**
 * Hook for unmuting conversation
 */
export const useUnmuteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationsService.unmuteConversation({ conversationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Unmute conversation failed:", error);
    },
  });
};

/**
 * Hook for deleting conversation
 */
export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationsService.deleteConversation({ conversationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Delete conversation failed:", error);
    },
  });
};