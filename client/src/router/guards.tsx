import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { PermissionKey } from '@zero-compile/shared';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-600">
        Verifying session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function PermissionGuard({
  permission,
  children,
}: {
  permission: PermissionKey;
  children: ReactNode;
}) {
  const { can } = useAuth();

  if (!can(permission)) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
        <h2 className="font-semibold">Access Denied</h2>
        <p className="mt-1">Your role does not have permission ({permission}) to access this section.</p>
      </div>
    );
  }

  return <>{children}</>;
}
