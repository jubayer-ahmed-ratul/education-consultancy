import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  hasPermission,
  type LoginInput,
  type PermissionKey,
  type UserRoleType,
} from '@zero-compile/shared';
import { apiRequest } from '../lib/api-client';
import { queryKeys } from '../lib/query-keys';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  isActive: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  can: (permission: PermissionKey) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user = null, isLoading } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      try {
        const res = await apiRequest<{ user: AuthUser }>('/auth/me');
        return res.data.user;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const login = useCallback(
    async (input: LoginInput): Promise<AuthUser> => {
      const res = await apiRequest<{ user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      queryClient.setQueryData(queryKeys.auth.me, res.data.user);
      return res.data.user;
    },
    [queryClient]
  );

  const logout = useCallback(async () => {
    await apiRequest('/auth/logout', { method: 'POST' });
    queryClient.setQueryData(queryKeys.auth.me, null);
    queryClient.clear();
  }, [queryClient]);

  const can = useCallback(
    (permission: PermissionKey) => hasPermission(user?.role ?? null, permission),
    [user?.role]
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
