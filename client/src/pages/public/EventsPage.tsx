import { useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../../lib/api-client';
import { prefetchEvent } from '../../lib/prefetch';

export default function EventsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['public-events', filter],
    placeholderData: keepPreviousData,
    queryFn: () =>
      apiRequest<
        Array<{
          id: string;
          title: string;
          slug: string;
          shortDescription: string;
          eventDate: string;
          venue: string;
          locationType: string;
        }>
      >(`/events?filter=${filter}`),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-8">
      <Helmet>
        <title>Events & Fairs — Zero Compile</title>
      </Helmet>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E5E2DC] pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706]">Admissions Calendar</span>
          <h1 className="mt-1 font-display text-3xl font-bold text-[#111827]">Educational Events & Expos</h1>
        </div>
        <div className="flex gap-2">
          {(['all', 'upcoming', 'past'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-md px-3.5 py-2 text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? 'bg-[#0D3B2E] text-white'
                  : 'border border-[#CFCAC0] bg-white text-[#4B5563] hover:bg-[#F3F1EC]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-lg border border-[#E5E2DC] bg-[#F3F1EC]" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="rounded-lg border border-[#E5E2DC] bg-white p-10 text-center text-sm text-[#6B7280]">
          No events found for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {data.data.map((ev) => (
            <Link
              key={ev.id}
              to={`/events/${ev.slug}`}
              onMouseEnter={() => void prefetchEvent(queryClient, ev.slug)}
              onTouchStart={() => void prefetchEvent(queryClient, ev.slug)}
              onFocus={() => void prefetchEvent(queryClient, ev.slug)}
              className="group rounded-lg border border-[#E5E2DC] bg-white p-6 transition-all hover:border-[#CFCAC0] hover:shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-medium text-[#0D3B2E]">
                <span className="inline-flex items-center gap-1.5 font-mono">
                  <Calendar className="h-3.5 w-3.5" /> {new Date(ev.eventDate).toLocaleDateString()}
                </span>
                <span className="rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[11px] font-semibold uppercase text-[#B45309]">
                  {ev.locationType.replace('_', '-')}
                </span>
              </div>
              <h2 className="font-display text-lg font-bold text-[#111827] group-hover:text-[#0D3B2E]">
                {ev.title}
              </h2>
              <p className="text-sm text-[#4B5563]">{ev.shortDescription}</p>
              <div className="inline-flex items-center gap-1.5 text-xs text-[#6B7280]">
                <MapPin className="h-3.5 w-3.5" /> {ev.venue}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
