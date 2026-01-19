"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.isAuthenticated = exports.optionalAuthenticate = exports.authenticate = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const error_types_1 = require("../types/error.types");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new error_types_1.AuthenticationError("No access token provided");
        }
        const accessToken = authHeader.substring(7);
        const decoded = (0, jwt_util_1.verifyAccessToken)(accessToken);
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role || "USER",
        };
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("expired")) {
                res.status(401).json({
                    success: false,
                    message: "Access token has expired",
                    code: "TOKEN_EXPIRED",
                });
                return;
            }
            if (error.message.includes("invalid")) {
                res.status(401).json({
                    success: false,
                    message: "Invalid access token",
                    code: "TOKEN_INVALID",
                });
                return;
            }
        }
        res.status(401).json({
            success: false,
            message: "Unauthorized",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};
exports.authenticate = authenticate;
const optionalAuthenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const accessToken = authHeader.substring(7);
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
        const userRole = req.user.role || "USER";
        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({
                success: false,
                message: "Insufficient permissions",
                required: allowedRoles,
                current: userRole,
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map