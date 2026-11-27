import { prisma } from '../config/prisma';

export const healthService = {
  async checkDatabase(): Promise<{ status: 'ok'; database: 'connected' }> {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'connected' };
  },
};
