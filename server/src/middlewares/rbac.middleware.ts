import type { NextFunction, Request, Response } from 'express';
import { hasPermission, type PermissionKey, type UserRoleType } from '@zero-compile/shared';
import { AppError } from '../utils/AppError';

export function requireRole(...allowedRoles: UserRoleType[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required.'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'FORBIDDEN', 'You do not have permission to access this resource.'));
    }
    next();
  };
}

export function requirePermission(permission: PermissionKey) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required.'));
    }
    if (!hasPermission(req.user.role, permission)) {
      return next(
        new AppError(403, 'FORBIDDEN', `Missing required permission: ${permission}`)
      );
    }
    next();
  };
}
