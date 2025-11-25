import { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema, resendVerificationSchema, forgotPasswordSchema, resetPasswordSchema } from "../dto/auth.dto";
import { asyncHandler } from "../middleware/error.middleware";

const authService = new AuthService();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    const errors = z.treeifyError(parse.error);
    return res.status(400).json({ success: false, errors });
  }

  const result = await authService.register(parse.data);

  return res.status(201).json({
    success: true,
    message: result.message,
    data: result.data,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    const errors = z.treeifyError(parse.error);
    return res.status(400).json({ success: false, errors });
  }

  const result = await authService.login(parse.data);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.status(200).json({
    success: true,
    message: result.message,
    data: result.data,
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

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
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
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
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
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const parse = resetPasswordSchema.safeParse(req.body);
  if (!parse.success) {
    const errors = z.treeifyError(parse.error);
    return res.status(400).json({ success: false, errors });
  }

  const result = await authService.resetPassword(parse.data.token, parse.data.password);

  return res.status(200).json({
    success: true,
    message: result.message,
    data: result.data,
  });
});

export const refreshTokens = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  const result = await authService.refreshTokens(refreshToken);

  res.cookie("refreshToken", result.tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "Tokens refreshed",
    data: { accessToken: result.tokens.accessToken },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Get userId from auth middleware (assumes auth middleware sets user on req)
  const userId = (req as any).user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  await authService.logout(userId);

  res.clearCookie("refreshToken");

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
