import { randomUUID } from 'node:crypto';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const LOCK_ID = 'bootstrap_super_admin';
const LOCK_TTL_MS = 30_000;

export async function seedAdmin(prisma: PrismaClient): Promise<void> {
  const workerId = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + LOCK_TTL_MS);

  const acquired = await prisma.$transaction(async (tx) => {
    // Purge expired lock if any, then attempt to acquire
    await tx.systemLock.deleteMany({
      where: {
        id: LOCK_ID,
        expiresAt: { lt: now },
      },
    });

    const existingLock = await tx.systemLock.findUnique({ where: { id: LOCK_ID } });
    if (existingLock) {
      return false;
    }

    await tx.systemLock.create({
      data: {
        id: LOCK_ID,
        lockedBy: workerId,
        expiresAt,
      },
    });
    return true;
  });

  if (!acquired) {
    console.log('[seed-admin] Another worker holds the bootstrap lock. Exiting gracefully.');
    return;
  }

  try {
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: UserRole.super_admin },
      select: { id: true, email: true },
    });

    if (existingSuperAdmin) {
      console.log(`[seed-admin] Super Admin already exists (${existingSuperAdmin.email}). Skipping.`);
      return;
    }

    const name = process.env.SUPER_ADMIN_NAME?.trim() || 'Zero Compile Super Admin';
    const email = (process.env.SUPER_ADMIN_EMAIL?.trim() || 'admin@zerocompile.example').toLowerCase();
    const plainPassword = process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123!';

    if (plainPassword.length < 8) {
      throw new Error('SUPER_ADMIN_PASSWORD must be at least 8 characters long.');
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    const created = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.super_admin,
        isActive: true,
      },
      select: { id: true, email: true, role: true },
    });

    console.log(`[seed-admin] Created Super Admin: ${created.email} (${created.id})`);
  } finally {
    await prisma.systemLock.deleteMany({
      where: {
        id: LOCK_ID,
        lockedBy: workerId,
      },
    });
  }
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedAdmin(prisma)
    .catch((err) => {
      console.error('[seed-admin] Failed:', err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
