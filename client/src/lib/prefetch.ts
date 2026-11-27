import type { QueryClient } from '@tanstack/react-query';
import { apiRequest } from './api-client';
import { queryKeys } from './query-keys';

export function prefetchPublicBundle(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.cms.publicBundle,
    queryFn: async () => {
      const res = await apiRequest('/content/public');
      return res.data;
    },
  });
}

export function prefetchCountriesList(queryClient: QueryClient, search = '') {
  const params = new URLSearchParams({ page: '1', limit: '50' });
  if (search) params.set('search', search);
  return queryClient.prefetchQuery({
    queryKey: queryKeys.countries.publicList({ search }),
    queryFn: () => apiRequest(`/countries?${params.toString()}`),
  });
}

export function prefetchDestination(queryClient: QueryClient, slug: string) {
  return queryClient.prefetchQuery({
    queryKey: ['public-country', slug],
    queryFn: () => apiRequest(`/countries/${slug}`),
  });
}

export function prefetchUniversitiesList(queryClient: QueryClient, search = '', country = '') {
  const params = new URLSearchParams({ page: '1', limit: '50' });
  if (search) params.set('search', search);
  if (country) params.set('country', country);
  return queryClient.prefetchQuery({
    queryKey: queryKeys.universities.publicList({ search, country }),
    queryFn: () => apiRequest(`/universities?${params.toString()}`),
  });
}

export function prefetchUniversity(queryClient: QueryClient, slug: string) {
  return queryClient.prefetchQuery({
    queryKey: ['public-university', slug],
    queryFn: () => apiRequest(`/universities/${slug}`),
  });
}

export function prefetchBlogsList(queryClient: QueryClient, search = '') {
  const params = new URLSearchParams({ page: '1', limit: '30' });
  if (search) params.set('search', search);
  return queryClient.prefetchQuery({
    queryKey: ['public-blogs', search],
    queryFn: () => apiRequest(`/blogs?${params.toString()}`),
  });
}

export function prefetchBlog(queryClient: QueryClient, slug: string) {
  return queryClient.prefetchQuery({
    queryKey: ['public-blog', slug],
    queryFn: () => apiRequest(`/blogs/${slug}`),
  });
}

export function prefetchEventsList(queryClient: QueryClient, filter: 'all' | 'upcoming' | 'past' = 'all') {
  return queryClient.prefetchQuery({
    queryKey: ['public-events', filter],
    queryFn: () => apiRequest(`/events?filter=${filter}`),
  });
}

export function prefetchEvent(queryClient: QueryClient, slug: string) {
  return queryClient.prefetchQuery({
    queryKey: ['public-event', slug],
    queryFn: () => apiRequest(`/events/${slug}`),
  });
}

export function prefetchAboutPage(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: ['public-about-page'],
    queryFn: () => apiRequest('/content/about-page'),
  });
}

export function prefetchContactPage(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: ['public-contact-page'],
    queryFn: () => apiRequest('/content/contact-page'),
  });
}

export function prefetchRoute(queryClient: QueryClient, to: string) {
  if (to === '/destinations') return prefetchCountriesList(queryClient);
  if (to.startsWith('/destinations/')) {
    const slug = to.slice('/destinations/'.length);
    if (slug) return prefetchDestination(queryClient, slug);
  }
  if (to === '/universities') return prefetchUniversitiesList(queryClient);
  if (to.startsWith('/universities/')) {
    const slug = to.slice('/universities/'.length);
    if (slug) return prefetchUniversity(queryClient, slug);
  }
  if (to === '/blogs') return prefetchBlogsList(queryClient);
  if (to.startsWith('/blogs/')) {
    const slug = to.slice('/blogs/'.length);
    if (slug) return prefetchBlog(queryClient, slug);
  }
  if (to === '/events') return prefetchEventsList(queryClient, 'all');
  if (to.startsWith('/events/')) {
    const slug = to.slice('/events/'.length);
    if (slug) return prefetchEvent(queryClient, slug);
  }
  if (to === '/about') return prefetchAboutPage(queryClient);
  if (to === '/contact') return prefetchContactPage(queryClient);
  if (to === '/success-stories' || to === '/gallery' || to === '/') {
    return prefetchPublicBundle(queryClient);
  }
}
