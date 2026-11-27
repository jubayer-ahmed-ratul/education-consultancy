import { useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../../lib/api-client';
import { prefetchUniversity } from '../../lib/prefetch';
import { queryKeys } from '../../lib/query-keys';

export default function UniversitiesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');

  const { data: countriesRes } = useQuery({
    queryKey: queryKeys.countries.publicList({ page: 1, limit: 100 }),
    queryFn: () => apiRequest<Array<{ id: string; name: string; slug: string }>>('/countries?page=1&limit=100'),
  });

  const params = new URLSearchParams({ page: '1', limit: '50' });
  if (search.trim()) params.set('search', search.trim());
  if (country) params.set('country', country);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.universities.publicList({ search, country }),
    placeholderData: keepPreviousData,
    queryFn: () =>
      apiRequest<
        Array<{
          id: string;
          name: string;
          slug: string;
          city: string | null;
          description: string;
          country?: { name: string };
        }>
      >(`/universities?${params.toString()}`),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-8">
      <Helmet>
        <title>Partner Universities — Zero Compile</title>
      </Helmet>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E5E2DC] pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706]">Institution Directory</span>
          <h1 className="mt-1 font-display text-3xl font-bold text-[#111827]">Partner Universities</h1>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-md border border-[#CFCAC0] bg-white px-3 py-2 text-sm focus:border-[#0D3B2E] focus:outline-none"
          >
            <option value="">All Countries</option>
            {countriesRes?.data.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search universities..."
              className="rounded-md border border-[#CFCAC0] bg-white py-2 pl-9 pr-3 text-sm focus:border-[#0D3B2E] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-lg border border-[#E5E2DC] bg-[#F3F1EC]" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="rounded-lg border border-[#E5E2DC] bg-white p-10 text-center text-sm text-[#6B7280]">
          No partner universities matched your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((u) => (
            <Link
              key={u.id}
              to={`/universities/${u.slug}`}
              onMouseEnter={() => void prefetchUniversity(queryClient, u.slug)}
              onTouchStart={() => void prefetchUniversity(queryClient, u.slug)}
              onFocus={() => void prefetchUniversity(queryClient, u.slug)}
              className="group rounded-lg border border-[#E5E2DC] bg-white p-5 transition-all hover:border-[#CFCAC0] hover:shadow-sm space-y-2"
            >
              <div className="text-xs font-semibold text-[#0D3B2E]">
                {[u.city, u.country?.name].filter(Boolean).join(', ')}
              </div>
              <h2 className="font-display text-base font-bold text-[#111827] group-hover:text-[#0D3B2E]">
                {u.name}
              </h2>
              <p className="text-xs leading-relaxed text-[#4B5563] line-clamp-3">{u.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
