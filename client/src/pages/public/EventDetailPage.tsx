import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, ExternalLink, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { apiRequest } from '../../lib/api-client';
import {
  DEFAULT_EVENT_IMAGE,
  resolveMediaUrl,
  type CmsImageField,
} from '../../lib/cms-image';
import type { PublicEventItem } from './EventsPage';

interface EventDetail {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  eventBanner?: CmsImageField;
  coverImage?: CmsImageField;
  imageUrl?: CmsImageField;
  image?: CmsImageField;
  bannerImage?: CmsImageField;
  eventDate: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  locationType: string;
  venue: string;
  registrationUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export default function EventDetailPage() {
  const { slug = '' } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-event', slug],
    queryFn: () => apiRequest<EventDetail>(`/events/${slug}`),
    placeholderData: () => {
      if (!slug) return undefined;
      const lists = queryClient.getQueriesData<{ data?: PublicEventItem[] }>({
        queryKey: ['public-events'],
      });
      for (const [, cached] of lists) {
        const match = cached?.data?.find((item) => item.slug === slug);
        if (match) {
          return {
            success: true as const,
            data: {
              ...match,
              fullDescription: match.shortDescription,
              startTime: match.startTime ?? '10:00 AM',
              endTime: match.endTime ?? '02:00 PM',
              timeZone: 'Asia/Dhaka',
            },
          };
        }
      }
      return undefined;
    },
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-11/12 max-w-[1440px] space-y-4 pt-28 pb-16">
        <div className="h-8 w-56 animate-pulse rounded bg-zinc-200/70" />
        <div className="h-64 animate-pulse rounded-2xl bg-zinc-200/70" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="mx-auto w-11/12 max-w-[1440px] space-y-3 pt-28 pb-16 text-center">
        <p className="text-sm font-medium text-rose-700">Event not found.</p>
        <Link to="/events" className="text-sm font-semibold text-teal-700 underline">
          Back to Events
        </Link>
      </div>
    );
  }

  const ev = data.data;
  const bannerUrl = resolveMediaUrl(ev, DEFAULT_EVENT_IMAGE);

  return (
    <div className="mx-auto w-11/12 max-w-[1440px] space-y-6 pt-28 pb-16">
      <Helmet>
        <title>{ev.seoTitle || ev.title} — StudySphere</title>
        <meta name="description" content={ev.seoDescription || ev.shortDescription} />
      </Helmet>

      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All Events
      </Link>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-950/10">
        <div className="aspect-[21/9] max-h-[420px] w-full overflow-hidden bg-zinc-100">
          <img
            src={bannerUrl}
            alt={ev.title}
            onError={(e) => {
              if (e.currentTarget.src !== DEFAULT_EVENT_IMAGE) {
                e.currentTarget.src = DEFAULT_EVENT_IMAGE;
              }
            }}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-5 p-6 sm:p-8">
          <Badge variant="success" className="border-teal-200 bg-teal-50 uppercase text-teal-700">
            {ev.locationType.replace('_', '-')}
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-950">{ev.title}</h1>

          <div className="grid grid-cols-1 gap-3 rounded-lg bg-[#F8FAFC] p-4 text-sm ring-1 ring-zinc-950/10 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-zinc-950">
              <Calendar className="h-4 w-4 text-teal-600" />
              <span className="font-mono text-xs">{new Date(ev.eventDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-950">
              <Clock className="h-4 w-4 text-teal-600" />
              <span className="text-xs">
                {ev.startTime} – {ev.endTime}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-950">
              <MapPin className="h-4 w-4 text-teal-600" />
              <span className="text-xs">{ev.venue}</span>
            </div>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
            {ev.fullDescription}
          </p>

          {ev.registrationUrl && (
            <a href={ev.registrationUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
              <Button className="bg-teal-600 text-white hover:bg-teal-700">
                Register for Event <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
