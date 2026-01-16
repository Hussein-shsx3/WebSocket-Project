import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { AuthenticationError } from "../types/error.types";

/**
 * Extend Express User type to include custom fields
 */
declare global {
  namespace Express {
    interface User {
      userId?: string;
      email?: string;
      role?: string;
    }
  }
}

/**
 * Authenticate Access Token Middleware (Cookie-based)
 * Reads accessToken from httpOnly cookie instead of Authorization header
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    console.log("🔐 Auth middleware called for:", req.path);
    // Get access token from cookie
    const accessToken = req.cookies?.accessToken;
    console.log("Access token present:", !!accessToken);

    if (!accessToken) {
      throw new AuthenticationError("No access token provided");
    }

    // Verify token
    const decoded = verifyAccessToken(accessToken);

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || "USER",
    };

    next();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Auth Error:", errorMessage);

    // Return 401 for expired/invalid tokens
    // Client's axios interceptor will catch this and trigger refresh
    res.status(401).json({
      success: false,
      message: "Unauthorized",
      error: errorMessage,
    });
  }
};

/**
 * Optional Authenticate - Doesn't throw error if token missing
 * Useful for routes that work for both authenticated and unauthenticated users
 */
export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (accessToken) {
      const decoded = verifyAccessToken(accessToken);

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role || "USER",
      };
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (req: Request): boolean => {
  return !!(req.user && req.user.userId);
};

/**
 * Authorize by role
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role || "USER")) {
      res.status(403).json({
        success: false,
        message:
          "Insufficient permissions. Required roles: " +
          allowedRoles.join(", "),
      });
      return;
    }

    next();
  };
};