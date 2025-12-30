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
): void => {
  try {
    const authHeader = req.headers.authorization;
    // auth header debug log removed

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("No token provided");
    }

    const token = authHeader.slice(7);
    // token debug log removed

    const decoded = verifyAccessToken(token);
    // decoded token debug log removed

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || "USER",
    };

    next();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Auth Error:", errorMessage); // Debug log
    res.status(401).json({
      success: false,
      message: "Unauthorized",
      error: errorMessage,
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
): void => {
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
