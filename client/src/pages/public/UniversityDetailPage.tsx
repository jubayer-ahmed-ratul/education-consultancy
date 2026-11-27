import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Award, Calendar, ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
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
      <div className="mx-auto max-w-11/12 space-y-4 px-4 py-10">
        <div className="h-8 w-56 animate-pulse rounded bg-zinc-200/70" />
        <div className="h-44 animate-pulse rounded-xl bg-zinc-200/70" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="mx-auto max-w-11/12 space-y-3 px-4 py-12 text-center">
        <p className="text-sm font-medium text-rose-700">University not found.</p>
        <Link to="/universities" className="text-sm font-semibold text-teal-700 underline">
          Back to Universities
        </Link>
      </div>
    );
  }

  const u = data.data;
  return (
    <div className="mx-auto max-w-11/12 space-y-8 px-4 py-10 sm:px-6">
      <Helmet>
        <title>{u.name} — Zero Compile</title>
        <meta name="description" content={u.description.slice(0, 155)} />
      </Helmet>

      <Link
        to="/universities"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All Universities
      </Link>

      <div className="space-y-5 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              {[u.city, u.country.name].filter(Boolean).join(', ')}
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-950">
              {u.name}
            </h1>
          </div>
          <Link to={`/apply?country=${u.countryId}&university=${u.id}`}>
            <Button className="bg-teal-600 text-white hover:bg-teal-700">
              Apply to {u.name} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <p className="text-sm leading-relaxed text-zinc-700">{u.description}</p>

        {u.tuitionRange && (
          <div className="rounded-lg bg-[#F8FAFC] p-4 text-sm ring-1 ring-zinc-950/10">
            <span className="font-semibold text-zinc-950">Estimated Tuition:</span>{' '}
            <span className="font-mono font-bold text-teal-700">
              {u.tuitionRange.currency} {u.tuitionRange.min.toLocaleString()} –{' '}
              {u.tuitionRange.max.toLocaleString()} / year
            </span>
          </div>
        )}
      </div>

      {u.programs.length > 0 && (
        <section className="space-y-3 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10">
          <h2 className="font-display text-base font-bold text-zinc-950">Programs Offered</h2>
          <div className="flex flex-wrap gap-2">
            {u.programs.map((p) => (
              <span
                key={p}
                className="rounded-lg bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-zinc-950 ring-1 ring-zinc-950/10"
              >
                {p}
              </span>
            ))}
          </div>
        </section>
      )}

      {u.admissionRequirements && (
        <section className="space-y-2 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10">
          <h2 className="font-display text-base font-bold text-zinc-950">Admission Requirements</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
            {u.admissionRequirements}
          </p>
        </section>
      )}

      {u.englishRequirements && (
        <section className="space-y-2 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10">
          <h2 className="font-display text-base font-bold text-zinc-950">English Proficiency</h2>
          <p className="text-sm leading-relaxed text-zinc-700">{u.englishRequirements}</p>
        </section>
      )}

      {(u.scholarshipDetails || u.applicationDeadlines) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {u.scholarshipDetails && (
            <section className="space-y-2 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-zinc-950">
                <Award className="h-4 w-4 text-teal-600" /> Scholarships
              </h2>
              <p className="text-sm leading-relaxed text-zinc-700">{u.scholarshipDetails}</p>
            </section>
          )}
          {u.applicationDeadlines && (
            <section className="space-y-2 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-zinc-950">
                <Calendar className="h-4 w-4 text-teal-600" /> Application Deadlines
              </h2>
              <p className="text-sm leading-relaxed text-zinc-700">{u.applicationDeadlines}</p>
            </section>
          )}
        </div>
      )}

      {u.website && (
        <a
          href={u.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:underline"
        >
          Official University Website <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}
