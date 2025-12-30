"use client";

import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

/**
 * Hook to get current user information from JWT token
 * Returns user ID, email, and role
 */
export const useCurrentUser = () => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      return null;
    }

    const decoded = jwtDecode<JWTPayload>(token);

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
