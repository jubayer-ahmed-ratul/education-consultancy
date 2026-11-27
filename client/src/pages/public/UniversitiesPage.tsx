import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Award, GraduationCap, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { apiRequest } from '../../lib/api-client';
import { prefetchUniversity } from '../../lib/prefetch';
import { queryKeys } from '../../lib/query-keys';

interface UniversityListItem {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  description: string;
  programs?: string[];
  scholarshipDetails?: string | null;
  applicationDeadlines?: string | null;
  tuitionRange?: { min: number; max: number; currency: string } | null;
  country?: { name: string; slug?: string };
}

export default function UniversitiesPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [degreeLevel, setDegreeLevel] = useState('');
  const [scholarshipOnly, setScholarshipOnly] = useState(false);

  const { data: countriesRes } = useQuery({
    queryKey: queryKeys.countries.publicList({ page: 1, limit: 100 }),
    queryFn: () =>
      apiRequest<Array<{ id: string; name: string; slug: string }>>('/countries?page=1&limit=100'),
  });

  const params = new URLSearchParams({ page: '1', limit: '50' });
  if (search.trim()) params.set('search', search.trim());
  if (country) params.set('country', country);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.universities.publicList({ search, country }),
    placeholderData: keepPreviousData,
    queryFn: () => apiRequest<UniversityListItem[]>(`/universities?${params.toString()}`),
  });

  const filteredUniversities = useMemo(() => {
    let list = data?.data ?? [];
    if (degreeLevel) {
      const needle = degreeLevel.toLowerCase();
      list = list.filter((u) =>
        (u.programs ?? []).some((p) => p.toLowerCase().includes(needle))
      );
    }
    if (scholarshipOnly) {
      list = list.filter((u) => Boolean(u.scholarshipDetails?.trim()));
    }
    return list;
  }, [data?.data, degreeLevel, scholarshipOnly]);

  return (
    <div className="mx-auto max-w-11/12 space-y-8 px-4 py-10 sm:px-6">
      <Helmet>
        <title>Partner Universities â€” StudySphere</title>
      </Helmet>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <GraduationCap className="h-3.5 w-3.5" /> Institution Directory
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-zinc-950">
            Partner Universities
          </h1>
          <p className="mt-1 text-sm text-zinc-700">
            Compare tuition ranges, degree programs, and scholarship opportunities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-44 text-zinc-950"
          >
            <option value="">All Countries</option>
            {countriesRes?.data.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>

          <Select
            value={degreeLevel}
            onChange={(e) => setDegreeLevel(e.target.value)}
            className="w-40 text-zinc-950"
          >
            <option value="">All Degrees</option>
            <option value="bachelor">Bachelor&apos;s</option>
            <option value="master">Master&apos;s / MSc</option>
            <option value="mba">MBA</option>
            <option value="phd">PhD</option>
          </Select>

          <button
            type="button"
            onClick={() => setScholarshipOnly((prev) => !prev)}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors cursor-pointer ${
              scholarshipOnly
                ? 'bg-teal-600 text-white'
                : 'bg-white text-zinc-950 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50'
            }`}
          >
            <Award className="h-3.5 w-3.5" /> Scholarships
          </button>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search universities..."
              className="pl-9 text-zinc-950"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl bg-zinc-200/70" />
          ))}
        </div>
      ) : !filteredUniversities.length ? (
        <div className="rounded-xl bg-white p-10 text-center text-sm text-zinc-600 ring-1 ring-zinc-950/10">
          No partner universities matched your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUniversities.map((u) => (
            <Link
              key={u.id}
              to={`/universities/${u.slug}`}
              onMouseEnter={() => void prefetchUniversity(queryClient, u.slug)}
              onTouchStart={() => void prefetchUniversity(queryClient, u.slug)}
              onFocus={() => void prefetchUniversity(queryClient, u.slug)}
              className="group flex flex-col justify-between space-y-4 rounded-xl bg-white p-5 ring-1 ring-zinc-950/10 transition-all hover:ring-teal-600/40 hover:shadow-sm"
            >
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-teal-700">
                    {[u.city, u.country?.name].filter(Boolean).join(', ')}
                  </span>
                  {u.scholarshipDetails && (
                    <Badge variant="success" className="bg-teal-50 text-teal-700 border-teal-200">
                      Scholarships
                    </Badge>
                  )}
                </div>
                <h2 className="font-display text-base font-bold text-zinc-950 group-hover:text-teal-700">
                  {u.name}
                </h2>
                <p className="text-xs leading-relaxed text-zinc-700 line-clamp-3">
                  {u.description}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-xs">
                <span className="font-mono font-semibold text-zinc-950">
                  {u.tuitionRange
                    ? `${u.tuitionRange.currency} ${u.tuitionRange.min.toLocaleString()}â€“${u.tuitionRange.max.toLocaleString()}`
                    : `${u.programs?.length || 0} Programs`}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-teal-700">
                  Details <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
