import { useMutation } from "@tanstack/react-query";
import { authService, LoginRequest, RegisterRequest, AuthResponse} from "@/services/auth.service";
import { tokenManager } from "@/lib/axios";

/**
 * Hook for user login
 */
export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data: AuthResponse) => {
      tokenManager.setAccessToken(data.accessToken);
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

/**
 * Hook for user registration
 */
export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
};

/**
 * Hook for user logout
 */
export const useLogout = () => {
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      tokenManager.clearTokens();
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      tokenManager.clearTokens();
    },
  });
};

/**
 * Hook for email verification
 */
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onError: (error) => {
      console.error("Email verification failed:", error);
    },
  });
};

/**
 * Hook for resending verification email
 */
export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
    onError: (error) => {
      console.error("Resend verification failed:", error);
    },
  });
};

/**
 * Hook for requesting password reset
 */
export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (email: string) => authService.requestPasswordReset(email),
    onError: (error) => {
      console.error("Password reset request failed:", error);
    },
  });
};

/**
 * Hook for resetting password
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      authService.resetPassword(data.token, data.newPassword),
    onError: (error) => {
      console.error("Password reset failed:", error);
    },
  });
};
