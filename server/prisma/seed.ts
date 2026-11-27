import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { seedAdmin } from './seed-admin';
import { seedData } from './seed-data';

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedAdmin(prisma);
    await seedData(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[seed] Seed failed:', err);
  process.exit(1);
});
