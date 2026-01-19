"use client";

import { useCurrentUser } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MainLayout } from "./mainLayout";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { data: user, isLoading, error } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      router.push("/signIn");
      return;
    }
    if (!isLoading && !user) {
      router.push("/signIn");
    }
  }, [user, isLoading, error, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-main">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return null;
  }

  return <MainLayout>{children}</MainLayout>;
}