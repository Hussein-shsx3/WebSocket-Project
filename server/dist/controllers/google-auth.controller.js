"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogout = exports.googleAuth = exports.googleCallback = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const env_config_1 = require("../config/env.config");
const error_middleware_1 = require("../middleware/error.middleware");
const db_1 = __importDefault(require("../config/db"));
const googleCallback = async (req, res) => {
    try {
        const googleUser = req.user;
        if (!googleUser || !googleUser.id || !googleUser.email) {
            return res.redirect(`${env_config_1.config.CLIENT_URL}/google-callback?error=${encodeURIComponent("Authentication failed")}`);
        }
        const tokens = (0, jwt_util_1.generateAuthTokens)({
            userId: googleUser.id,
            email: googleUser.email,
            role: googleUser.role || "USER",
        });
        await db_1.default.user.update({
            where: { id: googleUser.id },
            data: { refreshToken: tokens.refreshToken },
        });
        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            secure: env_config_1.config.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
            path: "/",
        });
        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: env_config_1.config.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });
        res.redirect(`${env_config_1.config.CLIENT_URL}/google-callback?success=true`);
    }
    catch (error) {
        console.error("Google callback error:", error);
        res.redirect(`${env_config_1.config.CLIENT_URL}/google-callback?error=${encodeURIComponent("Authentication failed")}`);
    }
};
exports.googleCallback = googleCallback;
const googleAuth = (req, res) => {
    res.json({
        success: true,
        message: "Redirecting to Google login...",
    });
};
exports.googleAuth = googleAuth;
exports.googleLogout = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Not authenticated",
        });
        return;
    }
    res.clearCookie("refreshToken");
    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});
//# sourceMappingURL=google-auth.controller.js.map