import { Request, Response } from "express";
import { generateAuthTokens } from "../utils/jwt.util";
import { config } from "../config/env.config";

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
      return;
    }

    const tokens = generateAuthTokens({
      userId: user.id,
      email: user.email,
      role: user.role || "USER",
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    const redirectUrl = `${config.CLIENT_URL}/auth/google/callback?token=${tokens.accessToken}&user=${encodeURIComponent(
      JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
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

export const googleAuth = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Redirecting to Google login...",
  });
};

export const googleLogout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    req.logout((err) => {
      if (err) {
        res.status(500).json({
          success: false,
          message: "Logout failed",
        });
        return;
      }

      res.clearCookie("refreshToken");

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    });
  } catch (error) {
    console.error("Google logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
