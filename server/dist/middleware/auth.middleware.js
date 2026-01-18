"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.isAuthenticated = exports.optionalAuthenticate = exports.authenticate = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const error_types_1 = require("../types/error.types");
const authenticate = (req, res, next) => {
    try {
        console.log("🔐 Auth middleware called for:", req.path);
        const authHeader = req.headers.authorization;
        const accessToken = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;
        console.log("Access token present:", !!accessToken);
        if (!accessToken) {
            throw new error_types_1.AuthenticationError("No access token provided");
        }
        const decoded = (0, jwt_util_1.verifyAccessToken)(accessToken);
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role || "USER",
        };
        next();
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("❌ Auth Error:", errorMessage);
        res.status(401).json({
            success: false,
            message: "Unauthorized",
            error: errorMessage,
        });
    }
};
exports.authenticate = authenticate;
const optionalAuthenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const accessToken = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;
        if (accessToken) {
            const decoded = (0, jwt_util_1.verifyAccessToken)(accessToken);
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role || "USER",
            };
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuthenticate = optionalAuthenticate;
const isAuthenticated = (req) => {
    return !!(req.user && req.user.userId);
};
exports.isAuthenticated = isAuthenticated;
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Not authenticated",
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role || "USER")) {
            res.status(403).json({
                success: false,
                message: "Insufficient permissions. Required roles: " +
                    allowedRoles.join(", "),
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map