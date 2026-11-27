import { env } from '../config/env';
import type { ExtendedPrismaClient } from '../config/prisma';

type TransactionClient = Parameters<Parameters<ExtendedPrismaClient['$transaction']>[0]>[0];

export const counterService = {
  async generateInquiryReference(tx: TransactionClient): Promise<string> {
    const year = new Date().getUTCFullYear();
    const counterId = `inquiry_ref_${year}`;

    const counter = await tx.counter.upsert({
      where: { id: counterId },
      update: { seq: { increment: 1 } },
      create: { id: counterId, seq: 1 },
    });

    const paddedSeq = String(counter.seq).padStart(3, '0');
    return `${env.REF_CODE_PREFIX}-${year}-${paddedSeq}`;
  },
};
