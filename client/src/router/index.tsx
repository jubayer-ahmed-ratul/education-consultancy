import { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RouteErrorBoundary } from '../components/RouteErrorBoundary';
import PublicLayout from '../layouts/PublicLayout';
import { adminChunkLoaders } from '../lib/adminChunks';
import { lazyWithRetry } from '../lib/lazyWithRetry';
import AboutPage from '../pages/public/AboutPage';
import ApplyPage from '../pages/public/ApplyPage';
import BlogDetailPage from '../pages/public/BlogDetailPage';
import BlogsPage from '../pages/public/BlogsPage';
import ContactPage from '../pages/public/ContactPage';
import DestinationDetailPage from '../pages/public/DestinationDetailPage';
import DestinationsPage from '../pages/public/DestinationsPage';
import EventDetailPage from '../pages/public/EventDetailPage';
import EventsPage from '../pages/public/EventsPage';
import GalleryPage from '../pages/public/GalleryPage';
import HomePage from '../pages/public/HomePage';
import SuccessStoriesPage from '../pages/public/SuccessStoriesPage';
import TrackPage from '../pages/public/TrackPage';
import UniversitiesPage from '../pages/public/UniversitiesPage';
import UniversityDetailPage from '../pages/public/UniversityDetailPage';
import { PermissionGuard, ProtectedRoute } from './guards';

const AdminLayout = lazyWithRetry(adminChunkLoaders.layout);
const LoginPage = lazyWithRetry(adminChunkLoaders.login);
const DashboardPage = lazyWithRetry(adminChunkLoaders.dashboard);
const InquiriesListPage = lazyWithRetry(adminChunkLoaders.inquiries);
const InquiryDetailPage = lazyWithRetry(adminChunkLoaders.inquiryDetail);
const CountriesPage = lazyWithRetry(adminChunkLoaders.countries);
const UniversitiesAdminPage = lazyWithRetry(adminChunkLoaders.universities);
const UsersPage = lazyWithRetry(adminChunkLoaders.users);
const ActivityLogsPage = lazyWithRetry(adminChunkLoaders.activityLogs);
const CmsCollectionsPage = lazyWithRetry(adminChunkLoaders.cmsCollections);
const CmsSettingsPage = lazyWithRetry(adminChunkLoaders.cmsSettings);

function LazyFallback() {
  return <div className="p-6 text-sm text-zinc-600">Loading workspace...</div>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'destinations', element: <DestinationsPage /> },
      { path: 'destinations/:slug', element: <DestinationDetailPage /> },
      { path: 'universities', element: <UniversitiesPage /> },
      { path: 'universities/:slug', element: <UniversityDetailPage /> },
      { path: 'blogs', element: <BlogsPage /> },
      { path: 'blogs/:slug', element: <BlogDetailPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'events/:slug', element: <EventDetailPage /> },
      { path: 'success-stories', element: <SuccessStoriesPage /> },
      { path: 'gallery', element: <GalleryPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'apply', element: <ApplyPage /> },
      { path: 'track', element: <TrackPage /> },
    ],
  },
  {
    path: '/admin/login',
    errorElement: <RouteErrorBoundary />,
    element: (
      <Suspense fallback={<LazyFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/admin',
    errorElement: <RouteErrorBoundary />,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LazyFallback />}>
          <AdminLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      {
        path: 'inquiries',
        element: (
          <PermissionGuard permission="inquiries:view-all">
            <InquiriesListPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'inquiries/:id',
        element: (
          <PermissionGuard permission="inquiries:view-all">
            <InquiryDetailPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'countries',
        element: (
          <PermissionGuard permission="countries:manage">
            <CountriesPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'universities',
        element: (
          <PermissionGuard permission="universities:manage">
            <UniversitiesAdminPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'users',
        element: (
          <PermissionGuard permission="users:manage">
            <UsersPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'activity-logs',
        element: (
          <PermissionGuard permission="activity-log:view">
            <ActivityLogsPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'cms/blogs',
        element: (
          <PermissionGuard permission="content:manage">
            <CmsCollectionsPage kind="blogs" />
          </PermissionGuard>
        ),
      },
      {
        path: 'cms/events',
        element: (
          <PermissionGuard permission="content:manage">
            <CmsCollectionsPage kind="events" />
          </PermissionGuard>
        ),
      },
      {
        path: 'cms/success-stories',
        element: (
          <PermissionGuard permission="content:manage">
            <CmsCollectionsPage kind="success-stories" />
          </PermissionGuard>
        ),
      },
      {
        path: 'cms/gallery',
        element: (
          <PermissionGuard permission="content:manage">
            <CmsCollectionsPage kind="gallery" />
          </PermissionGuard>
        ),
      },
      {
        path: 'cms/sister-concerns',
        element: (
          <PermissionGuard permission="content:manage">
            <CmsCollectionsPage kind="sister-concerns" />
          </PermissionGuard>
        ),
      },
      {
        path: 'cms/settings',
        element: (
          <PermissionGuard permission="content:manage">
            <CmsSettingsPage />
          </PermissionGuard>
        ),
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
