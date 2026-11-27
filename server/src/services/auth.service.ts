import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { UserRoleType } from '@zero-compile/shared';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { toDtoUserRole } from '../utils/mappers';
import { activityLogService } from './activity-log.service';

export interface AuthTokenPayload {
  sub: string;
  role: UserRoleType;
}

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const authService = {
  signToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, env.AUTH_SECRET, { expiresIn: '7d' });
  },

  verifyToken(token: string): AuthTokenPayload {
    try {
      const decoded = jwt.verify(token, env.AUTH_SECRET) as jwt.JwtPayload;
      if (!decoded || typeof decoded.sub !== 'string' || (decoded.role !== 'super-admin' && decoded.role !== 'admin')) {
        throw new AppError(401, 'UNAUTHORIZED', 'Invalid authentication token.');
      }
      return { sub: decoded.sub, role: decoded.role };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication token is invalid or expired.');
    }
  },

  async login(
    email: string,
    password: string,
    ipAddress?: string | null
  ): Promise<{ user: AuthUserDto; token: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    if (!user.isActive) {
      throw new AppError(403, 'ACCOUNT_INACTIVE', 'Your account has been deactivated. Contact a Super Admin.');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    const role = toDtoUserRole(user.role);
    const token = this.signToken({ sub: user.id, role });

    await activityLogService.log({
      action: 'auth.login',
      entityType: 'user',
      entityId: user.id,
      performedById: user.id,
      details: { email: user.email, role },
      ipAddress,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  },

  async logout(userId: string | undefined, ipAddress?: string | null): Promise<void> {
    if (!userId) return;
    await activityLogService.log({
      action: 'auth.logout',
      entityType: 'user',
      entityId: userId,
      performedById: userId,
      details: {},
      ipAddress,
    });
  },

  async getMe(userId: string): Promise<AuthUserDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'UNAUTHORIZED', 'Session is invalid or user is inactive.');
    }

    return {
      ...user,
      role: toDtoUserRole(user.role),
    };
  },
};
