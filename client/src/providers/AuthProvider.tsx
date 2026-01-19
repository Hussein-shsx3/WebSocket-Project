"use client";

import { useAuthBootstrap } from "@/hooks/useAuth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // This will run once on app load and bootstrap auth state
  useAuthBootstrap();

  return <>{children}</>;
}