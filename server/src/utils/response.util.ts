import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp: string;
}

export const sendResponse = <T = any>(
  res: Response,
  statusCode: number,
  message: string,
  data: T | null = null
): Response => {
  const response: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  error?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    data: error || null,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};
