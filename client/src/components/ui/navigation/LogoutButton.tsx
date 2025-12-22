"use client";

import { LogOut } from "lucide-react";
import { useLogout } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        router.replace("/signIn");
      },
      onError: (error) => {
        console.error("Logout failed:", error);
        router.replace("/signIn");
      },
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={logout.isPending}
      className="w-full h-11 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
      title="Logout"
    >
      <LogOut className="w-5 h-5" strokeWidth={2} />
    </button>
  );
}
