import { Router } from "express";
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  refreshTokens,
  logout,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * Public Routes
 */
router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-tokens", refreshTokens);

/**
 * Protected Routes (require auth middleware)
 */
router.post("/logout", authenticate, logout);

export default router;
