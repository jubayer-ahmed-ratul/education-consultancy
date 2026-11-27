import { useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
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
    <div className="mx-auto max-w-11/12 space-y-8 px-4 py-10 sm:px-6">
      <Helmet>
        <title>Events & Fairs — Zero Compile</title>
      </Helmet>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <Calendar className="h-3.5 w-3.5" /> Admissions Calendar
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-zinc-950">
            Educational Events & Expos
          </h1>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'upcoming' | 'past')}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl bg-zinc-200/70" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="rounded-xl bg-white p-10 text-center text-sm text-zinc-600 ring-1 ring-zinc-950/10">
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
              className="group space-y-3 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10 transition-all hover:ring-teal-600/40 hover:shadow-sm"
            >
              <div className="flex items-center justify-between text-xs font-medium text-teal-700">
                <span className="inline-flex items-center gap-1.5 font-mono font-semibold">
                  <Calendar className="h-3.5 w-3.5" /> {new Date(ev.eventDate).toLocaleDateString()}
                </span>
                <Badge variant="success" className="bg-teal-50 text-teal-700 border-teal-200 uppercase">
                  {ev.locationType.replace('_', '-')}
                </Badge>
              </div>
              <h2 className="font-display text-lg font-bold text-zinc-950 group-hover:text-teal-700">
                {ev.title}
              </h2>
              <p className="text-sm text-zinc-700">{ev.shortDescription}</p>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600">
                <MapPin className="h-3.5 w-3.5" /> {ev.venue}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
