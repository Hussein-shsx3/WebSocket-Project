import { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.util";
import { config } from "../config/env.config";
import { asyncHandler } from "../middleware/error.middleware";
import prisma from "../config/db";

/**
 * Cookie configuration helper
 */
const getRefreshTokenCookieConfig = () => ({
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/", // Available on all routes
});

/**
 * Google OAuth callback
 */
export const googleCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const googleUser = (req as any).user;

    if (!googleUser || !googleUser.id || !googleUser.email) {
      return res.redirect(
        `${config.CLIENT_URL}/google-callback?error=${encodeURIComponent(
          "Authentication failed",
        )}`,
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: googleUser.id,
      email: googleUser.email,
      role: googleUser.role || "USER",
    });

    const refreshToken = generateRefreshToken({
      userId: googleUser.id,
      email: googleUser.email,
      role: googleUser.role || "USER",
    });

    // Store refresh token in DB
    await prisma.user.update({
      where: { id: googleUser.id },
      data: { refreshToken },
    });

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieConfig());

    // Redirect with access token in URL parameter
    res.redirect(
      `${config.CLIENT_URL}/google-callback?accessToken=${accessToken}`,
    );
  },
);

/**
 * Initiates Google login
 */
export const googleAuth = (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: "Redirecting to Google login...",
  });
};

/**
 * Logout Google user
 */
export const googleLogout = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Remove refresh token from DB
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    // Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  },
);
