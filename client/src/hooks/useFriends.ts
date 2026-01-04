import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  friendsService,
  SendFriendRequestParams,
} from "@/services/friends.service";

/**
 * Hook for sending friend requests
 */
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SendFriendRequestParams) =>
      friendsService.sendFriendRequest(data),
    onSuccess: () => {
      // Invalidate sent requests to refresh the list
      queryClient.invalidateQueries({ queryKey: ["friendRequests", "sent"] });
    },
    onError: (error) => {
      console.error("Send friend request failed:", error);
    },
  });
};

/**
 * Hook for accepting friend requests
 */
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (requestId: string) =>
      friendsService.acceptFriendRequest(requestId),
    onSuccess: () => {
      // Invalidate pending requests, friends list, and conversations (new conversation is created)
      queryClient.invalidateQueries({ queryKey: ["friendRequests", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Accept friend request failed:", error);
    },
  });
};

/**
 * Hook for rejecting friend requests
 */
export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (requestId: string) =>
      friendsService.rejectFriendRequest(requestId),
    onSuccess: () => {
      // Invalidate pending requests
      queryClient.invalidateQueries({ queryKey: ["friendRequests", "pending"] });
    },
    onError: (error) => {
      console.error("Reject friend request failed:", error);
    },
  });
};

/**
 * Hook for canceling sent friend requests
 */
export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (requestId: string) =>
      friendsService.cancelFriendRequest(requestId),
    onSuccess: () => {
      // Invalidate sent requests
      queryClient.invalidateQueries({ queryKey: ["friendRequests", "sent"] });
    },
    onError: (error) => {
      console.error("Cancel friend request failed:", error);
    },
  });
};

/**
 * Hook for getting pending friend requests
 */
export const usePendingFriendRequests = () => {
  return useQuery({
    queryKey: ["friendRequests", "pending"],
    queryFn: () => friendsService.getPendingRequests(),
    select: (data) => data.friendRequests,
  });
};

/**
 * Hook for getting sent friend requests
 */
export const useSentFriendRequests = () => {
  return useQuery({
    queryKey: ["friendRequests", "sent"],
    queryFn: () => friendsService.getSentRequests(),
    select: (data) => data.friendRequests,
  });
};

/**
 * Hook for getting friends list
 */
export const useFriendsList = () => {
  return useQuery({
    queryKey: ["friends"],
    queryFn: () => friendsService.getFriends(),
    select: (data) => data.friends,
  });
};

/**
 * Hook for removing friend
 */
export const useRemoveFriend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (friendId: string) => friendsService.removeFriend(friendId),
    onSuccess: () => {
      // Invalidate friends list
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error) => {
      console.error("Remove friend failed:", error);
    },
  });
};
