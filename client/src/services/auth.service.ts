import { axiosInstance } from "@/lib/axios";

/**
 * Request/Response Types
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

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    // NO accessToken - it's in httpOnly cookie now
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

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Auth Service
 * All token management is handled by httpOnly cookies
 */
export const authService = {
  /**
   * Login with email and password
   * Server sets accessToken and refreshToken as httpOnly cookies
   */
  async login(data: LoginRequest): Promise<User> {
    const response = await axiosInstance.post<AuthResponse>("/auth/login", data);
    return response.data.data.user;
  },

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse["data"]> {
    const response = await axiosInstance.post<RegisterResponse>(
      "/auth/register",
      data
    );
    return response.data.data;
  },

  /**
   * Logout user
   * Server clears both cookies
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post("/auth/logout");
    } finally {
      // Always redirect to login, even if request fails
      if (typeof window !== "undefined") {
        window.location.href = "/signIn";
      }
    }
  },

  /**
   * Refresh access token
   * This is called automatically by axios interceptor
   * You typically don't need to call this manually
   * Server reads refreshToken from cookie and sets new accessToken cookie
   */
  async refreshToken(): Promise<void> {
    await axiosInstance.post("/auth/refresh-tokens");
    // No return value needed - new cookie is set by server
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<ApiResponse> {
    const response = await axiosInstance.get<ApiResponse>(
      "/auth/verify-email",
      {
        params: { token },
      }
    );
    return response.data;
  },

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<ApiResponse> {
    const response = await axiosInstance.post<ApiResponse>(
      "/auth/resend-verification",
      { email }
    );
    return response.data;
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await axiosInstance.post<ApiResponse>(
      "/auth/forgot-password",
      { email }
    );
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    const response = await axiosInstance.post<ApiResponse>(
      "/auth/reset-password",
      { token, password }
    );
    return response.data;
  },

  /**
   * Get current authenticated user
   * Useful for checking auth status or getting user info
   */
  async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get<AuthResponse>("/auth/me");
    return response.data.data.user;
  },

  /**
   * Initiate Google OAuth login
   * Redirects user to Google login page
   */
  initiateGoogleAuth(): void {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    window.location.href = `${apiUrl}/auth/google`;
  },
};