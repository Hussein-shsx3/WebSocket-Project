import { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        interface User {
            userId?: string;
            email?: string;
            role?: string;
        }
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
export declare const optionalAuthenticate: (req: Request, res: Response, next: NextFunction) => void;
export declare const isAuthenticated: (req: Request) => boolean;
export declare const authorize: (...allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map