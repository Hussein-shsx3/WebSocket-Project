import { Request, Response } from "express";
import { generateRefreshToken, generateAccessToken } from "../utils/jwt.util";
import { config } from "../config/env.config";
import { asyncHandler } from "../middleware/error.middleware";
import prisma from "../config/db";

/**
 * Cookie configuration helper
 * 
 * For cross-origin deployments (frontend and backend on different domains):
 * - sameSite: "none" allows cookies to be sent cross-origin
 * - secure: true is REQUIRED when sameSite is "none"
 */
const getRefreshTokenCookieConfig = () => {
  const isProduction = config.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };
};

/**
 * Google OAuth callback
 * - Sets refresh token cookie
 * - Redirects to frontend
 */
export const googleCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const googleUser = (req as any).user;

    if (!googleUser?.id || !googleUser?.email) {
      return res.redirect(
        `${config.CLIENT_URL}/google-callback?error=auth_failed`,
      );
    }

    const payload = {
      userId: googleUser.id,
      email: googleUser.email,
      role: googleUser.role || "USER",
    };

    // 🔐 Tokens
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token in DB
    await prisma.user.update({
      where: { id: googleUser.id },
      data: { refreshToken },
    });

    // HTTP-only refresh cookie
    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieConfig());

    // ⬅️ Send access token to frontend
    res.redirect(
      `${config.CLIENT_URL}/google-callback?accessToken=${accessToken}`,
    );
  },
);

/**
 * Initiates Google login
 */
export const googleAuth = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    message: "Redirecting to Google login...",
  });
};
