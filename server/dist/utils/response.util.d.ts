import { Response } from "express";
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T | null;
    timestamp: string;
}
export declare const sendResponse: <T = any>(res: Response, statusCode: number, message: string, data?: T | null) => Response;
export declare const sendError: (res: Response, statusCode: number, message: string, error?: any) => Response;
//# sourceMappingURL=response.util.d.ts.map