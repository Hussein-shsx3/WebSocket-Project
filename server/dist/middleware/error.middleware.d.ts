import { Request, Response, NextFunction } from "express";
import { AppError } from "../types/error.types";
export declare const errorHandler: (error: Error | AppError, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const notFound: (req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=error.middleware.d.ts.map