import { axiosInstance } from "@/lib/axios";

/**
 * Friend Request DTOs
 */
export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  sender?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  receiver?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

export interface SendFriendRequestParams {
  receiverId: string;
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
      message: string;
      data: FriendRequest;
    }>("/friends/request", data);

    return { friendRequest: response.data.data };
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
      message: string;
      data: {
        requests: FriendRequest[];
        type: string;
        pagination: { total: number; page: number; limit: number; pages: number };
      };
    }>("/friends/requests", {
      params: { type: "pending" },
    });

    return { friendRequests: response.data.data.requests };
  },

  /**
   * Get sent friend requests
   * Requests where current user is sender
   */
  async getSentRequests(): Promise<GetFriendRequestsResponse> {
    const response = await axiosInstance.get<{
      message: string;
      data: {
        requests: FriendRequest[];
        type: string;
        pagination: { total: number; page: number; limit: number; pages: number };
      };
    }>("/friends/requests", {
      params: { type: "sent" },
    });

    return { friendRequests: response.data.data.requests };
  },

  /**
   * Get all friends list
   */
  async getFriends(): Promise<GetFriendsResponse> {
    const response = await axiosInstance.get<{
      message: string;
      data: {
        friends: Friend[];
        pagination: { total: number; page: number; limit: number; pages: number };
      };
    }>("/friends");

    return { friends: response.data.data.friends };
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
