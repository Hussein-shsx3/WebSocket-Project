import { useMutation, useQuery } from "@tanstack/react-query";
import {
  friendsService,
  SendFriendRequestParams,
} from "@/services/friends.service";

/**
 * Hook for sending friend requests
 */
export const useSendFriendRequest = () => {
  return useMutation({
    mutationFn: (data: SendFriendRequestParams) =>
      friendsService.sendFriendRequest(data),
    onError: (error) => {
      console.error("Send friend request failed:", error);
    },
  });
};

/**
 * Hook for accepting friend requests
 */
export const useAcceptFriendRequest = () => {
  return useMutation({
    mutationFn: (requestId: string) =>
      friendsService.acceptFriendRequest(requestId),
    onError: (error) => {
      console.error("Accept friend request failed:", error);
    },
  });
};

/**
 * Hook for rejecting friend requests
 */
export const useRejectFriendRequest = () => {
  return useMutation({
    mutationFn: (requestId: string) =>
      friendsService.rejectFriendRequest(requestId),
    onError: (error) => {
      console.error("Reject friend request failed:", error);
    },
  });
};

/**
 * Hook for canceling sent friend requests
 */
export const useCancelFriendRequest = () => {
  return useMutation({
    mutationFn: (requestId: string) =>
      friendsService.cancelFriendRequest(requestId),
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
  return useMutation({
    mutationFn: (friendId: string) => friendsService.removeFriend(friendId),
    onError: (error) => {
      console.error("Remove friend failed:", error);
    },
  });
};
