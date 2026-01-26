"use client";

import { useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import axios from "@/lib/axios"; 

export const useGoogleCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract params
  const { accessToken, errorMessage } = useMemo(() => {
    const token = searchParams.get("accessToken");
    const error = searchParams.get("error");

    if (error) {
      return {
        accessToken: null,
        errorMessage: decodeURIComponent(error),
      };
    }

    if (!token) {
      return {
        accessToken: null,
        errorMessage: "Authentication failed. No access token received.",
      };
    }

    return { accessToken: token, errorMessage: "" };
  }, [searchParams]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => router.push("/signIn"), 2000);
      return () => clearTimeout(timer);
    }

    if (accessToken) {
      Cookies.set("accessToken", accessToken, {
        expires: 0.01,
        sameSite: "lax",
      });

      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      const timer = setTimeout(() => router.push("/chats"), 1000);
      return () => clearTimeout(timer);
    }
  }, [accessToken, errorMessage, router]);

  return { errorMessage };
};
