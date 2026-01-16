import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  conversationsService,
  GetOrCreateConversationRequest,
  ConversationUser,
} from "@/services/conversations.service";

export const useGetOrCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GetOrCreateConversationRequest) =>
      conversationsService.getOrCreateConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Get or create conversation failed:", error);
    },
  });
};

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

export const useConversation = (conversationId: string | null) => {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => conversationsService.getConversation(conversationId!),
    select: (data) => data.conversation,
    enabled: !!conversationId,
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useConversationOtherUser = (conversationId: string | null) => {
  return useQuery<ConversationUser>({
    queryKey: ["conversation", conversationId, "otherUser"],
    queryFn: () => conversationsService.getOtherUser(conversationId!),
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

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