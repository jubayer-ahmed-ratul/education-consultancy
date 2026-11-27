import { ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePublicBundle } from '../../hooks/usePublicBundle';

export default function SuccessStoriesPage() {
  const { data: bundle, isLoading } = usePublicBundle();
  const settings = bundle?.successStoriesPageSetting;
  const stories = bundle?.successStories ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-10">
      <Helmet>
        <title>{settings?.seoTitle || settings?.heroHeading || 'Success Stories'} — Zero Compile</title>
        {settings?.seoDescription && <meta name="description" content={settings.seoDescription} />}
      </Helmet>

      <div className="border-b border-[#E5E2DC] pb-6 space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706]">Verified Placements</span>
        <h1 className="font-display text-3xl font-bold text-[#111827]">
          {settings?.heroHeading || 'Student Success Stories'}
        </h1>
        <p className="max-w-2xl text-sm text-[#4B5563]">{settings?.heroSubtitle}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg border border-[#E5E2DC] bg-[#F3F1EC]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((s) => (
            <div key={s.id} className="flex flex-col justify-between rounded-lg border border-[#E5E2DC] bg-white p-6 space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[#6B7280]">
                  <span className="font-medium text-[#111827]">{s.countryFlag} {s.country}</span>
                  {s.admissionYear && <span className="font-mono">{s.admissionYear}</span>}
                </div>
                <h2 className="font-display text-lg font-bold text-[#111827]">{s.name}</h2>
                <div className="text-xs font-semibold text-[#0D3B2E]">{s.program} — {s.university}</div>
                {s.achievement && (
                  <span className="inline-block rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-semibold text-[#B45309]">
                    {s.achievement}
                  </span>
                )}
                <p className="text-sm leading-relaxed text-[#4B5563]">“{s.testimonial}”</p>
              </div>
              {s.youtubeUrl && (
                <a
                  href={s.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D3B2E] hover:underline"
                >
                  Watch Video Testimonial <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {settings && (
        <div className="rounded-lg border border-[#E5E2DC] bg-[#132A4A] p-8 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="font-display text-lg font-bold">{settings.ctaHeading}</div>
          <Link
            to={settings.ctaButtonLink || '/apply'}
            className="inline-flex items-center gap-2 rounded-md bg-[#D97706] px-5 py-2.5 text-xs font-semibold text-white hover:bg-amber-700"
          >
            {settings.ctaButtonText || 'Apply Today'} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
