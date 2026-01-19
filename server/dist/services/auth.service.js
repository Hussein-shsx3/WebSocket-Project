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
            throw new error_types_1.ConflictError("Email already registered");
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
            user,
            verificationToken,
        };
    }
    async login(data) {
        const user = await db_1.default.user.findUnique({ where: { email: data.email } });
        if (!user || !user.password) {
            throw new error_types_1.AuthenticationError("Invalid credentials");
        }
        const valid = await bcrypt_1.default.compare(data.password, user.password);
        if (!valid) {
            throw new error_types_1.AuthenticationError("Invalid credentials");
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
            user,
            accessToken,
            refreshToken,
        };
    }
    async verifyEmail(token) {
        const tokenHash = crypto_1.default.createHash("sha256").update(token).digest("hex");
        const verification = await db_1.default.emailVerification.findUnique({
            where: { token: tokenHash },
        });
        if (!verification) {
            throw new error_types_1.BadRequestError("Invalid verification token");
        }
        if (verification.expiresAt < new Date()) {
            throw new error_types_1.BadRequestError("Verification token has expired");
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
            throw new error_types_1.NotFoundError("User not found");
        if (user.emailVerified)
            throw new error_types_1.BadRequestError("Email already verified");
        await db_1.default.emailVerification.deleteMany({ where: { userId: user.id } });
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
        return { success: true, message: "Verification email resent" };
    }
    async forgotPassword(email) {
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user)
            return {
                success: true,
                message: "If that email exists, a reset link has been sent",
            };
        if (!user.emailVerified)
            throw new error_types_1.BadRequestError("Email is not verified");
        await db_1.default.passwordReset.deleteMany({ where: { userId: user.id } });
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const resetTokenHash = crypto_1.default
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        await db_1.default.passwordReset.create({
            data: {
                userId: user.id,
                token: resetTokenHash,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            },
        });
        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        await (0, email_util_1.sendPasswordResetEmail)(user.email, resetToken, resetLink, user.name || undefined);
        return {
            success: true,
            message: "If that email exists, a reset link has been sent",
        };
    }
    async resetPassword(token, newPassword) {
        const tokenHash = crypto_1.default.createHash("sha256").update(token).digest("hex");
        const reset = await db_1.default.passwordReset.findUnique({
            where: { token: tokenHash },
        });
        if (!reset)
            throw new error_types_1.BadRequestError("Invalid or expired reset token");
        if (reset.expiresAt < new Date())
            throw new error_types_1.BadRequestError("Reset token has expired");
        const hashed = await bcrypt_1.default.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || "10"));
        const user = await db_1.default.user.update({
            where: { id: reset.userId },
            data: { password: hashed, refreshToken: null },
            select: { id: true, name: true, email: true, createdAt: true },
        });
        await db_1.default.passwordReset.deleteMany({ where: { userId: reset.userId } });
        await (0, email_util_1.sendWelcomeEmail)(user.email, user.name || user.email.split("@")[0]);
        return {
            success: true,
            message: "Password has been reset. Please login with your new password.",
            data: { user },
        };
    }
    async refreshToken(oldRefreshToken) {
        const decoded = (0, jwt_util_1.verifyRefreshToken)(oldRefreshToken);
        const user = await db_1.default.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user || user.refreshToken !== oldRefreshToken) {
            throw new error_types_1.AuthenticationError("Invalid refresh token");
        }
        const newAccessToken = (0, jwt_util_1.generateAccessToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const newRefreshToken = (0, jwt_util_1.generateRefreshToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        await db_1.default.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken },
        });
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }
    async logout(userId) {
        await db_1.default.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
        return { success: true, message: "Logged out" };
    }
    async getCurrentUser(userId) {
        const user = await db_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new error_types_1.NotFoundError("User not found");
        }
        return { user };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map