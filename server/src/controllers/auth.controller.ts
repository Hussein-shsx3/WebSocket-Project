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
 * 
 * For cross-origin deployments (frontend and backend on different domains):
 * - sameSite: "none" allows cookies to be sent cross-origin
 * - secure: true is REQUIRED when sameSite is "none"
 */
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    path: "/",
  };
};

const getRefreshTokenCookieConfig = () => ({
  ...getCookieOptions(),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
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

  // Set refresh token as HTTP-only cookie
  res.cookie(
    "refreshToken",
    result.refreshToken,
    getRefreshTokenCookieConfig(),
  );

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: result.user,
      accessToken: result.accessToken,
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
  },
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
  },
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
      parse.data.password,
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  },
);

export const refreshTokens = asyncHandler(
  async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies?.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    try {
      const { accessToken, refreshToken } =
        await authService.refreshToken(oldRefreshToken);

      // Set new refresh token as HTTP-only cookie
      res.cookie("refreshToken", refreshToken, getRefreshTokenCookieConfig());

      return res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: { accessToken },
      });
    } catch (error: any) {
      // Clear refresh cookie using consistent options
      res.clearCookie("refreshToken", getCookieOptions());

      // Debug logging for refresh failure
      console.error("❌ Refresh token failed:", {
        message: error?.message || "Unknown error",
        stack: error?.stack,
        userId: req.user?.userId || "unknown",
      });

      const message = error?.message || "Failed to refresh token";
      return res.status(401).json({ success: false, message });
    }
  },
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

  // Clear refresh token cookie using consistent options
  res.clearCookie("refreshToken", getCookieOptions());

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
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
  },
);