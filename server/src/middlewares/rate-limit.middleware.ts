import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { rateLimitService } from '../services/rate-limit.service';
import { AppError } from '../utils/AppError';
import { extractClientIp } from '../utils/ip';

export interface RateLimitOptions {
  scope: string;
  windowMs: number;
  limit: number;
}

export function rateLimit({ scope, windowMs, limit }: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (scope === 'inquiry-submit' && env.DISABLE_INQUIRY_RATE_LIMIT) {
        return next();
      }

      const ip = extractClientIp(req);
      const key = `${scope}:${ip}`.slice(0, 256);
      const result = await rateLimitService.consume(key, limit, windowMs);

      res.setHeader('X-RateLimit-Limit', String(limit));
      res.setHeader('X-RateLimit-Remaining', String(result.remaining));
      res.setHeader('X-RateLimit-Reset', String(Math.ceil(result.resetAt.getTime() / 1000)));

      if (!result.allowed) {
        const retryAfterSec = Math.max(1, Math.ceil((result.resetAt.getTime() - Date.now()) / 1000));
        res.setHeader('Retry-After', String(retryAfterSec));
        return next(
          new AppError(
            429,
            'RATE_LIMIT_EXCEEDED',
            'Too many requests. Please wait before trying again.'
          )
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
