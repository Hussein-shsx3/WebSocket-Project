import { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service";
import {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../dto/auth.dto";
import { asyncHandler } from "../middleware/error.middleware";

const authService = new AuthService();

/**
 * Cookie configuration helper
 */
const getCookieConfig = (maxAge: number) => ({
  httpOnly: true, // Cannot be accessed by JavaScript
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "lax" as const, // CSRF protection
  maxAge, // in milliseconds
  path: "/", // Available on all routes
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    const errors = z.treeifyError(parse.error);
    return res.status(400).json({ success: false, errors });
  }

  const result = await authService.register(parse.data);

  return res.status(201).json({
    success: true,
    message: "User registered successfully. Please verify your email.",
    data: {
      user: result.user,
      verificationToken: result.verificationToken,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    const errors = z.treeifyError(parse.error);
    return res.status(400).json({ success: false, errors });
  }

  const result = await authService.login(parse.data);

  console.log("✅ Login successful, setting cookies");
  // Set both tokens as httpOnly cookies
  // Access token - 15 minutes (for testing, change to 1h for production)
  res.cookie(
    "accessToken",
    result.accessToken,
    getCookieConfig(15 * 60 * 1000) // 15 minutes
  );

  // Refresh token - 7 days
  res.cookie(
    "refreshToken",
    result.refreshToken,
    getCookieConfig(7 * 24 * 60 * 60 * 1000) // 7 days
  );

  // Return user data only (NO tokens in response body)
  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: result.user,
    },
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({
      success: false,
      message: "Verification token is required",
    });
  }

  const result = await authService.verifyEmail(token);

  return res.status(200).json({
    success: true,
    message: result.message,
    data: result.data,
  });
});

export const resendVerification = asyncHandler(
  async (req: Request, res: Response) => {
    const parse = resendVerificationSchema.safeParse(req.body);
    if (!parse.success) {
      const errors = z.treeifyError(parse.error);
      return res.status(400).json({ success: false, errors });
    }

    const result = await authService.resendVerification(parse.data.email);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  }
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const parse = forgotPasswordSchema.safeParse(req.body);
    if (!parse.success) {
      const errors = z.treeifyError(parse.error);
      return res.status(400).json({ success: false, errors });
    }

    const result = await authService.forgotPassword(parse.data.email);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const parse = resetPasswordSchema.safeParse(req.body);
    if (!parse.success) {
      const errors = z.treeifyError(parse.error);
      return res.status(400).json({ success: false, errors });
    }

    const result = await authService.resetPassword(
      parse.data.token,
      parse.data.password
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  }
);

export const refreshTokens = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("🔄 Refresh tokens request received");
    // Get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;
    console.log("Refresh token from cookie:", !!refreshToken);

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
    }

    const result = await authService.refreshTokens(refreshToken);

    console.log("✅ Refresh successful, setting new cookies");
    // Set new access token as cookie
    res.cookie(
      "accessToken",
      result.tokens.accessToken,
      getCookieConfig(15 * 60 * 1000) // 15 minutes
    );

    // Update refresh token cookie (rotation strategy)
    res.cookie(
      "refreshToken",
      result.tokens.refreshToken,
      getCookieConfig(7 * 24 * 60 * 60 * 1000) // 7 days
    );

    // Return success only (NO tokens in response body)
    return res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
    });
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  await authService.logout(userId);

  // Clear both cookies
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const result = await authService.getCurrentUser(userId);

  return res.json({
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});
