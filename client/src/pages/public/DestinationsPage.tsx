import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Globe2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../../lib/api-client';
import { prefetchDestination } from '../../lib/prefetch';
import { queryKeys } from '../../lib/query-keys';

const REGION_FILTERS = ['All', 'Europe', 'North America', 'Asia-Pacific'] as const;
type RegionFilter = (typeof REGION_FILTERS)[number];

const FALLBACK_IMAGES = [
  '/hero-landmarks.jpg',
  '/about-primary.jpg',
  '/about-campus.jpg',
  '/about-counseling.jpg',
];

function matchesRegion(slug: string, name: string, region: RegionFilter): boolean {
  if (region === 'All') return true;
  const key = `${slug} ${name}`.toLowerCase();
  if (region === 'Europe') {
    return /uk|united-kingdom|germany|ireland|france|netherlands|sweden|italy|spain|europe/.test(key);
  }
  if (region === 'North America') {
    return /canada|usa|united-states|america/.test(key);
  }
  if (region === 'Asia-Pacific') {
    return /australia|new-zealand|malaysia|singapore|japan|korea|bangladesh|asia/.test(key);
  }
  return true;
}

export default function DestinationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState<RegionFilter>('All');

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.countries.publicList({ page: 1, limit: 100 }),
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
      >('/countries?page=1&limit=100'),
  });

  const filteredCountries = useMemo(() => {
    const list = data?.data ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((c) => {
      if (!matchesRegion(c.slug, c.name, region)) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.intakes.some((i) => i.toLowerCase().includes(q))
      );
    });
  }, [data?.data, search, region]);

  return (
    <div className="bg-[#F8FAFC] pb-20">
      <Helmet>
        <title>Explore Study Destinations — StudySphere</title>
      </Helmet>

      {/* Navy-to-Teal Gradient Hero */}
      <section className="relative flex min-h-[300px] w-full items-end overflow-hidden bg-gradient-to-br from-[#09090B] via-[#0B1F3A] to-[#0D9488] sm:min-h-[340px]">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.28) 0%, transparent 45%), linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 40px 40px, 40px 40px',
          }}
        />

        <div className="relative z-10 mx-auto w-11/12 max-w-[1440px] space-y-6 pb-10 pt-28">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-300">
              <Globe2 className="h-3.5 w-3.5" /> Global Study Destinations
            </span>
            <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Explore Study Destinations
            </h1>
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
              Compare tuition, living budgets, intake timelines, and post-study work visa pathways
              across leading higher-education hubs.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {REGION_FILTERS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegion(r)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    region === r
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white/10 text-white/85 ring-1 ring-white/20 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search countries..."
                className="h-10 w-full rounded-xl bg-white pl-10 pr-4 text-sm text-zinc-950 placeholder:text-zinc-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Full-Bleed Country Cards Grid */}
      <div className="mx-auto w-11/12 max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl bg-zinc-200/80"
              />
            ))}
          </div>
        ) : !filteredCountries.length ? (
          <div className="rounded-2xl bg-white p-12 text-center text-sm font-medium text-zinc-700 ring-1 ring-zinc-950/10">
            No destinations matched your search or region filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCountries.map((c, idx) => (
              <Link
                key={c.id}
                to={`/countries/${c.slug}`}
                onMouseEnter={() => void prefetchDestination(queryClient, c.slug)}
                onTouchStart={() => void prefetchDestination(queryClient, c.slug)}
                onFocus={() => void prefetchDestination(queryClient, c.slug)}
                className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-zinc-950/10"
              >
                <img
                  src={c.imageUrl || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                  <div className="space-y-1.5">
                    <span className="inline-block rounded-full bg-teal-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      {c.intakes.length > 0 ? c.intakes[0] : 'Open Intakes'}
                    </span>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-white">
                      {c.name}
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs transition-all group-hover:bg-teal-600">
                    Explore{' '}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
