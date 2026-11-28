import { ArrowRight, Award, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { usePublicBundle } from '../../hooks/usePublicBundle';

export default function SuccessStoriesPage() {
  const { data: bundle, isLoading } = usePublicBundle();
  const settings = bundle?.successStoriesPageSetting;
  const stories = bundle?.successStories ?? [];

  return (
    <div className="mx-auto w-11/12 max-w-[1440px] space-y-10 px-4 py-10 sm:px-6">
      <Helmet>
        <title>{settings?.seoTitle || settings?.heroHeading || 'Success Stories'} â€” StudySphere</title>
        {settings?.seoDescription && <meta name="description" content={settings.seoDescription} />}
      </Helmet>

      <div className="space-y-2 border-b border-zinc-200 pb-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700">
          <Award className="h-3.5 w-3.5" /> Verified Placements
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-950">
          {settings?.heroHeading || 'Student Success Stories'}
        </h1>
        <p className="max-w-2xl text-sm text-zinc-700">{settings?.heroSubtitle}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-zinc-200/70" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((s) => (
            <div
              key={s.id}
              className="flex flex-col justify-between space-y-4 rounded-xl bg-white p-6 ring-1 ring-zinc-950/10"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-zinc-600">
                  <span className="font-semibold text-zinc-950">
                    {s.countryFlag} {s.country}
                  </span>
                  {s.admissionYear && <span className="font-mono">{s.admissionYear}</span>}
                </div>
                <h2 className="font-display text-lg font-bold text-zinc-950">{s.name}</h2>
                <div className="text-xs font-semibold text-teal-700">
                  {s.program} â€” {s.university}
                </div>
                {s.achievement && (
                  <Badge variant="success" className="bg-teal-50 text-teal-700 border-teal-200">
                    {s.achievement}
                  </Badge>
                )}
                <p className="text-sm leading-relaxed text-zinc-700">â€œ{s.testimonial}â€</p>
              </div>
              {s.youtubeUrl && (
                <a
                  href={s.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"
                >
                  Watch Video Testimonial <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {settings && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-zinc-950 p-8 text-white">
          <div className="font-display text-lg font-bold">{settings.ctaHeading}</div>
          <Link to={settings.ctaButtonLink || '/apply'}>
            <Button className="bg-teal-600 text-white hover:bg-teal-500">
              {settings.ctaButtonText || 'Book Free Consultation'} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
