import type { NextFunction, Request, Response } from 'express';
import type { UserRoleType } from '@zero-compile/shared';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { authService } from '../services/auth.service';
import { AppError } from '../utils/AppError';
import { toDtoUserRole } from '../utils/mappers';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;
    if (!token) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required.'));
    }

    const payload = authService.verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return next(new AppError(401, 'UNAUTHORIZED', 'User session is inactive or no longer exists.'));
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: toDtoUserRole(user.role),
    };

    next();
  } catch (err) {
    next(err);
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;
    if (!token) return next();

    const payload = authService.verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: toDtoUserRole(user.role),
      };
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
}
