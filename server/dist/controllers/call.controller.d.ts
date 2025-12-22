import { Request, Response } from "express";
export declare const initiateCall: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const updateCallStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const endCall: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const declineCall: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getActiveCall: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getCallHistory: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const missCall: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=call.controller.d.ts.map