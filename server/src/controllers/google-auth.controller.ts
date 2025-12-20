import { Request, Response } from "express";
import { generateAuthTokens } from "../utils/jwt.util";
import { config } from "../config/env.config";
import { asyncHandler } from "../middleware/error.middleware";

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const googleUser = (req as any).user as
      | { id: string; email: string; name?: string; avatar?: string; role?: string }
      | undefined;

    if (!googleUser || !googleUser.id || !googleUser.email) {
      res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
      return;
    }

    const tokens = generateAuthTokens({
      userId: googleUser.id,
      email: googleUser.email,
      role: googleUser.role || "USER",
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const redirectUrl = `${config.CLIENT_URL}/google-callback?token=${tokens.accessToken}&user=${encodeURIComponent(
      JSON.stringify({
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name || "",
        avatar: googleUser.avatar || "",
        role: googleUser.role || "USER",
      })
    )}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Google callback error:", error);
    res.redirect(
      `${config.CLIENT_URL}/auth/error?message=Authentication failed`
    );
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
