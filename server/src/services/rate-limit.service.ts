import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export interface RateLimitCheckResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

const memoryStore = new Map<string, { count: number; resetAt: Date }>();

export const rateLimitService = {
  async consume(key: string, limit: number, windowMs: number): Promise<RateLimitCheckResult> {
    const now = new Date();
    const nextResetAt = new Date(now.getTime() + windowMs);

    if (env.RATE_LIMIT_STORE === 'memory' && env.NODE_ENV !== 'production') {
      const existing = memoryStore.get(key);
      if (!existing || existing.resetAt <= now) {
        memoryStore.set(key, { count: 1, resetAt: nextResetAt });
        return { allowed: true, remaining: Math.max(0, limit - 1), resetAt: nextResetAt };
      }
      existing.count += 1;
      return {
        allowed: existing.count <= limit,
        remaining: Math.max(0, limit - existing.count),
        resetAt: existing.resetAt,
      };
    }

    try {
      const record = await prisma.$transaction(async (tx) => {
        const existing = await tx.rateLimit.findUnique({ where: { id: key } });

        if (!existing || existing.resetAt <= now) {
          return tx.rateLimit.upsert({
            where: { id: key },
            update: { count: 1, resetAt: nextResetAt },
            create: { id: key, count: 1, resetAt: nextResetAt },
          });
        }

        return tx.rateLimit.update({
          where: { id: key },
          data: { count: { increment: 1 } },
        });
      });

      return {
        allowed: record.count <= limit,
        remaining: Math.max(0, limit - record.count),
        resetAt: record.resetAt,
      };
    } catch (error) {
      console.error('[RateLimitService] Store error:', error);
      // Fail-closed in production to prevent unmetered traffic
      if (env.NODE_ENV === 'production') {
        throw new AppError(
          503,
          'SERVICE_UNAVAILABLE',
          'Rate limiting service is temporarily unavailable.'
        );
      }
      return { allowed: true, remaining: limit, resetAt: nextResetAt };
    }
  },

  async purgeExpired(): Promise<number> {
    const result = await prisma.rateLimit.deleteMany({
      where: { resetAt: { lt: new Date() } },
    });
    return result.count;
  },
};
