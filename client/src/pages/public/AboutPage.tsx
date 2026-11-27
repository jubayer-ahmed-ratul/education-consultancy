import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { apiRequest } from '../../lib/api-client';

interface AboutPageData {
  whoWeAreTitle: string;
  whoWeAreBody: string;
  establishmentYear: string;
  establishmentStory: string;
  companyOverview: string;
  chairmanName: string;
  chairmanTitle: string;
  chairmanMessage: string;
  ctaHeading: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export default function AboutPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['public-about-page'],
    queryFn: () => apiRequest<AboutPageData | null>('/content/about-page'),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-11/12 space-y-4 px-4 py-10">
        <div className="h-8 w-56 animate-pulse rounded bg-zinc-200/70" />
        <div className="h-44 animate-pulse rounded-xl bg-zinc-200/70" />
      </div>
    );
  }
  const about = data?.data;

  return (
    <div className="mx-auto max-w-11/12 space-y-8 px-4 py-10 sm:px-6">
      <Helmet>
        <title>{about?.seoTitle || 'About Us'} â€” StudySphere</title>
        {about?.seoDescription && <meta name="description" content={about.seoDescription} />}
      </Helmet>

      <div className="space-y-2 border-b border-zinc-200 pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          Our Consultancy
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-950">
          {about?.whoWeAreTitle || 'About StudySphere'}
        </h1>
        <p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-700">
          {about?.whoWeAreBody}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {about?.establishmentStory && (
          <section className="space-y-2 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10">
            <div className="font-mono text-xs font-semibold text-teal-700">
              EST. {about.establishmentYear}
            </div>
            <h2 className="font-display text-lg font-bold text-zinc-950">Our Founding Story</h2>
            <p className="text-sm leading-relaxed text-zinc-700">{about.establishmentStory}</p>
          </section>
        )}

        {about?.companyOverview && (
          <section className="space-y-2 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10">
            <div className="font-mono text-xs font-semibold text-teal-700">METHODOLOGY</div>
            <h2 className="font-display text-lg font-bold text-zinc-950">Advisory Overview</h2>
            <p className="text-sm leading-relaxed text-zinc-700">{about.companyOverview}</p>
          </section>
        )}
      </div>

      {about?.chairmanMessage && (
        <section className="space-y-3 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10 sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            {about.chairmanTitle} â€” {about.chairmanName}
          </div>
          <p className="text-base italic leading-relaxed text-zinc-950">
            â€œ{about.chairmanMessage}â€
          </p>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-zinc-950 p-7 text-white">
        <span className="font-display text-lg font-bold">
          {about?.ctaHeading || 'Ready to Start?'}
        </span>
        <Link to={about?.ctaButtonLink || '/apply'}>
          <Button className="bg-teal-600 text-white hover:bg-teal-500">
            {about?.ctaButtonText || 'Book Free Consultation'} <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
