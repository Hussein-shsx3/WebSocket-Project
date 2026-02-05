import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { messagesService, SendMessageRequest, Message } from "@/services/messages.service";

/**
 * Hook for getting messages in a conversation
 */
export const useMessages = (conversationId: string | null, limit: number = 50) => {
  return useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam = 0 }) =>
      messagesService.getMessages(conversationId!, limit, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.reduce((acc, page) => acc + page.messages.length, 0);
    },
    initialPageParam: 0,
    enabled: !!conversationId,
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Hook for sending a message
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageRequest) => messagesService.sendMessage(data),
    onSuccess: (newMessage) => {
      // Optimistically add the message to the cache
      queryClient.setQueryData(
        ["messages", newMessage.conversationId],
        (oldData: { pages: { messages: Message[]; hasMore: boolean }[] } | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page, index) =>
              index === 0
                ? { ...page, messages: [newMessage, ...page.messages] }
                : page
            ),
          };
        }
      );
      // Invalidate conversations to update last message
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Send message failed:", error);
    },
  });
};

/**
 * Hook for editing a message
 */
export const useEditMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      messagesService.editMessage(messageId, content),
    onSuccess: (updatedMessage) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", updatedMessage.conversationId],
      });
    },
    onError: (error) => {
      console.error("Edit message failed:", error);
    },
  });
};

/**
 * Hook for deleting a message
 */
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => messagesService.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Delete message failed:", error);
    },
  });
};

/**
 * Hook for marking messages as read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      messageIds,
    }: {
      conversationId: string;
      messageIds: string[];
    }) => messagesService.markAsRead(conversationId, messageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Mark as read failed:", error);
    },
  });
};

/**
 * Hook for uploading media
 */
export const useUploadMedia = () => {
  return useMutation({
    mutationFn: (file: File) => messagesService.uploadMedia(file),
    onError: (error) => {
      console.error("Upload media failed:", error);
    },
  });
};

/**
 * Hook for reacting to a message
 */
export const useReactToMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      messagesService.reactToMessage(messageId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (error) => {
      console.error("React to message failed:", error);
    },
  });
};

/**
 * Hook for removing reaction from message
 */
export const useRemoveReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      messagesService.removeReaction(messageId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (error) => {
      console.error("Remove reaction failed:", error);
    },
  });
};
