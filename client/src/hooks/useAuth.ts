import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  authService,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/services/auth.service";
import { getAccessToken } from "@/lib/axios";

/**
 * LOGIN
 */
export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: ({ user }) => {
      // Cache user
      queryClient.setQueryData(["currentUser"], user);

      router.push("/chats");
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

/**
 * REGISTER
 */
export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => {
      router.push("/verify-email-sent");
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
};

/**
 * LOGOUT
 */
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
      router.push("/signIn");
    },
    onError: () => {
      // Even if backend fails, clear local state
      queryClient.clear();
      router.push("/signIn");
    },
  });
};

/**
 * CURRENT USER
 * - Used on app load
 * - Used for protected routes
 */
export const useCurrentUser = () => {
  return useQuery<User>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      // If access token expired, axios interceptor will refresh it
      return await authService.getCurrentUser();
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * BOOTSTRAP AUTH (IMPORTANT)
 * Call this ONCE on app load
 */
export const useAuthBootstrap = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["auth-bootstrap"],
    queryFn: async () => {
      try {
        const accessToken = getAccessToken();
        
        // If we have a valid access token, just fetch user
        if (accessToken) {
          const user = await authService.getCurrentUser();
          queryClient.setQueryData(["currentUser"], user);
          return user;
        }
        
        // Otherwise, refresh tokens
        await authService.refreshToken();
        const user = await authService.getCurrentUser();
        queryClient.setQueryData(["currentUser"], user);
        return user;
      } catch {
        // Not authenticated
        queryClient.removeQueries({ queryKey: ["currentUser"] });
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
};

/**
 * EMAIL VERIFICATION
 */
export const useVerifyEmail = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onSuccess: () => {
      router.push("/signIn?verified=true");
    },
    onError: (error) => {
      console.error("Email verification failed:", error);
    },
  });
};

/**
 * RESEND VERIFICATION
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
 * FORGOT PASSWORD
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onError: (error) => {
      console.error("Password reset request failed:", error);
    },
  });
};

/**
 * RESET PASSWORD
 */
export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      authService.resetPassword(data.token, data.password),
    onSuccess: () => {
      router.push("/signIn?reset=true");
    },
    onError: (error) => {
      console.error("Password reset failed:", error);
    },
  });
};
