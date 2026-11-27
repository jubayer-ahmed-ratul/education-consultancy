import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { startCleanupJob, stopCleanupJob } from './jobs/cleanup.job';
import { publicService } from './services/public.service';

const app = createApp();

async function warmUpPublicCache(): Promise<void> {
  const started = performance.now();
  const results = await Promise.allSettled([
    publicService.getPublicBundle(),
    publicService.listCountries({ page: 1, limit: 6 }),
    publicService.listCountries({ page: 1, limit: 50 }),
    publicService.listUniversities({ page: 1, limit: 6 }),
    publicService.listBlogs({ page: 1, limit: 3 }),
    publicService.listEvents('upcoming'),
  ]);
  const failed = results.filter((r) => r.status === 'rejected').length;
  console.log(
    `[CacheWarmUp] Completed in ${(performance.now() - started).toFixed(1)}ms (${results.length - failed}/${results.length} succeeded)`
  );
}

const server = app.listen(env.PORT, () => {
  console.log(`[${env.APP_NAME}] Server listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  startCleanupJob();
  void warmUpPublicCache();
});

async function shutdown(signal: string): Promise<void> {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  stopCleanupJob();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
