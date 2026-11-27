import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../../lib/api-client';

interface UniversityDetail {
  id: string;
  name: string;
  slug: string;
  countryId: string;
  city: string | null;
  description: string;
  programs: string[];
  admissionRequirements: string | null;
  englishRequirements: string | null;
  scholarshipDetails: string | null;
  applicationDeadlines: string | null;
  website: string | null;
  tuitionRange: { min: number; max: number; currency: string } | null;
  country: { id: string; name: string; slug: string };
}

export default function UniversityDetailPage() {
  const { slug = '' } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-university', slug],
    queryFn: () => apiRequest<UniversityDetail>(`/universities/${slug}`),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-4">
        <div className="h-8 w-56 animate-pulse rounded bg-[#F3F1EC]" />
        <div className="h-44 animate-pulse rounded-lg bg-[#F3F1EC]" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center space-y-3">
        <p className="text-sm text-rose-700">University not found.</p>
        <Link to="/universities" className="text-sm font-medium text-[#0D3B2E] underline">
          Back to Universities
        </Link>
      </div>
    );
  }

  const u = data.data;
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">
      <Helmet>
        <title>{u.name} — Zero Compile</title>
        <meta name="description" content={u.description.slice(0, 155)} />
      </Helmet>

      <Link to="/universities" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4B5563] hover:text-[#111827]">
        <ArrowLeft className="h-3.5 w-3.5" /> All Universities
      </Link>

      <div className="rounded-lg border border-[#E5E2DC] bg-white p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#D97706]">
              {[u.city, u.country.name].filter(Boolean).join(', ')}
            </div>
            <h1 className="font-display text-3xl font-bold text-[#111827]">{u.name}</h1>
          </div>
          <Link
            to={`/apply?country=${u.countryId}&university=${u.id}`}
            className="inline-flex items-center gap-2 rounded-md bg-[#0D3B2E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#092A20]"
          >
            Apply to {u.name} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="text-sm leading-relaxed text-[#4B5563]">{u.description}</p>

        {u.tuitionRange && (
          <div className="rounded-md border border-[#E5E2DC] bg-[#FAF9F6] p-4 text-sm">
            <span className="font-semibold text-[#111827]">Estimated Tuition:</span>{' '}
            <span className="font-mono font-semibold text-[#0D3B2E]">
              {u.tuitionRange.currency} {u.tuitionRange.min.toLocaleString()} – {u.tuitionRange.max.toLocaleString()} / year
            </span>
          </div>
        )}
      </div>

      {u.programs.length > 0 && (
        <section className="rounded-lg border border-[#E5E2DC] bg-white p-6 space-y-3">
          <h2 className="font-display text-base font-bold text-[#111827]">Programs Offered</h2>
          <div className="flex flex-wrap gap-2">
            {u.programs.map((p) => (
              <span key={p} className="rounded-md border border-[#E5E2DC] bg-[#FAF9F6] px-3 py-1 text-xs font-medium text-[#111827]">
                {p}
              </span>
            ))}
          </div>
        </section>
      )}

      {u.englishRequirements && (
        <section className="rounded-lg border border-[#E5E2DC] bg-white p-6 space-y-2">
          <h2 className="font-display text-base font-bold text-[#111827]">English Proficiency</h2>
          <p className="text-sm text-[#4B5563]">{u.englishRequirements}</p>
        </section>
      )}

      {u.website && (
        <a
          href={u.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D3B2E] hover:underline"
        >
          Official University Website <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}
