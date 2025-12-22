import { Request, Response } from "express";
export declare const googleCallback: (req: Request, res: Response) => Promise<void>;
export declare const googleAuth: (req: Request, res: Response) => void;
export declare const googleLogout: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=google-auth.controller.d.ts.map