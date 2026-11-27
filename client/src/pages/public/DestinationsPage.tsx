import { useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../../lib/api-client';
import { prefetchDestination } from '../../lib/prefetch';
import { queryKeys } from '../../lib/query-keys';

export default function DestinationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const params = new URLSearchParams({ page: '1', limit: '50' });
  if (search.trim()) params.set('search', search.trim());

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.countries.publicList({ search }),
    placeholderData: keepPreviousData,
    queryFn: () =>
      apiRequest<
        Array<{
          id: string;
          name: string;
          slug: string;
          description: string;
          imageUrl: string | null;
          intakes: string[];
        }>
      >(`/countries?${params.toString()}`),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-8">
      <Helmet>
        <title>Study Destinations — Zero Compile</title>
      </Helmet>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E5E2DC] pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706]">Global Pathways</span>
          <h1 className="mt-1 font-display text-3xl font-bold text-[#111827]">Study Destinations</h1>
          <p className="mt-1 text-sm text-[#4B5563]">Explore admission criteria, living costs, and visa pathways.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destinations..."
            className="w-full rounded-md border border-[#CFCAC0] bg-white py-2 pl-9 pr-3 text-sm focus:border-[#0D3B2E] focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-lg border border-[#E5E2DC] bg-[#F3F1EC]" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="rounded-lg border border-[#E5E2DC] bg-white p-10 text-center text-sm text-[#6B7280]">
          No destinations matched your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((c) => (
            <Link
              key={c.id}
              to={`/destinations/${c.slug}`}
              onMouseEnter={() => void prefetchDestination(queryClient, c.slug)}
              onFocus={() => void prefetchDestination(queryClient, c.slug)}
              className="group flex flex-col rounded-lg border border-[#E5E2DC] bg-white overflow-hidden transition-all hover:border-[#CFCAC0] hover:shadow-sm"
            >
              {c.imageUrl && (
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#F3F1EC]">
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#111827] group-hover:text-[#0D3B2E]">
                    {c.name}
                  </h2>
                  <p className="mt-1.5 text-sm text-[#4B5563] line-clamp-3">{c.description}</p>
                </div>
                <div className="flex items-center justify-between border-t border-[#E5E2DC] pt-3 text-xs">
                  <span className="text-[#6B7280]">
                    {c.intakes.length > 0 ? `Intakes: ${c.intakes.slice(0, 2).join(', ')}` : 'Multiple intakes'}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#0D3B2E]">
                    Guide <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
