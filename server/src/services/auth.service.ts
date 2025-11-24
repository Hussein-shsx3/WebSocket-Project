import bcrypt from "bcrypt";
import prisma from "../config/db";
import { RegisterDTO, LoginDTO } from "../dto/auth.dto";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.util";
import { AppError } from "../types/error.types";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/email.util";

export class AuthService {
  async register(data: RegisterDTO) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      data.password,
      parseInt(process.env.BCRYPT_ROUNDS || "10")
    );

    // Create user
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
    await sendVerificationEmail(user.email, verificationToken, verificationLink);

    return {
      success: true,
      message: "User registered successfully. Please verify your email.",
      data: {
        user,
        verificationToken, 
      },
    };
  }

  async login(data: LoginDTO) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        accessToken,
      },
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
      throw new AppError("Invalid verification token", 400);
    }

    // Check if token expired
    if (verification.expiresAt < new Date()) {
      throw new AppError("Verification token has expired", 400);
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
}
