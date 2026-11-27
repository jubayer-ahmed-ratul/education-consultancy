import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
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

const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const LoginPage = lazy(() => import('../pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage'));
const InquiriesListPage = lazy(() => import('../pages/admin/InquiriesListPage'));
const InquiryDetailPage = lazy(() => import('../pages/admin/InquiryDetailPage'));
const CountriesPage = lazy(() => import('../pages/admin/CountriesPage'));
const UniversitiesAdminPage = lazy(() => import('../pages/admin/UniversitiesPage'));
const UsersPage = lazy(() => import('../pages/admin/UsersPage'));
const ActivityLogsPage = lazy(() => import('../pages/admin/ActivityLogsPage'));
const CmsCollectionsPage = lazy(() => import('../pages/admin/CmsCollectionsPage'));
const CmsSettingsPage = lazy(() => import('../pages/admin/CmsSettingsPage'));

function LazyFallback() {
  return <div className="p-6 text-sm text-slate-500">Loading module...</div>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
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
    element: (
      <Suspense fallback={<LazyFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LazyFallback />}>
          <AdminLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Suspense fallback={<LazyFallback />}><DashboardPage /></Suspense> },
      {
        path: 'inquiries',
        element: (
          <PermissionGuard permission="inquiries:view-all">
            <Suspense fallback={<LazyFallback />}><InquiriesListPage /></Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: 'inquiries/:id',
        element: (
          <PermissionGuard permission="inquiries:view-all">
            <Suspense fallback={<LazyFallback />}><InquiryDetailPage /></Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: 'countries',
        element: (
          <PermissionGuard permission="countries:manage">
            <Suspense fallback={<LazyFallback />}><CountriesPage /></Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: 'universities',
        element: (
          <PermissionGuard permission="universities:manage">
            <Suspense fallback={<LazyFallback />}><UniversitiesAdminPage /></Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: 'users',
        element: (
          <PermissionGuard permission="users:manage">
            <Suspense fallback={<LazyFallback />}><UsersPage /></Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: 'activity-logs',
        element: (
          <PermissionGuard permission="activity-log:view">
            <Suspense fallback={<LazyFallback />}><ActivityLogsPage /></Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: 'cms/blogs',
        element: (
          <PermissionGuard permission="content:manage">
            <Suspense fallback={<LazyFallback />}><CmsCollectionsPage kind="blogs" /></Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: 'cms/events',
        element: (
          <PermissionGuard permission="content:manage">
            <Suspense fallback={<LazyFallback />}><CmsCollectionsPage kind="events" /></Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: 'cms/success-stories',
        element: (
          <PermissionGuard permission="content:manage">
            <Suspense fallback={<LazyFallback />}><CmsCollectionsPage kind="success-stories" /></Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: 'cms/gallery',
        element: (
          <PermissionGuard permission="content:manage">
            <Suspense fallback={<LazyFallback />}><CmsCollectionsPage kind="gallery" /></Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: 'cms/sister-concerns',
        element: (
          <PermissionGuard permission="content:manage">
            <Suspense fallback={<LazyFallback />}><CmsCollectionsPage kind="sister-concerns" /></Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: 'cms/settings',
        element: (
          <PermissionGuard permission="content:manage">
            <Suspense fallback={<LazyFallback />}><CmsSettingsPage /></Suspense>
          </PermissionGuard>
        ),
      },
      { path: '*', element: <Navigate to="/admin" replace /> },
    ],
  },
]);
