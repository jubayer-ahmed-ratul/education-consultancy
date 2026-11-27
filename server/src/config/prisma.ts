import { PrismaClient } from '@prisma/client';

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

// Enforce append-only immutability on ActivityLog at the ORM layer
export const prisma = basePrisma.$extends({
  query: {
    activityLog: {
      update() {
        throw new Error('ActivityLog is append-only: updates are strictly prohibited.');
      },
      updateMany() {
        throw new Error('ActivityLog is append-only: bulk updates are strictly prohibited.');
      },
      upsert() {
        throw new Error('ActivityLog is append-only: upserts are strictly prohibited.');
      },
      delete() {
        throw new Error('ActivityLog is append-only: deletions are strictly prohibited.');
      },
      deleteMany() {
        throw new Error('ActivityLog is append-only: bulk deletions are strictly prohibited.');
      },
    },
  },
});

export type ExtendedPrismaClient = typeof prisma;
