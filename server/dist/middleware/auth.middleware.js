"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.isAuthenticated = exports.optionalAuthenticate = exports.authenticate = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const error_types_1 = require("../types/error.types");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("🔍 Auth Header:", authHeader);
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new error_types_1.AuthenticationError("No token provided");
        }
        const token = authHeader.slice(7);
        console.log("🔍 Token:", token);
        const decoded = (0, jwt_util_1.verifyAccessToken)(token);
        console.log("🔍 Decoded:", decoded);
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role || "USER",
        };
        next();
    }
    catch (error) {
        console.error("❌ Auth Error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
            error: error.message,
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
        if (!allowedRoles.includes(req.user.role || "USER")) {
            return res.status(403).json({
                success: false,
                message: "Insufficient permissions. Required roles: " +
                    allowedRoles.join(", "),
            });
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map