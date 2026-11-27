import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { apiRequest } from './lib/api-client';
import { prefetchPublicBundle } from './lib/prefetch';
import { queryKeys } from './lib/query-keys';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const noIndex = import.meta.env.VITE_SITE_NOINDEX !== 'false';

export default function App() {
  useEffect(() => {
    void prefetchPublicBundle(queryClient);
    void queryClient.prefetchQuery({
      queryKey: queryKeys.countries.publicList({ page: 1, limit: 6 }),
      queryFn: () => apiRequest('/countries?page=1&limit=6'),
    });
  }, []);

  return (
    <HelmetProvider>
      <Helmet>
        {noIndex && <meta name="robots" content="noindex, nofollow" />}
      </Helmet>
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      </MotionConfig>
    </HelmetProvider>
  );
}
