import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { AuthenticationError } from "../types/error.types";

/**
 * Extend Express Request to include user data
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
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
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthenticationError("No token provided - Authorization header is missing");
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("Invalid token format - use 'Bearer <token>'");
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.slice(7);

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || "USER",
    };

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    // Handle token expiration
    if (error instanceof Error && error.message.includes("expired")) {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    // Handle invalid token
    if (error instanceof Error && error.message.includes("Invalid")) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
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

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions. Required roles: " + allowedRoles.join(", "),
      });
    }

    next();
  };
};
