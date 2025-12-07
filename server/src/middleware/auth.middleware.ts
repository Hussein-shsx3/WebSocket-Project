import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { AuthenticationError } from "../types/error.types";

/**
 * Extend Passport User type to include custom fields
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
 * Authenticate Access Token Middleware
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  try {
    const authHeader = req.headers.authorization;
    console.log("🔍 Auth Header:", authHeader); // Debug log

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("No token provided");
    }

    const token = authHeader.slice(7);
    console.log("🔍 Token:", token); // Debug log

    const decoded = verifyAccessToken(token);
    console.log("🔍 Decoded:", decoded); // Debug log

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || "USER",
    };

    next();
  } catch (error: any) {
    console.error("❌ Auth Error:", error.message); // Debug log
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      error: error.message,
    });
  }
};

/**
 * Optional Authenticate - Doesn't throw error if token missing
 */
export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const decoded = verifyAccessToken(token);

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
  return (req: Request, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!allowedRoles.includes((req.user as any).role || "USER")) {
      return res.status(403).json({
        success: false,
        message:
          "Insufficient permissions. Required roles: " +
          allowedRoles.join(", "),
      });
    }

    next();
  };
};
