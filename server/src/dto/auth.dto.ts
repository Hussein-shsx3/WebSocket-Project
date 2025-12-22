import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterDTO = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginDTO = z.infer<typeof loginSchema>;

// Resend verification (by email)
export const resendVerificationSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});
export type ResendVerificationDTO = z.infer<typeof resendVerificationSchema>;

// Forgot password (request reset link)
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;

// Reset password (use token from email + new password)
export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Invalid token"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;

