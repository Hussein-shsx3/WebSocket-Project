"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.isAuthenticated = exports.optionalAuthenticate = exports.authenticate = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const error_types_1 = require("../types/error.types");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new error_types_1.AuthenticationError("No token provided - Authorization header is missing");
        }
        if (!authHeader.startsWith("Bearer ")) {
            throw new error_types_1.AuthenticationError("Invalid token format - use 'Bearer <token>'");
        }
        const token = authHeader.slice(7);
        const decoded = (0, jwt_util_1.verifyAccessToken)(token);
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role || "USER",
        };
        next();
    }
    catch (error) {
        if (error instanceof error_types_1.AuthenticationError) {
            return res.status(401).json({
                success: false,
                message: error.message,
            });
        }
        if (error instanceof Error && error.message.includes("expired")) {
            return res.status(401).json({
                success: false,
                message: "Token has expired",
            });
        }
        if (error instanceof Error && error.message.includes("Invalid")) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }
        return res.status(401).json({
            success: false,
            message: "Authentication failed",
        });
    }
};
exports.authenticate = authenticate;
const optionalAuthenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.slice(7);
            const decoded = (0, jwt_util_1.verifyAccessToken)(token);
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
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Insufficient permissions. Required roles: " + allowedRoles.join(", "),
            });
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map