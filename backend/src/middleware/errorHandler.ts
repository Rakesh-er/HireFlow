import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(`[ErrorHandler] ${req.method} ${req.originalUrl}:`, err.message || err);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation failed', 400, formattedErrors);
  }

  // Prisma specific errors
  if (err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
    return sendError(res, `Duplicate entry for ${target}`, 409, [
      { field: target, message: `A record with this ${target} already exists.` },
    ]);
  }

  if (err.code === 'P2025') {
    return sendError(res, 'Record not found in database', 404);
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 'File size exceeds allowed limit', 400);
  }

  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred on the server'
    : err.message || 'Internal server error';

  return sendError(res, message, 500, process.env.NODE_ENV === 'development' ? [err.stack] : []);
}

