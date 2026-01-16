"use client";

import { useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const useGoogleCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Process auth data - compute once without side effects
  const errorMessage = useMemo(() => {
    const token = searchParams.get("token");
    const userJson = searchParams.get("user");

    // Validation: missing data
    if (!token || !userJson) {
      return "Invalid callback: missing token or user data";
    }

    try {
      // Parse user data (validates JSON structure)
      JSON.parse(decodeURIComponent(userJson));

      // Since server sets cookies, no need to store token manually
      return "";
    } catch (err) {
      console.error("Error processing Google callback:", err);
      return "Failed to process authentication. Please try again.";
    }
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
