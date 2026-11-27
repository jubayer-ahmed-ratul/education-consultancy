import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';
import type { ApiErrorDetail } from '@zero-compile/shared';
import { AppError } from '../utils/AppError';

declare global {
  namespace Express {
    interface Request {
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

function formatZodIssues(issues: Array<{ path: (string | number)[]; message: string }>): ApiErrorDetail[] {
  return issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
  }));
}

export function validateBody<T>(schema: z.ZodType<T, z.ZodTypeDef, unknown>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        new AppError(400, 'VALIDATION_ERROR', 'Invalid request payload.', formatZodIssues(result.error.issues))
      );
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: z.ZodType<T, z.ZodTypeDef, unknown>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(
        new AppError(400, 'VALIDATION_ERROR', 'Invalid query parameters.', formatZodIssues(result.error.issues))
      );
    }
    req.validatedQuery = result.data;
    next();
  };
}

export function validateParams<T>(schema: z.ZodType<T, z.ZodTypeDef, unknown>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return next(
        new AppError(400, 'VALIDATION_ERROR', 'Invalid route parameters.', formatZodIssues(result.error.issues))
      );
    }
    req.validatedParams = result.data;
    next();
  };
}
