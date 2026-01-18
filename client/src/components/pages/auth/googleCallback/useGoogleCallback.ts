"use client";

import { useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const useGoogleCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Process auth data - compute once without side effects
  const errorMessage = useMemo(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (error) {
      return decodeURIComponent(error);
    }

    if (success === "true") {
      return "";
    }

    return "Invalid callback parameters";
  }, [searchParams]);

  // Handle navigation after processing
  useEffect(() => {
    if (errorMessage) {
      // Redirect to sign in on error after delay
      const timer = setTimeout(() => router.push("/signIn"), 2000);
      return () => clearTimeout(timer);
    } else {
      // Redirect to main app on success
      const timer = setTimeout(() => router.push("/chats"), 1000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, router]);

  return { errorMessage };
};
