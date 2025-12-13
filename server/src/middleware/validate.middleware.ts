import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

/**
 * Middleware to validate request data using Zod schemas
 */
export const validate = (schema: ZodType) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate request body
      const validatedData = await schema.parseAsync(req.body);

      // Replace request body with validated data
      req.body = validatedData;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors
        const errors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
        return;
      }

      // Handle unexpected errors
      res.status(500).json({
        success: false,
        message: "Internal server error during validation",
      });
    }
  };
};

/**
 * Validate query parameters
 */
export const validateQuery = (schema: ZodType) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validatedData = await schema.parseAsync(req.query);
      req.query = validatedData as Record<string, any>;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        res.status(400).json({
          success: false,
          message: "Query validation failed",
          errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error during validation",
      });
    }
  };
};

/**
 * Validate route parameters
 */
export const validateParams = (schema: ZodType) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validatedData = await schema.parseAsync(req.params);
      req.params = validatedData as Record<string, any>;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        res.status(400).json({
          success: false,
          message: "Params validation failed",
          errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error during validation",
      });
    }
  };
};
