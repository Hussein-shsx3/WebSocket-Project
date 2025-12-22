"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFound = exports.errorHandler = void 0;
const error_types_1 = require("../types/error.types");
const zod_1 = require("zod");
const handlePrismaError = (error) => {
    if (typeof error !== 'object' || error === null) {
        return {
            success: false,
            message: "Database operation failed",
            statusCode: 500,
        };
    }
    const prismaError = error;
    if (prismaError.code) {
        switch (prismaError.code) {
            case "P2002":
                const field = prismaError.meta?.target?.join(", ") || "field";
                return {
                    success: false,
                    message: `${field} already exists`,
                    statusCode: 409,
                };
            case "P2025":
                return {
                    success: false,
                    message: "Record not found",
                    statusCode: 404,
                };
            case "P2003":
                return {
                    success: false,
                    message: "Related record not found",
                    statusCode: 400,
                };
            case "P2014":
                return {
                    success: false,
                    message: "Invalid ID provided",
                    statusCode: 400,
                };
            default:
                return {
                    success: false,
                    message: "Database operation failed",
                    statusCode: 500,
                };
        }
    }
    return {
        success: false,
        message: "Database operation failed",
        statusCode: 500,
    };
};
const handleZodError = (error) => {
    const errors = error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
    }));
    return {
        success: false,
        message: "Validation failed",
        statusCode: 400,
        errors,
    };
};
const errorHandler = (error, req, res, next) => {
    console.error("❌ Error:", error);
    let response = {
        success: false,
        message: error.message || "Internal server error",
        statusCode: 500,
    };
    if (error instanceof error_types_1.AppError) {
        response = {
            success: false,
            message: error.message,
            statusCode: error.statusCode,
        };
    }
    else if ((error instanceof Error && error.name === "PrismaClientKnownRequestError") ||
        (typeof error === 'object' && error !== null && 'code' in error)) {
        response = handlePrismaError(error);
    }
    else if (error instanceof zod_1.ZodError) {
        response = handleZodError(error);
    }
    else if (error.name === "JsonWebTokenError") {
        response = {
            success: false,
            message: "Invalid token",
            statusCode: 401,
        };
    }
    else if (error.name === "TokenExpiredError") {
        response = {
            success: false,
            message: "Token expired",
            statusCode: 401,
        };
    }
    else if (error.name === "MulterError") {
        response = {
            success: false,
            message: `File upload error: ${error.message}`,
            statusCode: 400,
        };
    }
    if (process.env.NODE_ENV === "development") {
        response.stack = error.stack;
    }
    return res.status(response.statusCode).json(response);
};
exports.errorHandler = errorHandler;
const notFound = (req, res, next) => {
    const error = new error_types_1.AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};
exports.notFound = notFound;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=error.middleware.js.map