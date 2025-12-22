import { axiosInstance } from "@/lib/axios";

/**
 * Friend Request DTOs
 */
export interface FriendRequest {
  id: string;
  senderId: string;
  recipientId: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface SendFriendRequestParams {
  recipientId: string;
}

export interface SendFriendRequestResponse {
  friendRequest: FriendRequest;
}

/**
 * Friend DTOs
 */
export interface Friend {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  bio?: string;
}

export interface GetFriendsResponse {
  friends: Friend[];
}

/**
 * Friend Requests List Response
 */
export interface GetFriendRequestsResponse {
  friendRequests: FriendRequest[];
}

/**
 * Accept/Reject Friend Request Response
 */
export interface ModifyFriendRequestResponse {
  success: boolean;
}

/**
 * Friends Service
 * Handles all friend-related API calls
 */
export const friendsService = {
  /**
   * Send friend request to a user
   */
  async sendFriendRequest(
    data: SendFriendRequestParams
  ): Promise<SendFriendRequestResponse> {
    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
      data: SendFriendRequestResponse;
    }>("/friends/request", data);

    return response.data.data;
  },

  /**
   * Accept friend request
   */
  async acceptFriendRequest(requestId: string): Promise<void> {
    await axiosInstance.patch<{
      success: boolean;
      message: string;
    }>(`/friends/request/${requestId}/accept`);
  },

  /**
   * Reject friend request
   */
  async rejectFriendRequest(requestId: string): Promise<void> {
    await axiosInstance.patch<{
      success: boolean;
      message: string;
    }>(`/friends/request/${requestId}/reject`);
  },

  /**
   * Cancel sent friend request
   */
  async cancelFriendRequest(requestId: string): Promise<void> {
    await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>(`/friends/request/${requestId}`);
  },

  /**
   * Get pending friend requests
   * Requests where current user is recipient
   */
  async getPendingRequests(): Promise<GetFriendRequestsResponse> {
    const response = await axiosInstance.get<{
      success: boolean;
      message: string;
      data: GetFriendRequestsResponse;
    }>("/friends/requests", {
      params: { type: "pending" },
    });

    return response.data.data;
  },

  /**
   * Get sent friend requests
   * Requests where current user is sender
   */
  async getSentRequests(): Promise<GetFriendRequestsResponse> {
    const response = await axiosInstance.get<{
      success: boolean;
      message: string;
      data: GetFriendRequestsResponse;
    }>("/friends/requests", {
      params: { type: "sent" },
    });

    return response.data.data;
  },

  /**
   * Get all friends list
   */
  async getFriends(): Promise<GetFriendsResponse> {
    const response = await axiosInstance.get<{
      success: boolean;
      message: string;
      data: GetFriendsResponse;
    }>("/friends");

    return response.data.data;
  },

  /**
   * Remove friend
   */
  async removeFriend(friendId: string): Promise<void> {
    await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>(`/friends/${friendId}`);
  },
};
