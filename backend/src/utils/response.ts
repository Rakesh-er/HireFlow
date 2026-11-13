import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, any>;
  errors?: any[];
}

export function sendSuccess<T = any>(
  res: Response,
  data: T,
  message = 'Operation completed successfully',
  statusCode = 200,
  meta?: Record<string, any>
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message = 'Something went wrong',
  statusCode = 500,
  errors: any[] = []
): Response {
  const payload: ApiResponse = {
    success: false,
    message,
    errors,
  };
  return res.status(statusCode).json(payload);
}

