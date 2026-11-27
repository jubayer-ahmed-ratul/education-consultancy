export const adminChunkLoaders = {
  layout: () => import('../layouts/AdminLayout'),
  login: () => import('../pages/admin/LoginPage'),
  dashboard: () => import('../pages/admin/DashboardPage'),
  inquiries: () => import('../pages/admin/InquiriesListPage'),
  inquiryDetail: () => import('../pages/admin/InquiryDetailPage'),
  countries: () => import('../pages/admin/CountriesPage'),
  universities: () => import('../pages/admin/UniversitiesPage'),
  users: () => import('../pages/admin/UsersPage'),
  activityLogs: () => import('../pages/admin/ActivityLogsPage'),
  cmsCollections: () => import('../pages/admin/CmsCollectionsPage'),
  cmsSettings: () => import('../pages/admin/CmsSettingsPage'),
} as const;

let allChunksPreloaded = false;

export function preloadAllAdminChunks(): void {
  if (allChunksPreloaded) return;
  allChunksPreloaded = true;
  Object.values(adminChunkLoaders).forEach((load) => {
    void load().catch(() => undefined);
  });
}

export function preloadAdminChunk(to: string): void {
  if (to === '/admin' || to === '/admin/dashboard') {
    void adminChunkLoaders.dashboard().catch(() => undefined);
  } else if (to.startsWith('/admin/inquiries')) {
    void adminChunkLoaders.inquiries().catch(() => undefined);
    void adminChunkLoaders.inquiryDetail().catch(() => undefined);
  } else if (to.startsWith('/admin/countries')) {
    void adminChunkLoaders.countries().catch(() => undefined);
  } else if (to.startsWith('/admin/universities')) {
    void adminChunkLoaders.universities().catch(() => undefined);
  } else if (to.startsWith('/admin/users')) {
    void adminChunkLoaders.users().catch(() => undefined);
  } else if (to.startsWith('/admin/activity-logs')) {
    void adminChunkLoaders.activityLogs().catch(() => undefined);
  } else if (to === '/admin/cms/settings') {
    void adminChunkLoaders.cmsSettings().catch(() => undefined);
  } else if (to.startsWith('/admin/cms/')) {
    void adminChunkLoaders.cmsCollections().catch(() => undefined);
  }
}
