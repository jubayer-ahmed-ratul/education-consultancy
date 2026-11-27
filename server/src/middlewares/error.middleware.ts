import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/response';

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 404, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found.`);
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.') || 'root',
      message: issue.message,
    }));
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request payload.', details);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      sendError(res, 409, 'CONFLICT', 'A record with this unique value already exists.');
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 404, 'NOT_FOUND', 'The requested record was not found.');
      return;
    }
    if (err.code === 'P2003') {
      sendError(res, 400, 'INVALID_REFERENCE', 'Referenced record does not exist or cannot be modified.');
      return;
    }
  }

  // SyntaxError from malformed JSON body
  if (err instanceof SyntaxError && 'status' in err && (err as { status?: number }).status === 400) {
    sendError(res, 400, 'INVALID_JSON', 'Malformed JSON request body.');
    return;
  }

  console.error('[ErrorHandler]', err);
  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected internal error occurred.'
      : err instanceof Error
        ? err.message
        : 'Unknown internal error';

  sendError(res, 500, 'INTERNAL_SERVER_ERROR', message);
}
