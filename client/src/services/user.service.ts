import { axiosInstance } from "@/lib/axios";

/**
 * User Status Type
 */
export type UserStatus = "online" | "offline" | "away";

/**
 * User Profile DTO
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  status: UserStatus;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * User Search Result DTO
 */
export interface UserSearchResult {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  bio: string | null;
  status: UserStatus;
}

/**
 * Update Profile DTO
 */
export interface UpdateProfileDTO {
  name?: string;
  bio?: string;
  status?: "online" | "offline" | "away";
}

/**
 * Standard API Response
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * User Service
 * Handles user-related API calls
 */
export const userService = {
  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<UserProfile> {
    const response = await axiosInstance.get<ApiResponse<UserProfile>>(
      "/users/profile"
    );

    return response.data.data;
  },

  /**
   * Update user profile
   */
  async updateUserProfile(data: UpdateProfileDTO): Promise<UserProfile> {
    const response = await axiosInstance.patch<ApiResponse<UserProfile>>(
      "/users/profile",
      data
    );

    return response.data.data;
  },

  /**
   * Upload user avatar
   */
  async uploadUserAvatar(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await axiosInstance.post<ApiResponse<UserProfile>>(
      "/users/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.data;
  },

  /**
   * Update user status
   */
  async updateUserStatus(status: string): Promise<{ success: boolean }> {
    const response = await axiosInstance.patch<ApiResponse<{ status: string }>>(
      "/users/status",
      { status }
    );

    return { success: response.data.success };
  },

  /**
   * Delete user account
   */
  async deleteUserAccount(): Promise<{ success: boolean }> {
    const response = await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>("/users/profile");

    return { success: response.data.success };
  },

  /**
   * Search users by name or email
   */
  async searchUsers(
    query: string,
    limit: number = 10
  ): Promise<UserSearchResult[]> {
    const response = await axiosInstance.get<
      ApiResponse<{ count: number; users: UserSearchResult[] }>
    >(`/users/search?query=${encodeURIComponent(query)}&limit=${limit}`);

    return response.data.data.users;
  },

  /**
   * Get user by ID (public profile)
   */
  async getUserById(userId: string): Promise<UserSearchResult> {
    const response = await axiosInstance.get<ApiResponse<UserSearchResult>>(
      `/users/${userId}`
    );

    return response.data.data;
  },
};