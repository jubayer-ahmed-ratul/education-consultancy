import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { apiRequest } from '../../lib/api-client';
import { prefetchUniversity } from '../../lib/prefetch';

interface CountryDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  highlights: string[];
  intakes: string[];
  educationSystem: string | null;
  admissionRequirements: string | null;
  tuitionAndLivingCosts: string | null;
  visaRequirements: string | null;
  scholarshipInfo: string | null;
  universities: Array<{ id: string; name: string; slug: string; city: string | null }>;
}

export default function DestinationDetailPage() {
  const { slug = '' } = useParams();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-country', slug],
    queryFn: () => apiRequest<CountryDetail>(`/countries/${slug}`),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-200/70" />
        <div className="h-44 animate-pulse rounded-xl bg-zinc-200/70" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="mx-auto max-w-4xl space-y-3 px-4 py-12 text-center">
        <p className="text-sm font-medium text-rose-700">Destination not found.</p>
        <Link to="/destinations" className="text-sm font-semibold text-teal-700 underline">
          Back to Destinations
        </Link>
      </div>
    );
  }

  const c = data.data;
  const sections = [
    ['Education System', c.educationSystem],
    ['Admission Requirements', c.admissionRequirements],
    ['Tuition & Living Costs', c.tuitionAndLivingCosts],
    ['Student Visa Requirements', c.visaRequirements],
    ['Scholarships & Financial Aid', c.scholarshipInfo],
  ] as const;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <Helmet>
        <title>Study in {c.name} — Zero Compile</title>
        <meta name="description" content={c.description.slice(0, 155)} />
      </Helmet>

      <Link
        to="/destinations"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All Destinations
      </Link>

      <div className="space-y-5 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Destination Guide
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-950">
              Study in {c.name}
            </h1>
            <p className="text-sm leading-relaxed text-zinc-700">{c.description}</p>
          </div>
          <Link to={`/apply?country=${c.id}`}>
            <Button className="bg-teal-600 text-white hover:bg-teal-700">
              Apply for {c.name} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {c.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-4">
            {c.highlights.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-zinc-950 ring-1 ring-zinc-950/10"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" /> {h}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {sections.map(([title, body]) =>
          body ? (
            <section
              key={title}
              className="space-y-2 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10"
            >
              <h2 className="font-display text-base font-bold text-zinc-950">{title}</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{body}</p>
            </section>
          ) : null
        )}
      </div>

      {c.universities.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-zinc-950">
            Partner Universities in {c.name}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {c.universities.map((u) => (
              <Link
                key={u.id}
                to={`/universities/${u.slug}`}
                onMouseEnter={() => void prefetchUniversity(queryClient, u.slug)}
                onTouchStart={() => void prefetchUniversity(queryClient, u.slug)}
                onFocus={() => void prefetchUniversity(queryClient, u.slug)}
                className="rounded-xl bg-white p-4 ring-1 ring-zinc-950/10 transition-all hover:ring-teal-600/40"
              >
                <div className="font-display font-bold text-zinc-950">{u.name}</div>
                <div className="text-xs text-zinc-600">{u.city}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
