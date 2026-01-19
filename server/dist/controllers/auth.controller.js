"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.logout = exports.refreshTokens = exports.resetPassword = exports.forgotPassword = exports.resendVerification = exports.verifyEmail = exports.login = exports.register = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
const auth_dto_1 = require("../dto/auth.dto");
const error_middleware_1 = require("../middleware/error.middleware");
const authService = new auth_service_1.AuthService();
const getRefreshTokenCookieConfig = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
});
exports.register = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const parse = auth_dto_1.registerSchema.safeParse(req.body);
    if (!parse.success) {
        const errors = zod_1.z.treeifyError(parse.error);
        return res.status(400).json({ success: false, errors });
    }
    const result = await authService.register(parse.data);
    return res.status(201).json({
        success: true,
        message: "User registered successfully. Please verify your email.",
        data: {
            user: result.user,
            verificationToken: result.verificationToken,
        },
    });
});
exports.login = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const parse = auth_dto_1.loginSchema.safeParse(req.body);
    if (!parse.success) {
        const errors = zod_1.z.treeifyError(parse.error);
        return res.status(400).json({ success: false, errors });
    }
    const result = await authService.login(parse.data);
    res.cookie("refreshToken", result.refreshToken, getRefreshTokenCookieConfig());
    return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
});
exports.verifyEmail = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
exports.resendVerification = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const parse = auth_dto_1.resendVerificationSchema.safeParse(req.body);
    if (!parse.success) {
        const errors = zod_1.z.treeifyError(parse.error);
        return res.status(400).json({ success: false, errors });
    }
    const result = await authService.resendVerification(parse.data.email);
    return res.status(200).json({
        success: true,
        message: result.message,
    });
});
exports.forgotPassword = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const parse = auth_dto_1.forgotPasswordSchema.safeParse(req.body);
    if (!parse.success) {
        const errors = zod_1.z.treeifyError(parse.error);
        return res.status(400).json({ success: false, errors });
    }
    const result = await authService.forgotPassword(parse.data.email);
    return res.status(200).json({
        success: true,
        message: result.message,
    });
});
exports.resetPassword = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const parse = auth_dto_1.resetPasswordSchema.safeParse(req.body);
    if (!parse.success) {
        const errors = zod_1.z.treeifyError(parse.error);
        return res.status(400).json({ success: false, errors });
    }
    const result = await authService.resetPassword(parse.data.token, parse.data.password);
    return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
    });
});
exports.refreshTokens = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const oldRefreshToken = req.cookies?.refreshToken;
    if (!oldRefreshToken) {
        return res.status(401).json({
            success: false,
            message: "Refresh token missing",
        });
    }
    const { accessToken, refreshToken } = await authService.refreshToken(oldRefreshToken);
    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieConfig());
    return res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: { accessToken },
    });
});
exports.logout = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
    }
    await authService.logout(userId);
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
    });
    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});
exports.getCurrentUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const result = await authService.getCurrentUser(userId);
    return res.json({
        success: true,
        message: "User retrieved successfully",
        data: result,
    });
});
//# sourceMappingURL=auth.controller.js.map