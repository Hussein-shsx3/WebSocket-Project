import { axiosInstance } from "@/lib/axios";

/**
 * User Profile DTO
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  status: string;
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
  status: string;
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
 * User Service
 * Handles user-related API calls
 */
export const userService = {
  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<UserProfile> {
    const response = await axiosInstance.get<{
      success: boolean;
      message: string;
      data: UserProfile;
    }>("/users/profile");

    return response.data.data;
  },

  /**
   * Update user profile
   */
  async updateUserProfile(data: UpdateProfileDTO): Promise<UserProfile> {
    const response = await axiosInstance.patch<{
      success: boolean;
      message: string;
      data: UserProfile;
    }>("/users/profile", data);

    return response.data.data;
  },

  /**
   * Upload user avatar
   */
  async uploadUserAvatar(file: File): Promise<{ avatar: string }> {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
      data: { avatar: string };
    }>("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },

  /**
   * Update user status
   */
  async updateUserStatus(status: string): Promise<{ success: boolean }> {
    const response = await axiosInstance.patch<{
      success: boolean;
      message: string;
    }>("/users/status", { status });

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
  async searchUsers(query: string, limit: number = 10): Promise<UserSearchResult[]> {
    const response = await axiosInstance.get<{
      message: string;
      count: number;
      users: UserSearchResult[];
    }>(`/users/search?query=${encodeURIComponent(query)}&limit=${limit}`);

    return response.data.users;
  },
};