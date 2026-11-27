export const USER_ROLES = ['super-admin', 'admin'] as const;
export type UserRoleType = (typeof USER_ROLES)[number];

export const PERMISSION_KEYS = [
  'inquiries:submit',
  'inquiries:track',
  'inquiries:recover',
  'inquiries:view-all',
  'inquiries:update-status',
  'inquiries:add-notes',
  'inquiries:reopen',
  'inquiries:assign',
  'users:manage',
  'content:manage',
  'countries:manage',
  'universities:manage',
  'activity-log:view',
  'cache:purge',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export const ADMIN_PERMISSIONS: ReadonlySet<PermissionKey> = new Set<PermissionKey>([
  'inquiries:submit',
  'inquiries:track',
  'inquiries:recover',
  'inquiries:view-all',
  'inquiries:update-status',
  'inquiries:add-notes',
]);

export const PUBLIC_PERMISSIONS: ReadonlySet<PermissionKey> = new Set<PermissionKey>([
  'inquiries:submit',
  'inquiries:track',
  'inquiries:recover',
]);

export function hasPermission(role: UserRoleType | null | undefined, permission: PermissionKey): boolean {
  if (!role) {
    return PUBLIC_PERMISSIONS.has(permission);
  }
  if (role === 'super-admin') {
    return true;
  }
  if (role === 'admin') {
    return ADMIN_PERMISSIONS.has(permission);
  }
  return false;
}
