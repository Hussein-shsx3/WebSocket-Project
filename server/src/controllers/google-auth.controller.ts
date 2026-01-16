import { Request, Response } from "express";
import { generateAuthTokens } from "../utils/jwt.util";
import { config } from "../config/env.config";
import { asyncHandler } from "../middleware/error.middleware";

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const googleUser = (req as any).user;
    if (!googleUser || !googleUser.id || !googleUser.email) {
      return res.status(401).redirect(`${config.CLIENT_URL}/auth/error`);
    }

    const tokens = generateAuthTokens({
      userId: googleUser.id,
      email: googleUser.email,
      role: googleUser.role || "USER",
    });

    // Set both cookies
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: "/",
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    // Redirect to protected page
    res.redirect(`${config.CLIENT_URL}/chats`);
  } catch (error) {
    console.error("Google callback error:", error);
    res.redirect(`${config.CLIENT_URL}/auth/error`);
  }
};

export const googleAuth = (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: "Redirecting to Google login...",
  });
};

export const googleLogout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
    return;
  }

  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
