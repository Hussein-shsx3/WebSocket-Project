"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../config/db"));
const jwt_util_1 = require("../utils/jwt.util");
const error_types_1 = require("../types/error.types");
const crypto_1 = __importDefault(require("crypto"));
const email_util_1 = require("../utils/email.util");
class AuthService {
    async register(data) {
        const existingUser = await db_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new error_types_1.AppError("Email already registered", 409);
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, parseInt(process.env.BCRYPT_ROUNDS || "10"));
        const user = await db_1.default.user.create({
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
        const verificationToken = crypto_1.default.randomBytes(32).toString("hex");
        const verificationTokenHash = crypto_1.default
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");
        await db_1.default.emailVerification.create({
            data: {
                userId: user.id,
                token: verificationTokenHash,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });
        const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
        await (0, email_util_1.sendVerificationEmail)(user.email, verificationToken, verificationLink, user.name || undefined);
        return {
            success: true,
            message: "User registered successfully. Please verify your email.",
            data: {
                user,
                verificationToken,
            },
        };
    }
    async login(data) {
        const user = await db_1.default.user.findUnique({
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
            throw new error_types_1.AppError("Invalid email or password", 401);
        }
        const isPasswordValid = await bcrypt_1.default.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new error_types_1.AppError("Invalid email or password", 401);
        }
        const accessToken = (0, jwt_util_1.generateAccessToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const refreshToken = (0, jwt_util_1.generateRefreshToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        await db_1.default.user.update({
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
    async verifyEmail(token) {
        const tokenHash = crypto_1.default.createHash("sha256").update(token).digest("hex");
        const verification = await db_1.default.emailVerification.findUnique({
            where: { token: tokenHash },
        });
        if (!verification) {
            throw new error_types_1.AppError("Invalid verification token", 400);
        }
        if (verification.expiresAt < new Date()) {
            throw new error_types_1.AppError("Verification token has expired", 400);
        }
        const user = await db_1.default.user.update({
            where: { id: verification.userId },
            data: { emailVerified: true },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
        await db_1.default.emailVerification.delete({
            where: { id: verification.id },
        });
        return {
            success: true,
            message: "Email verified successfully. You can now login.",
            data: { user },
        };
    }
    async resendVerification(email) {
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user)
            throw new error_types_1.AppError("User not found", 404);
        if (user.emailVerified)
            throw new error_types_1.AppError("Email already verified", 400);
        await db_1.default.emailVerification.deleteMany({ where: { userId: user.id } });
        const verificationToken = crypto_1.default.randomBytes(32).toString("hex");
        const verificationTokenHash = crypto_1.default.createHash("sha256").update(verificationToken).digest("hex");
        await db_1.default.emailVerification.create({
            data: {
                userId: user.id,
                token: verificationTokenHash,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });
        const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
        await (0, email_util_1.sendVerificationEmail)(user.email, verificationToken, verificationLink, user.name || undefined);
        return { success: true, message: "Verification email resent" };
    }
    async forgotPassword(email) {
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user)
            return { success: true, message: "If that email exists, a reset link has been sent" };
        if (!user.emailVerified)
            throw new error_types_1.AppError("Email is not verified", 400);
        await db_1.default.passwordReset.deleteMany({ where: { userId: user.id } });
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const resetTokenHash = crypto_1.default.createHash("sha256").update(resetToken).digest("hex");
        await db_1.default.passwordReset.create({
            data: {
                userId: user.id,
                token: resetTokenHash,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            },
        });
        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        await (0, email_util_1.sendPasswordResetEmail)(user.email, resetToken, resetLink, user.name || undefined);
        return { success: true, message: "If that email exists, a reset link has been sent" };
    }
    async resetPassword(token, newPassword) {
        const tokenHash = crypto_1.default.createHash("sha256").update(token).digest("hex");
        const reset = await db_1.default.passwordReset.findUnique({ where: { token: tokenHash } });
        if (!reset)
            throw new error_types_1.AppError("Invalid or expired reset token", 400);
        if (reset.expiresAt < new Date())
            throw new error_types_1.AppError("Reset token has expired", 400);
        const hashed = await bcrypt_1.default.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || "10"));
        const user = await db_1.default.user.update({
            where: { id: reset.userId },
            data: { password: hashed, refreshToken: null },
            select: { id: true, name: true, email: true, createdAt: true },
        });
        await db_1.default.passwordReset.deleteMany({ where: { userId: reset.userId } });
        await (0, email_util_1.sendWelcomeEmail)(user.email, user.name || user.email.split("@")[0]);
        return { success: true, message: "Password has been reset. Please login with your new password.", data: { user } };
    }
    async refreshTokens(refreshToken) {
        if (!refreshToken)
            throw new error_types_1.AppError("Refresh token missing", 401);
        const decoded = (0, jwt_util_1.verifyRefreshToken)(refreshToken);
        const dbUser = await db_1.default.user.findUnique({ where: { id: decoded.userId } });
        if (!dbUser || !dbUser.refreshToken)
            throw new error_types_1.AppError("Invalid session", 401);
        if (dbUser.refreshToken !== refreshToken)
            throw new error_types_1.AppError("Invalid refresh token", 401);
        const tokens = (0, jwt_util_1.generateAuthTokens)({ userId: decoded.userId, email: decoded.email });
        await db_1.default.user.update({ where: { id: decoded.userId }, data: { refreshToken: tokens.refreshToken } });
        return { success: true, tokens };
    }
    async logout(userId) {
        await db_1.default.user.update({ where: { id: userId }, data: { refreshToken: null } });
        return { success: true, message: "Logged out" };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map