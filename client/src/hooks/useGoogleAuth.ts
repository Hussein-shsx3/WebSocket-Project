import { authService } from "@/services/auth.service";

export const useGoogleAuth = () => {
  const handleGoogleAuth = () => {
    try {
      authService.initiateGoogleAuth();
    } catch (error) {
      console.error("Google auth error:", error);
    }
  };

  return { handleGoogleAuth };
};
