import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService, LoginRequest, RegisterRequest, User } from "@/services/auth.service";

/**
 * Hook for user login
 * Cookies are set automatically by the server
 */
export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (user: User) => {
      // Update user cache
      queryClient.setQueryData(["currentUser"], user);
      
      // Redirect to chats
      router.push("/chats");
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
    },
  });
};

/**
 * Hook for user registration
 */
export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => {
      // Optionally redirect to verification page or show message
      router.push("/verify-email-sent");
    },
    onError: (error: any) => {
      console.error("Registration failed:", error);
    },
  });
};

/**
 * Hook for user logout
 * Server clears cookies automatically
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
    onError: (error: any) => {
      console.error("Logout failed:", error);
      // Still clear cache even on error
      queryClient.clear();
    },
    // authService.logout() already redirects to /signIn
  });
};

/**
 * Hook to get current authenticated user
 * Useful for checking auth status
 */
export const useCurrentUser = () => {
  return useQuery<User>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const user = await authService.getCurrentUser();
      return user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for email verification
 */
export const useVerifyEmail = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onSuccess: () => {
      // Redirect to login after successful verification
      router.push("/signIn?verified=true");
    },
    onError: (error: any) => {
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
    onError: (error: any) => {
      console.error("Resend verification failed:", error);
    },
  });
};

/**
 * Hook for requesting password reset
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onError: (error: any) => {
      console.error("Password reset request failed:", error);
    },
  });
};

/**
 * Hook for resetting password
 */
export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      authService.resetPassword(data.token, data.password),
    onSuccess: () => {
      // Redirect to login after successful password reset
      router.push("/signIn?reset=true");
    },
    onError: (error: any) => {
      console.error("Password reset failed:", error);
    },
  });
};