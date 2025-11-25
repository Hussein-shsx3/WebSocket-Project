import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
export declare const validate: (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const validateQuery: (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const validateParams: (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => Promise<any>;
//# sourceMappingURL=validate.middleware.d.ts.map