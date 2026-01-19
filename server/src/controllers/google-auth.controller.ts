import { Request, Response } from "express";
import { generateRefreshToken } from "../utils/jwt.util";
import { config } from "../config/env.config";
import { asyncHandler } from "../middleware/error.middleware";
import prisma from "../config/db";

/**
 * Cookie configuration helper
 */
const getRefreshTokenCookieConfig = () => ({
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: "lax" as const, // Allow cross-origin for localhost development
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
});

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
        `${config.CLIENT_URL}/google-callback?error=${encodeURIComponent(
          "Authentication failed",
        )}`,
      );
    }

    // Generate refresh token ONLY
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

    // Redirect WITHOUT tokens
    res.redirect(`${config.CLIENT_URL}/google-callback?success=true`);
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
