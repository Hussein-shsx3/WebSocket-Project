import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  userService,
  UserProfile,
  UpdateProfileDTO,
} from "@/services/user.service";

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

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileDTO) => userService.updateUserProfile(data),
    onSuccess: (updatedUser) => {
      // Update cached profile data
      queryClient.setQueryData(["userProfile"], updatedUser);

      // Also update the currentUser cache from auth
      queryClient.setQueryData(
        ["currentUser"],
        (old: UserProfile | undefined) => ({
          ...old,
          ...updatedUser,
        }),
      );
    },
    onError: (error) => {
      console.error("Update profile failed:", error);
    },
  });
};

/**
 * Hook to upload user avatar
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => userService.uploadUserAvatar(file),
    onSuccess: (updatedUser) => {
      // Update cached profile data
      queryClient.setQueryData(["userProfile"], updatedUser);

      // Also update the currentUser cache
      queryClient.setQueryData(
        ["currentUser"],
        (old: UserProfile | undefined) => ({
          ...old,
          avatar: updatedUser.avatar,
        }),
      );
    },
    onError: (error) => {
      console.error("Avatar upload failed:", error);
    },
  });
};

/**
 * Hook to update user status
 */
export const useUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: string) => userService.updateUserStatus(status),
    onSuccess: (_, status) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        ["userProfile"],
        (old: UserProfile | undefined) => {
          if (!old) return old;
          return { ...old, status };
        },
      );
    },
    onError: (error) => {
      console.error("Status update failed:", error);
      // Refetch to revert optimistic update
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
};

/**
 * Hook to delete user account
 */
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => userService.deleteUserAccount(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();

      // Redirect to sign in page
      router.push("/signIn");
    },
    onError: (error) => {
      console.error("Account deletion failed:", error);
    },
  });
};

/**
 * Hook to search users
 */
export const useSearchUsers = (query: string, limit: number = 10) => {
  return useQuery({
    queryKey: ["searchUsers", query, limit],
    queryFn: () => userService.searchUsers(query, limit),
    enabled: query.length > 0, // Only search if query is not empty
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to get user by ID (public profile)
 */
export const useUserById = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
