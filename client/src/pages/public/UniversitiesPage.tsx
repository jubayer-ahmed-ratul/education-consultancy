import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, GraduationCap, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../../lib/api-client';
import { prefetchUniversity } from '../../lib/prefetch';
import { queryKeys } from '../../lib/query-keys';

interface UniversityListItem {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  logoUrl?: string | null;
  description: string;
  programs?: string[];
  tuitionRange?: { min: number; max: number; currency: string } | null;
  country?: { name: string; slug?: string };
}

function UniversityCardLogo({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(/\s+/)
    .filter((w) => !['of', 'and', 'the', 'for'].includes(w.toLowerCase()))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  if (logoUrl && !failed) {
    return (
      <img
        src={logoUrl}
        alt={`${name} logo`}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-12 w-12 shrink-0 rounded-xl bg-zinc-50 object-contain p-1.5 ring-1 ring-zinc-950/5"
      />
    );
  }

  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-bold text-teal-700 ring-1 ring-teal-200/70">
      {initials || 'U'}
    </span>
  );
}

export default function UniversitiesPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');

  const { data: countriesRes } = useQuery({
    queryKey: queryKeys.countries.publicList({ page: 1, limit: 100 }),
    queryFn: () =>
      apiRequest<Array<{ id: string; name: string; slug: string }>>('/countries?page=1&limit=100'),
  });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.universities.publicList({ page: 1, limit: 100 }),
    placeholderData: keepPreviousData,
    queryFn: () => apiRequest<UniversityListItem[]>('/universities?page=1&limit=100'),
  });

  const filteredUniversities = useMemo(() => {
    let list = data?.data ?? [];
    if (country) {
      list = list.filter((u) => u.country?.slug === country);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.city ?? '').toLowerCase().includes(q) ||
          (u.country?.name ?? '').toLowerCase().includes(q) ||
          u.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data?.data, country, search]);

  return (
    <div className="bg-[#F8FAFC] pb-20">
      <Helmet>
        <title>Explore Partner Universities — StudySphere</title>
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
              <GraduationCap className="h-3.5 w-3.5" /> Partner Institutions
            </span>
            <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Explore Partner Universities
            </h1>
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
              Browse accredited universities worldwide, compare tuition ranges, and submit direct
              applications through StudySphere.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Country Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCountry('')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  !country
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white/10 text-white/85 ring-1 ring-white/20 hover:bg-white/20 hover:text-white'
                }`}
              >
                All Countries
              </button>
              {countriesRes?.data.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCountry(c.slug)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    country === c.slug
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white/10 text-white/85 ring-1 ring-white/20 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by university name or city..."
                className="h-10 w-full rounded-xl bg-white pl-10 pr-4 text-sm text-zinc-950 placeholder:text-zinc-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Universities Grid */}
      <div className="mx-auto w-11/12 max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-2xl bg-white ring-1 ring-zinc-950/10"
              />
            ))}
          </div>
        ) : !filteredUniversities.length ? (
          <div className="rounded-2xl bg-white p-12 text-center text-sm font-medium text-zinc-700 ring-1 ring-zinc-950/10">
            No partner universities matched your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredUniversities.map((u) => (
              <div
                key={u.id}
                className="flex flex-col justify-between rounded-2xl bg-white p-6 ring-1 ring-zinc-950/10 transition-all hover:shadow-md hover:ring-teal-600/50"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <UniversityCardLogo name={u.name} logoUrl={u.logoUrl} />
                    <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                      {[u.city, u.country?.name].filter(Boolean).join(', ')}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-display text-lg font-bold text-zinc-950">{u.name}</h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-700 line-clamp-2">
                      {u.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-zinc-100 pt-4">
                  <Link
                    to={`/universities/${u.slug}`}
                    onMouseEnter={() => void prefetchUniversity(queryClient, u.slug)}
                    onTouchStart={() => void prefetchUniversity(queryClient, u.slug)}
                    onFocus={() => void prefetchUniversity(queryClient, u.slug)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-50 px-4 py-2.5 text-xs font-semibold text-zinc-950 ring-1 ring-zinc-950/10 transition-colors hover:bg-teal-600 hover:text-white hover:ring-teal-600"
                  >
                    <span>View University Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
