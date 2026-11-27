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
      const rows = await prisma.$queryRaw<Array<{ count: number; resetAt: Date }>>`
        INSERT INTO rate_limits (id, count, "resetAt", "createdAt", "updatedAt")
        VALUES (${key}, 1, ${nextResetAt}, ${now}, ${now})
        ON CONFLICT (id) DO UPDATE
        SET
          count = CASE
            WHEN rate_limits."resetAt" <= ${now} THEN 1
            ELSE rate_limits.count + 1
          END,
          "resetAt" = CASE
            WHEN rate_limits."resetAt" <= ${now} THEN ${nextResetAt}
            ELSE rate_limits."resetAt"
          END,
          "updatedAt" = ${now}
        RETURNING count, "resetAt"
      `;

      const record = rows[0] ?? { count: 1, resetAt: nextResetAt };
      return {
        allowed: record.count <= limit,
        remaining: Math.max(0, limit - record.count),
        resetAt: new Date(record.resetAt),
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
