import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Globe2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Input } from '../../components/ui/input';
import { apiRequest } from '../../lib/api-client';
import { prefetchDestination } from '../../lib/prefetch';
import { queryKeys } from '../../lib/query-keys';

export default function DestinationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedIntake, setSelectedIntake] = useState('');
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

  const intakeOptions = useMemo(() => {
    const set = new Set<string>();
    data?.data.forEach((c) => c.intakes.forEach((i) => set.add(i)));
    return Array.from(set).slice(0, 6);
  }, [data?.data]);

  const filteredCountries = useMemo(() => {
    const list = data?.data ?? [];
    if (!selectedIntake) return list;
    return list.filter((c) => c.intakes.includes(selectedIntake));
  }, [data?.data, selectedIntake]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <Helmet>
        <title>Study Destinations — Zero Compile</title>
      </Helmet>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <Globe2 className="h-3.5 w-3.5" /> Global Pathways
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-zinc-950">
            Study Destinations
          </h1>
          <p className="mt-1 text-sm text-zinc-700">
            Explore admission criteria, living costs, scholarships, and visa pathways.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destinations..."
            className="pl-9 text-zinc-950"
          />
        </div>
      </div>

      {intakeOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-700 mr-1">Intake:</span>
          <button
            type="button"
            onClick={() => setSelectedIntake('')}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              !selectedIntake
                ? 'bg-teal-600 text-white'
                : 'bg-white text-zinc-700 ring-1 ring-zinc-950/10 hover:text-zinc-950'
            }`}
          >
            All Intakes
          </button>
          {intakeOptions.map((intake) => (
            <button
              key={intake}
              type="button"
              onClick={() => setSelectedIntake(intake)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                selectedIntake === intake
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-zinc-700 ring-1 ring-zinc-950/10 hover:text-zinc-950'
              }`}
            >
              {intake}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-60 animate-pulse rounded-xl bg-zinc-200/70" />
          ))}
        </div>
      ) : !filteredCountries.length ? (
        <div className="rounded-xl bg-white p-10 text-center text-sm text-zinc-600 ring-1 ring-zinc-950/10">
          No destinations matched your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCountries.map((c) => (
            <Link
              key={c.id}
              to={`/destinations/${c.slug}`}
              onMouseEnter={() => void prefetchDestination(queryClient, c.slug)}
              onTouchStart={() => void prefetchDestination(queryClient, c.slug)}
              onFocus={() => void prefetchDestination(queryClient, c.slug)}
              className="group flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-zinc-950/10 transition-all hover:ring-teal-600/40 hover:shadow-sm"
            >
              {c.imageUrl && (
                <div className="aspect-[16/10] w-full overflow-hidden bg-zinc-100">
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
                <div>
                  <h2 className="font-display text-lg font-bold text-zinc-950 group-hover:text-teal-700">
                    {c.name}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-700 line-clamp-3">
                    {c.description}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-xs">
                  <span className="font-medium text-zinc-600">
                    {c.intakes.length > 0 ? `Intakes: ${c.intakes.slice(0, 2).join(', ')}` : 'Multiple intakes'}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-teal-700">
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
