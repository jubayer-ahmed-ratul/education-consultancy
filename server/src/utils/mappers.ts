import { UserRole } from '@prisma/client';
import type { UserRoleType } from '@zero-compile/shared';

export function toDtoUserRole(role: UserRole): UserRoleType {
  return role === UserRole.super_admin ? 'super-admin' : 'admin';
}

export function toPrismaUserRole(role: UserRoleType): UserRole {
  return role === 'super-admin' ? UserRole.super_admin : UserRole.admin;
}
