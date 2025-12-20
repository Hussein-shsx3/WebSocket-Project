import { axiosInstance } from "@/lib/axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  verificationToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export const authService = {
  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
      data: { user: AuthResponse['user']; accessToken: string };
    }>("/auth/login", data);
    
    return {
      accessToken: response.data.data.accessToken,
      user: response.data.data.user,
    };
  },

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
      data: { user: RegisterResponse['user']; verificationToken: string };
    }>("/auth/register", data);
    
    return {
      user: response.data.data.user,
      verificationToken: response.data.data.verificationToken,
    };
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await axiosInstance.post("/auth/logout");
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await axiosInstance.post<RefreshTokenResponse>(
      "/auth/refresh-tokens",
      { refreshToken }
    );
    return response.data;
  },

  /**
   * Verify email
   */
  async verifyEmail(token: string) {
    const response = await axiosInstance.get("/auth/verify-email", {
      params: { token },
    });
    return response.data;
  },

  /**
   * Resend verification email
   */
  async resendVerification(email: string) {
    const response = await axiosInstance.post("/auth/resend-verification", {
      email,
    });
    return response.data;
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    const response = await axiosInstance.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    const response = await axiosInstance.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },

  /**
   * Initiate Google OAuth login
   * Redirects user to Google login page
   */
  initiateGoogleAuth(): void {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    window.location.href = `${apiUrl}/auth/google`;
  },
};
