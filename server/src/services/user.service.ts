import { Prisma, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { CreateUserInput, PaginationMeta, UpdateUserInput, UserRoleType } from '@zero-compile/shared';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { toDtoUserRole, toPrismaUserRole } from '../utils/mappers';
import { activityLogService } from './activity-log.service';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toUserDto(user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: toDtoUserRole(user.role),
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const userService = {
  async list(query: {
    page: number;
    limit: number;
    role?: UserRoleType;
    isActive?: boolean;
    search?: string;
  }): Promise<{ users: UserDto[]; meta: PaginationMeta }> {
    const where: Prisma.UserWhereInput = {};
    if (query.role) {
      where.role = toPrismaUserRole(query.role);
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: safeUserSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: rows.map(toUserDto),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async create(
    input: CreateUserInput,
    actorId: string,
    ipAddress?: string | null
  ): Promise<UserDto> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      throw new AppError(409, 'CONFLICT', 'A user with this email address already exists.');
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);
    const created = await prisma.user.create({
      data: {
        name: input.name,
        email: normalizedEmail,
        password: hashedPassword,
        role: toPrismaUserRole(input.role),
        isActive: input.isActive,
      },
      select: safeUserSelect,
    });

    await activityLogService.log({
      action: 'user.created',
      entityType: 'user',
      entityId: created.id,
      performedById: actorId,
      details: { name: created.name, email: created.email, role: input.role, isActive: created.isActive },
      ipAddress,
    });

    return toUserDto(created);
  },

  async update(
    targetId: string,
    input: UpdateUserInput,
    actorId: string,
    ipAddress?: string | null
  ): Promise<UserDto> {
    const existing = await prisma.user.findUnique({ where: { id: targetId } });
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'User not found.');
    }

    // Prevent self-demotion or self-deactivation
    if (targetId === actorId) {
      if (input.role && input.role !== 'super-admin') {
        throw new AppError(400, 'SELF_DEMOTION_FORBIDDEN', 'You cannot demote your own Super Admin role.');
      }
      if (input.isActive === false) {
        throw new AppError(400, 'SELF_DEACTIVATION_FORBIDDEN', 'You cannot deactivate your own account.');
      }
    }

    // Prevent demoting or deactivating the last active Super Admin
    const isLosingSuperAdminPrivilege =
      existing.role === UserRole.super_admin &&
      existing.isActive &&
      ((input.role && input.role !== 'super-admin') || input.isActive === false);

    if (isLosingSuperAdminPrivilege) {
      const otherActiveSuperAdmins = await prisma.user.count({
        where: {
          role: UserRole.super_admin,
          isActive: true,
          id: { not: targetId },
        },
      });
      if (otherActiveSuperAdmins === 0) {
        throw new AppError(
          400,
          'LAST_SUPER_ADMIN',
          'Cannot demote or deactivate the last active Super Admin.'
        );
      }
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.email !== undefined) updateData.email = input.email.trim().toLowerCase();
    if (input.role !== undefined) updateData.role = toPrismaUserRole(input.role);
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.password !== undefined) {
      updateData.password = await bcrypt.hash(input.password, 12);
    }

    const updated = await prisma.user.update({
      where: { id: targetId },
      data: updateData,
      select: safeUserSelect,
    });

    await activityLogService.log({
      action: 'user.updated',
      entityType: 'user',
      entityId: updated.id,
      performedById: actorId,
      details: {
        updatedFields: Object.keys(input),
        role: toDtoUserRole(updated.role),
        isActive: updated.isActive,
      },
      ipAddress,
    });

    return toUserDto(updated);
  },

  async removeOrDeactivate(
    targetId: string,
    actorId: string,
    ipAddress?: string | null
  ): Promise<{ id: string; mode: 'deleted' | 'deactivated' }> {
    if (targetId === actorId) {
      throw new AppError(400, 'SELF_DELETE_FORBIDDEN', 'You cannot delete or deactivate your own account.');
    }

    const existing = await prisma.user.findUnique({ where: { id: targetId } });
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'User not found.');
    }

    if (existing.role === UserRole.super_admin && existing.isActive) {
      const otherActiveSuperAdmins = await prisma.user.count({
        where: {
          role: UserRole.super_admin,
          isActive: true,
          id: { not: targetId },
        },
      });
      if (otherActiveSuperAdmins === 0) {
        throw new AppError(400, 'LAST_SUPER_ADMIN', 'Cannot delete the last active Super Admin.');
      }
    }

    // Check if user has authored inquiry notes (Restrict FK); if so, deactivate instead of hard-delete
    const noteCount = await prisma.inquiryNote.count({ where: { createdById: targetId } });
    if (noteCount > 0) {
      await prisma.user.update({
        where: { id: targetId },
        data: { isActive: false },
      });

      await activityLogService.log({
        action: 'user.deactivated',
        entityType: 'user',
        entityId: targetId,
        performedById: actorId,
        details: { reason: 'Preserved historical inquiry notes' },
        ipAddress,
      });

      return { id: targetId, mode: 'deactivated' };
    }

    await prisma.user.delete({ where: { id: targetId } });

    await activityLogService.log({
      action: 'user.deleted',
      entityType: 'user',
      entityId: targetId,
      performedById: actorId,
      details: { email: existing.email },
      ipAddress,
    });

    return { id: targetId, mode: 'deleted' };
  },
};
