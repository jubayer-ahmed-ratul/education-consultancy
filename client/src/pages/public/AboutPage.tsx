import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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

  if (isLoading) return <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-[#6B7280]">Loading...</div>;
  const about = data?.data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">
      <Helmet>
        <title>{about?.seoTitle || 'About Us'} — Zero Compile</title>
        {about?.seoDescription && <meta name="description" content={about.seoDescription} />}
      </Helmet>

      <div className="border-b border-[#E5E2DC] pb-6 space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706]">Our Consultancy</span>
        <h1 className="font-display text-3xl font-bold text-[#111827]">
          {about?.whoWeAreTitle || 'About Zero Compile'}
        </h1>
        <p className="text-base leading-relaxed text-[#4B5563] whitespace-pre-wrap">{about?.whoWeAreBody}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {about?.establishmentStory && (
          <section className="rounded-lg border border-[#E5E2DC] bg-white p-6 space-y-2">
            <div className="font-mono text-xs font-semibold text-[#D97706]">EST. {about.establishmentYear}</div>
            <h2 className="font-display text-lg font-bold text-[#111827]">Our Founding Story</h2>
            <p className="text-sm leading-relaxed text-[#4B5563]">{about.establishmentStory}</p>
          </section>
        )}

        {about?.companyOverview && (
          <section className="rounded-lg border border-[#E5E2DC] bg-white p-6 space-y-2">
            <div className="font-mono text-xs font-semibold text-[#0D3B2E]">METHODOLOGY</div>
            <h2 className="font-display text-lg font-bold text-[#111827]">Advisory Overview</h2>
            <p className="text-sm leading-relaxed text-[#4B5563]">{about.companyOverview}</p>
          </section>
        )}
      </div>

      {about?.chairmanMessage && (
        <section className="rounded-lg border border-[#E5E2DC] bg-white p-6 sm:p-8 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#D97706]">
            {about.chairmanTitle} — {about.chairmanName}
          </div>
          <p className="text-base italic leading-relaxed text-[#111827]">“{about.chairmanMessage}”</p>
        </section>
      )}

      <div className="rounded-lg border border-[#E5E2DC] bg-[#132A4A] p-7 text-white flex flex-wrap items-center justify-between gap-4">
        <span className="font-display text-lg font-bold">{about?.ctaHeading || 'Ready to Start?'}</span>
        <Link
          to={about?.ctaButtonLink || '/apply'}
          className="inline-flex items-center gap-2 rounded-md bg-[#D97706] px-5 py-2.5 text-xs font-semibold text-white hover:bg-amber-700"
        >
          {about?.ctaButtonText || 'Apply Now'} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
