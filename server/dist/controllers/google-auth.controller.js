"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuth = exports.googleCallback = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const env_config_1 = require("../config/env.config");
const error_middleware_1 = require("../middleware/error.middleware");
const db_1 = __importDefault(require("../config/db"));
const getRefreshTokenCookieConfig = () => ({
    httpOnly: true,
    secure: env_config_1.config.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
});
exports.googleCallback = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const googleUser = req.user;
    if (!googleUser?.id || !googleUser?.email) {
        return res.redirect(`${env_config_1.config.CLIENT_URL}/google-callback?error=${encodeURIComponent("Authentication failed")}`);
    }
    const refreshToken = (0, jwt_util_1.generateRefreshToken)({
        userId: googleUser.id,
        email: googleUser.email,
        role: googleUser.role || "USER",
    });
    await db_1.default.user.update({
        where: { id: googleUser.id },
        data: { refreshToken },
    });
    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieConfig());
    res.redirect(`${env_config_1.config.CLIENT_URL}/google-callback?success=true`);
});
const googleAuth = (_req, res) => {
    res.json({
        success: true,
        message: "Redirecting to Google login...",
    });
};
exports.googleAuth = googleAuth;
//# sourceMappingURL=google-auth.controller.js.map