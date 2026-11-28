import { useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { apiRequest } from '../../lib/api-client';
import {
  DEFAULT_EVENT_IMAGE,
  resolveMediaUrl,
  type CmsImageField,
} from '../../lib/cms-image';
import { prefetchEvent } from '../../lib/prefetch';

export interface PublicEventItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  eventBanner?: CmsImageField;
  coverImage?: CmsImageField;
  imageUrl?: CmsImageField;
  image?: CmsImageField;
  bannerImage?: CmsImageField;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  venue: string;
  locationType: string;
}

export default function EventsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['public-events', filter],
    placeholderData: keepPreviousData,
    queryFn: () => apiRequest<PublicEventItem[]>(`/events?filter=${filter}`),
  });

  return (
    <div className="mx-auto w-11/12 max-w-[1440px] space-y-8 pt-28 pb-16">
      <Helmet>
        <title>Events &amp; Fairs — StudySphere</title>
      </Helmet>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <Calendar className="h-3.5 w-3.5" /> Admissions Calendar
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-zinc-950">
            Educational Events &amp; Expos
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-zinc-200/70" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-zinc-600 ring-1 ring-zinc-950/10">
          No events found for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {data.data.map((ev) => {
            const bannerUrl = resolveMediaUrl(ev, DEFAULT_EVENT_IMAGE);
            return (
              <Link
                key={ev.id}
                to={`/events/${ev.slug}`}
                onMouseEnter={() => void prefetchEvent(queryClient, ev.slug)}
                onTouchStart={() => void prefetchEvent(queryClient, ev.slug)}
                onFocus={() => void prefetchEvent(queryClient, ev.slug)}
                className="group overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-950/10 transition-all hover:shadow-md hover:ring-teal-600/40"
              >
                <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-100">
                  <img
                    src={bannerUrl}
                    alt={ev.title}
                    loading="lazy"
                    onError={(e) => {
                      if (e.currentTarget.src !== DEFAULT_EVENT_IMAGE) {
                        e.currentTarget.src = DEFAULT_EVENT_IMAGE;
                      }
                    }}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-3 p-6">
                  <div className="flex items-center justify-between text-xs font-medium text-teal-700">
                    <span className="inline-flex items-center gap-1.5 font-mono font-semibold">
                      <Calendar className="h-3.5 w-3.5" /> {new Date(ev.eventDate).toLocaleDateString()}
                    </span>
                    <Badge variant="success" className="border-teal-200 bg-teal-50 uppercase text-teal-700">
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
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
