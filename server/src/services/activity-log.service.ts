import type { AuditEntityType, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { redactSensitiveData } from '../utils/redact';

export interface LogActivityParams {
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  performedById?: string | null;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
}

export const activityLogService = {
  async log(params: LogActivityParams): Promise<void> {
    const sanitizedDetails = redactSensitiveData(params.details ?? {}) as Prisma.InputJsonValue;

    await prisma.activityLog.create({
      data: {
        action: params.action.slice(0, 100),
        entityType: params.entityType,
        entityId: params.entityId.slice(0, 100),
        performedById: params.performedById ?? null,
        details: sanitizedDetails,
        ipAddress: params.ipAddress ? params.ipAddress.slice(0, 45) : null,
      },
    });
  },
};
