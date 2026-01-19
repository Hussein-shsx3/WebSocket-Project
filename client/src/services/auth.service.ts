// services/auth.service.ts
import { axiosInstance, setAccessToken } from "@/lib/axios";

/**
 * Request Types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * Core Models
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  createdAt?: string;
}

/**
 * Response Types
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    verificationToken: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface CurrentUserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

/**
 * Auth Service
 */
export const authService = {
  /**
   * Login
   */
  async login(
    data: LoginRequest,
  ): Promise<{ user: User; accessToken: string }> {
    const response = await axiosInstance.post<LoginResponse>(
      "/auth/login",
      data,
    );

    const { user, accessToken } = response.data.data;
    setAccessToken(accessToken);

    return { user, accessToken };
  },

  /**
   * Register
   */
  async register(data: RegisterRequest): Promise<RegisterResponse["data"]> {
    const response = await axiosInstance.post<RegisterResponse>(
      "/auth/register",
      data,
    );
    return response.data.data;
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post("/auth/logout");
    } finally {
      setAccessToken(null);
      if (typeof window !== "undefined") {
        window.location.href = "/signIn";
      }
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    const response = await axiosInstance.post<{
      success: boolean;
      data: { accessToken: string };
    }>("/auth/refresh-tokens");

    const accessToken = response.data.data.accessToken;
    setAccessToken(accessToken);

    return accessToken;
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get<CurrentUserResponse>("/auth/me");
    return response.data.data.user;
  },

  /**
   * Email verification
   */
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.get<ApiResponse<void>>(
      "/auth/verify-email",
      { params: { token } },
    );
    return response.data;
  },

  async resendVerification(email: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.post<ApiResponse<void>>(
      "/auth/resend-verification",
      { email },
    );
    return response.data;
  },

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.post<ApiResponse<void>>(
      "/auth/forgot-password",
      { email },
    );
    return response.data;
  },

  async resetPassword(
    token: string,
    password: string,
  ): Promise<ApiResponse<void>> {
    const response = await axiosInstance.post<ApiResponse<void>>(
      "/auth/reset-password",
      { token, password },
    );
    return response.data;
  },

  /**
   * Google OAuth
   */
  initiateGoogleAuth(): void {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

    window.location.href = `${apiUrl}/auth/google`;
  },

  /**
   * Clear access token manually
   */
  clearAccessToken(): void {
    setAccessToken(null);
  },
};
