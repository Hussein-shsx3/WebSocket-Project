"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            const validatedData = await schema.parseAsync(req.body);
            req.body = validatedData;
            return next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                }));
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors,
                });
            }
            return res.status(500).json({
                success: false,
                message: "Internal server error during validation",
            });
        }
    };
};
exports.validate = validate;
const validateQuery = (schema) => {
    return async (req, res, next) => {
        try {
            const validatedData = await schema.parseAsync(req.query);
            req.query = validatedData;
            return next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                }));
                return res.status(400).json({
                    success: false,
                    message: "Query validation failed",
                    errors,
                });
            }
            return res.status(500).json({
                success: false,
                message: "Internal server error during validation",
            });
        }
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return async (req, res, next) => {
        try {
            const validatedData = await schema.parseAsync(req.params);
            req.params = validatedData;
            return next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                }));
                return res.status(400).json({
                    success: false,
                    message: "Parameter validation failed",
                    errors,
                });
            }
            return res.status(500).json({
                success: false,
                message: "Internal server error during validation",
            });
        }
    };
};
exports.validateParams = validateParams;
//# sourceMappingURL=validate.middleware.js.map