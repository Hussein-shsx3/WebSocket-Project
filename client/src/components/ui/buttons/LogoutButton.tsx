"use client";

import { useLogout } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

/**
 * LogoutButton Component (Testing Only)
 * 
 * Simple logout button for testing authentication flow
 * Will be removed after auth is complete
 */
export const LogoutButton = () => {
  const router = useRouter();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        // Redirect to sign in after successful logout
        router.push("/signIn");
      },
      onError: (error) => {
        console.error("Logout failed:", error);
        // Still redirect even if logout fails
        router.push("/signIn");
      },
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
      style={{
        padding: "8px 16px",
        backgroundColor: "#dc2626",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
      }}
    >
      {logoutMutation.isPending ? "Logging out..." : "Logout (Testing)"}
    </button>
  );
};
