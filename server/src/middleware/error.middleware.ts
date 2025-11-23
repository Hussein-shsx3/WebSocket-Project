import { Request, Response, NextFunction } from "express";
import { AppError } from "../types/error.types";
import { ZodError } from "zod";

/**
 * Error Response Interface
 */
interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: Array<{ field: string; message: string }>;
  stack?: string;
}

/**
 * Handle Prisma Errors
 */
const handlePrismaError = (error: any): ErrorResponse => {
  // Check for Prisma error codes
  if (error.code) {
    switch (error.code) {
      case "P2002":
        // Unique constraint violation
        const field = (error.meta?.target as string[])?.join(", ") || "field";
        return {
          success: false,
          message: `${field} already exists`,
          statusCode: 409,
        };

      case "P2025":
        // Record not found
        return {
          success: false,
          message: "Record not found",
          statusCode: 404,
        };

      case "P2003":
        // Foreign key constraint violation
        return {
          success: false,
          message: "Related record not found",
          statusCode: 400,
        };

      case "P2014":
        // Invalid ID
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

/**
 * Handle Zod Validation Errors
 */
const handleZodError = (error: ZodError): ErrorResponse => {
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

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("❌ Error:", error);

  let response: ErrorResponse = {
    success: false,
    message: error.message || "Internal server error",
    statusCode: 500,
  };

  // Handle custom AppError
  if (error instanceof AppError) {
    response = {
      success: false,
      message: error.message,
      statusCode: error.statusCode,
    };
  }
  // Handle Prisma errors (check by name property)
  else if (
    error.name === "PrismaClientKnownRequestError" ||
    (error as any).code
  ) {
    response = handlePrismaError(error);
  }
  // Handle Zod validation errors
  else if (error instanceof ZodError) {
    response = handleZodError(error);
  }
  // Handle JWT errors
  else if (error.name === "JsonWebTokenError") {
    response = {
      success: false,
      message: "Invalid token",
      statusCode: 401,
    };
  } else if (error.name === "TokenExpiredError") {
    response = {
      success: false,
      message: "Token expired",
      statusCode: 401,
    };
  }
  // Handle Multer file upload errors
  else if (error.name === "MulterError") {
    response = {
      success: false,
      message: `File upload error: ${error.message}`,
      statusCode: 400,
    };
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack;
  }

  return res.status(response.statusCode).json(response);
};

/**
 * Handle 404 - Route Not Found
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Async Handler Wrapper - Catches async errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
