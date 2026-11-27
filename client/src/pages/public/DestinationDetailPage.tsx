import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../../lib/api-client';

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
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-country', slug],
    queryFn: () => apiRequest<CountryDetail>(`/countries/${slug}`),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-[#F3F1EC]" />
        <div className="h-40 animate-pulse rounded-lg bg-[#F3F1EC]" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center space-y-3">
        <p className="text-sm text-rose-700">Destination not found.</p>
        <Link to="/destinations" className="text-sm font-medium text-[#0D3B2E] underline">
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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">
      <Helmet>
        <title>Study in {c.name} — Zero Compile</title>
        <meta name="description" content={c.description.slice(0, 155)} />
      </Helmet>

      <Link to="/destinations" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4B5563] hover:text-[#111827]">
        <ArrowLeft className="h-3.5 w-3.5" /> All Destinations
      </Link>

      <div className="rounded-lg border border-[#E5E2DC] bg-white p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706]">Destination Guide</span>
            <h1 className="font-display text-3xl font-bold text-[#111827]">Study in {c.name}</h1>
            <p className="text-sm leading-relaxed text-[#4B5563]">{c.description}</p>
          </div>
          <Link
            to={`/apply?country=${c.id}`}
            className="inline-flex items-center gap-2 rounded-md bg-[#0D3B2E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#092A20]"
          >
            Apply for {c.name} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {c.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E5E2DC]">
            {c.highlights.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E2DC] bg-[#FAF9F6] px-3 py-1 text-xs font-medium text-[#111827]"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-[#0D3B2E]" /> {h}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {sections.map(([title, body]) =>
          body ? (
            <section key={title} className="rounded-lg border border-[#E5E2DC] bg-white p-6 space-y-2">
              <h2 className="font-display text-base font-bold text-[#111827]">{title}</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#4B5563]">{body}</p>
            </section>
          ) : null
        )}
      </div>

      {c.universities.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-[#111827]">Partner Universities in {c.name}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {c.universities.map((u) => (
              <Link
                key={u.id}
                to={`/universities/${u.slug}`}
                className="rounded-lg border border-[#E5E2DC] bg-white p-4 transition-colors hover:border-[#CFCAC0]"
              >
                <div className="font-display font-semibold text-[#111827]">{u.name}</div>
                <div className="text-xs text-[#6B7280]">{u.city}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
