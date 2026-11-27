import { env } from '../config/env';
import { prisma, type ExtendedPrismaClient } from '../config/prisma';

type QueryClient = ExtendedPrismaClient | Parameters<Parameters<ExtendedPrismaClient['$transaction']>[0]>[0];

export const counterService = {
  async generateInquiryReference(client: QueryClient = prisma): Promise<string> {
    const year = new Date().getUTCFullYear();
    const counterId = `inquiry_ref_${year}`;

    const rows = await client.$queryRaw<Array<{ seq: number }>>`
      INSERT INTO counters (id, seq)
      VALUES (${counterId}, 1)
      ON CONFLICT (id) DO UPDATE
      SET seq = counters.seq + 1
      RETURNING seq
    `;

    const seq = rows[0]?.seq ?? 1;
    const paddedSeq = String(seq).padStart(3, '0');
    return `${env.REF_CODE_PREFIX}-${year}-${paddedSeq}`;
  },
};
