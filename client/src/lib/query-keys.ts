export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  inquiries: {
    all: ['inquiries'] as const,
    list: (params: Record<string, unknown>) => ['inquiries', 'list', params] as const,
    detail: (id: string) => ['inquiries', 'detail', id] as const,
  },
  countries: {
    all: ['countries'] as const,
    adminList: (params: Record<string, unknown>) => ['countries', 'admin', params] as const,
    publicList: (params: Record<string, unknown>) => ['countries', 'public', params] as const,
  },
  universities: {
    all: ['universities'] as const,
    adminList: (params: Record<string, unknown>) => ['universities', 'admin', params] as const,
    publicList: (params: Record<string, unknown>) => ['universities', 'public', params] as const,
  },
  users: {
    all: ['users'] as const,
    list: (params: Record<string, unknown>) => ['users', 'list', params] as const,
  },
  activityLogs: {
    list: (params: Record<string, unknown>) => ['activity-logs', params] as const,
  },
  cms: {
    publicBundle: ['cms', 'public-bundle'] as const,
    section: (key: string) => ['cms', 'section', key] as const,
  },
};
