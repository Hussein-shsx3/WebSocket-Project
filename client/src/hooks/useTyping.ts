import { useQuery } from "@tanstack/react-query";

/**
 * Hook to get typing users for a conversation
 */
export const useTypingUsers = (conversationId: string) => {
  return useQuery({
    queryKey: ["typing", conversationId],
    queryFn: () => [], // Default to empty array
    initialData: [],
    staleTime: 0, // Always fresh
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};