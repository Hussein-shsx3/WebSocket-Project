"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogout = exports.googleAuth = exports.googleCallback = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const env_config_1 = require("../config/env.config");
const googleCallback = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Authentication failed",
            });
            return;
        }
        const tokens = (0, jwt_util_1.generateAuthTokens)({
            userId: user.id,
            email: user.email,
            role: user.role || "USER",
        });
        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: env_config_1.config.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        const redirectUrl = `${env_config_1.config.CLIENT_URL}/auth/google/callback?token=${tokens.accessToken}&user=${encodeURIComponent(JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
        }))}`;
        res.redirect(redirectUrl);
    }
    catch (error) {
        console.error("Google callback error:", error);
        res.redirect(`${env_config_1.config.CLIENT_URL}/auth/error?message=Authentication failed`);
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
const googleLogout = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Not authenticated",
            });
            return;
        }
        req.logout((err) => {
            if (err) {
                res.status(500).json({
                    success: false,
                    message: "Logout failed",
                });
                return;
            }
            res.clearCookie("refreshToken");
            res.json({
                success: true,
                message: "Logged out successfully",
            });
        });
    }
    catch (error) {
        console.error("Google logout error:", error);
        res.status(500).json({
            success: false,
            message: "Logout failed",
        });
    }
};
exports.googleLogout = googleLogout;
//# sourceMappingURL=google-auth.controller.js.map