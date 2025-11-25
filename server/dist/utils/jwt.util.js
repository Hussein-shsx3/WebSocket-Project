"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.refreshAccessToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateAuthTokens = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_config_1 = require("../config/env.config");
const generateAccessToken = (payload) => {
    try {
        const signOptions = {
            expiresIn: env_config_1.config.JWT_EXPIRE,
            algorithm: "HS256",
        };
        const token = jsonwebtoken_1.default.sign(payload, env_config_1.config.JWT_SECRET, signOptions);
        return token;
    }
    catch (error) {
        console.error("❌ Error generating access token:", error);
        throw new Error("Failed to generate access token");
    }
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    try {
        const signOptions = {
            expiresIn: env_config_1.config.JWT_REFRESH_EXPIRE,
            algorithm: "HS256",
        };
        const token = jsonwebtoken_1.default.sign(payload, env_config_1.config.JWT_REFRESH_SECRET, signOptions);
        return token;
    }
    catch (error) {
        console.error("❌ Error generating refresh token:", error);
        throw new Error("Failed to generate refresh token");
    }
};
exports.generateRefreshToken = generateRefreshToken;
const generateAuthTokens = (payload) => {
    return {
        accessToken: (0, exports.generateAccessToken)(payload),
        refreshToken: (0, exports.generateRefreshToken)(payload),
    };
};
exports.generateAuthTokens = generateAuthTokens;
const verifyAccessToken = (token) => {
    try {
        const verifyOptions = {
            algorithms: ["HS256"],
        };
        const decoded = jsonwebtoken_1.default.verify(token, env_config_1.config.JWT_SECRET, verifyOptions);
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error("Access token has expired");
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error("Invalid access token");
        }
        throw error;
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    try {
        const verifyOptions = {
            algorithms: ["HS256"],
        };
        const decoded = jsonwebtoken_1.default.verify(token, env_config_1.config.JWT_REFRESH_SECRET, verifyOptions);
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error("Refresh token has expired");
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error("Invalid refresh token");
        }
        throw error;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const refreshAccessToken = (refreshToken) => {
    try {
        const decoded = (0, exports.verifyRefreshToken)(refreshToken);
        const newTokens = (0, exports.generateAuthTokens)({
            userId: decoded.userId,
            email: decoded.email,
        });
        return newTokens;
    }
    catch (error) {
        console.error("❌ Error refreshing token:", error);
        throw new Error("Failed to refresh access token");
    }
};
exports.refreshAccessToken = refreshAccessToken;
const decodeToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        return decoded;
    }
    catch (error) {
        console.error("❌ Error decoding token:", error);
        return null;
    }
};
exports.decodeToken = decodeToken;
//# sourceMappingURL=jwt.util.js.map