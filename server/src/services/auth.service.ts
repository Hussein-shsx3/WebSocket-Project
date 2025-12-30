import bcrypt from "bcrypt";
import prisma from "../config/db";
import { RegisterDTO, LoginDTO } from "../dto/auth.dto";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateAuthTokens,
} from "../utils/jwt.util";
import {
  ConflictError,
  AuthenticationError,
  BadRequestError,
  NotFoundError,
} from "../types/error.types";
import crypto from "crypto";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../utils/email.util";

export class AuthService {
  async register(data: RegisterDTO) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      data.password,
      parseInt(process.env.BCRYPT_ROUNDS || "10")
    );

    // Create user (role defaults to USER)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // Create email verification record
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationTokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(
      user.email,
      verificationToken,
      verificationLink,
      user.name || undefined
    );

    return {
      user,
      verificationToken,
    };
  }

  async login(data: LoginDTO) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Compare password
    if (!user.password) {
      throw new AuthenticationError("Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async verifyEmail(token: string) {
    // Hash the token to match with DB
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find verification record
    const verification = await prisma.emailVerification.findUnique({
      where: { token: tokenHash },
    });

    if (!verification) {
      throw new BadRequestError("Invalid verification token");
    }

    // Check if token expired
    if (verification.expiresAt < new Date()) {
      throw new BadRequestError("Verification token has expired");
    }

    // Update user to verified
    const user = await prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Delete verification record
    await prisma.emailVerification.delete({
      where: { id: verification.id },
    });

    return {
      success: true,
      message: "Email verified successfully. You can now login.",
      data: { user },
    };
  }

  async resendVerification(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundError("User not found");
    if (user.emailVerified) throw new BadRequestError("Email already verified");

    // Remove old tokens
    await prisma.emailVerification.deleteMany({ where: { userId: user.id } });

    // Create new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationTokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(
      user.email,
      verificationToken,
      verificationLink,
      user.name || undefined
    );

    return { success: true, message: "Verification email resent" };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Do not reveal whether user exists
    if (!user)
      return {
        success: true,
        message: "If that email exists, a reset link has been sent",
      };
    if (!user.emailVerified) throw new BadRequestError("Email is not verified");

    // Delete existing resets
    await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetTokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(
      user.email,
      resetToken,
      resetLink,
      user.name || undefined
    );

    return {
      success: true,
      message: "If that email exists, a reset link has been sent",
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const reset = await prisma.passwordReset.findUnique({
      where: { token: tokenHash },
    });
    if (!reset) throw new BadRequestError("Invalid or expired reset token");
    if (reset.expiresAt < new Date())
      throw new BadRequestError("Reset token has expired");

    const hashed = await bcrypt.hash(
      newPassword,
      parseInt(process.env.BCRYPT_ROUNDS || "10")
    );

    // Update user password and clear refresh token
    const user = await prisma.user.update({
      where: { id: reset.userId },
      data: { password: hashed, refreshToken: null },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    // Remove all password reset records for this user
    await prisma.passwordReset.deleteMany({ where: { userId: reset.userId } });

    // Optionally send welcome/confirmation email
    await sendWelcomeEmail(user.email, user.name || user.email.split("@")[0]);

    return {
      success: true,
      message: "Password has been reset. Please login with your new password.",
      data: { user },
    };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) throw new AuthenticationError("Refresh token missing");
    // verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Make sure token matches what we have stored for the user
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!dbUser || !dbUser.refreshToken)
      throw new AuthenticationError("Invalid session");
    if (dbUser.refreshToken !== refreshToken)
      throw new AuthenticationError("Invalid refresh token");

    // Generate new tokens
    const tokens = generateAuthTokens({
      userId: decoded.userId,
      email: decoded.email,
    });

    // Update stored refresh token
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { refreshToken: tokens.refreshToken },
    });

    return { success: true, tokens };
  }

  async logout(userId: string) {
    // Remove stored refresh token and set status to offline
    await prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
        status: "offline",
      },
    });
    return { success: true, message: "Logged out" };
  }
}
