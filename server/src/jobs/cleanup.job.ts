import { prisma } from '../config/prisma';
import { rateLimitService } from '../services/rate-limit.service';

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Every 5 minutes
let cleanupTimer: NodeJS.Timeout | null = null;

export async function runExpiredRecordsCleanup(): Promise<void> {
  const now = new Date();
  try {
    const [rateLimitsDeleted, recoveryTokensDeleted, systemLocksDeleted] = await Promise.all([
      rateLimitService.purgeExpired(),
      prisma.recoveryToken.deleteMany({ where: { expiresAt: { lt: now } } }),
      prisma.systemLock.deleteMany({ where: { expiresAt: { lt: now } } }),
    ]);

    const total = rateLimitsDeleted + recoveryTokensDeleted.count + systemLocksDeleted.count;
    if (total > 0) {
      console.log(
        `[cleanup.job] Purged expired records — RateLimit: ${rateLimitsDeleted}, RecoveryToken: ${recoveryTokensDeleted.count}, SystemLock: ${systemLocksDeleted.count}`
      );
    }
  } catch (err) {
    console.error('[cleanup.job] Failed to purge expired records:', err);
  }
}

export function startCleanupJob(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    void runExpiredRecordsCleanup();
  }, CLEANUP_INTERVAL_MS);
  cleanupTimer.unref();
}

export function stopCleanupJob(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}
