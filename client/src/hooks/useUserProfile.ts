import { useQuery } from "@tanstack/react-query";
import { userService, UserProfile } from "@/services/user.service";

/**
 * Hook to get current user profile
 */
export const useUserProfile = () => {
  return useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: () => userService.getUserProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};