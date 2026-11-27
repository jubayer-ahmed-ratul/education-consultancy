import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, ExternalLink, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../../lib/api-client';

interface EventDetail {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
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
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-event', slug],
    queryFn: () => apiRequest<EventDetail>(`/events/${slug}`),
    enabled: Boolean(slug),
  });

  if (isLoading) return <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-[#6B7280]">Loading event...</div>;
  if (error || !data?.data) return <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-rose-700">Event not found.</div>;

  const ev = data.data;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-6">
      <Helmet>
        <title>{ev.seoTitle || ev.title} — Zero Compile</title>
        <meta name="description" content={ev.seoDescription || ev.shortDescription} />
      </Helmet>

      <Link to="/events" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4B5563] hover:text-[#111827]">
        <ArrowLeft className="h-3.5 w-3.5" /> All Events
      </Link>

      <div className="rounded-lg border border-[#E5E2DC] bg-white p-6 sm:p-8 space-y-5">
        <span className="inline-block rounded-full bg-[#FEF3C7] px-3 py-0.5 text-xs font-semibold uppercase text-[#B45309]">
          {ev.locationType.replace('_', '-')}
        </span>
        <h1 className="font-display text-3xl font-bold text-[#111827]">{ev.title}</h1>

        <div className="grid grid-cols-1 gap-3 rounded-md border border-[#E5E2DC] bg-[#FAF9F6] p-4 text-sm sm:grid-cols-3">
          <div className="flex items-center gap-2 text-[#111827]">
            <Calendar className="h-4 w-4 text-[#0D3B2E]" />
            <span className="font-mono text-xs">{new Date(ev.eventDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-[#111827]">
            <Clock className="h-4 w-4 text-[#0D3B2E]" />
            <span className="text-xs">{ev.startTime} – {ev.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-[#111827]">
            <MapPin className="h-4 w-4 text-[#0D3B2E]" />
            <span className="text-xs">{ev.venue}</span>
          </div>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#4B5563]">{ev.fullDescription}</p>

        {ev.registrationUrl && (
          <a
            href={ev.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-[#0D3B2E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#092A20]"
          >
            Register for Event <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}
