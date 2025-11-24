import { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema } from "../dto/auth.dto";
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
