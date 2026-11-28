import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Award, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PublicBundleData } from '../hooks/usePublicBundle';
import { prefetchAboutPage } from '../lib/prefetch';

interface AboutPreviewSectionProps {
  siteContent?: PublicBundleData['siteContent'];
  galleryItems?: PublicBundleData['galleryItems'];
  heroStats?: PublicBundleData['heroStats'];
}

const VALUE_HIGHLIGHTS = [
  'Direct University Partnerships Across 50+ Countries',
  'Zero-Hidden-Fee Transparent Counseling & Scholarship Strategy',
  'End-to-End Student Visa & Pre-Departure Support',
];

export function AboutPreviewSection({
  siteContent,
  galleryItems = [],
  heroStats = [],
}: AboutPreviewSectionProps) {
  const queryClient = useQueryClient();

  const primaryImage = siteContent?.mainImageUrl || '/about-primary.jpg';
  const secondaryTopImage = galleryItems[0]?.imageUrl || '/about-counseling.jpg';
  const secondaryBottomImage = galleryItems[1]?.imageUrl || '/about-campus.jpg';

  const yearsBadge = siteContent?.yearsBadgeText || '10+ Years';
  const visaStat =
    heroStats.find((s) => s.label.toLowerCase().includes('visa')) ??
    heroStats.find((s) => s.suffix === '%');
  const visaMetric = visaStat ? `${visaStat.value}${visaStat.suffix ?? ''}` : '98%';
  const visaLabel = visaStat?.label || 'Visa Success Rate';

  const heading =
    siteContent?.heading || 'Guiding Ambitions from Local Classrooms to Global Campuses';
  const paragraphs =
    siteContent?.bodyParagraphs && siteContent.bodyParagraphs.length > 0
      ? siteContent.bodyParagraphs.slice(0, 2)
      : [
          'StudySphere is a student-first international education consultancy built around structured academic evaluation, verified institutional partnerships, and transparent admissions guidance.',
          'From shortlisting accredited universities and maximizing merit scholarships to preparing compliant visa files, our senior advisors guide every applicant step-by-step.',
        ];
  const ctaText = siteContent?.buttonText || 'More About Us';
  const ctaLink = siteContent?.buttonLink || '/about';

  return (
    <section className="bg-white py-16 sm:py-20 border-y border-zinc-200/80">
      <div className="mx-auto w-11/12 max-w-[1440px] ">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Staggered 3-Image Collage + Bottom Trust & Milestone Badge Bar */}
          <div className="space-y-4 lg:col-span-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Tall Primary Image spanning 2 rows */}
              <div className="row-span-2 overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-950/10">
                <img
                  src={primaryImage}
                  alt="StudySphere student on university campus"
                  loading="lazy"
                  className="h-full min-h-[280px] w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                />
              </div>

              {/* Top Right Image */}
              <div className="overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-950/10">
                <img
                  src={secondaryTopImage}
                  alt={galleryItems[0]?.title || 'One-on-one admissions counseling'}
                  loading="lazy"
                  className="aspect-[4/3] h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                />
              </div>

              {/* Bottom Right Image */}
              <div className="overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-950/10">
                <img
                  src={secondaryBottomImage}
                  alt={galleryItems[1]?.title || 'International students on campus'}
                  loading="lazy"
                  className="aspect-[4/3] h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                />
              </div>
            </div>

            {/* Trust & Milestone Badge Bar anchored cleanly below the collage */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 ring-1 ring-zinc-950/10 shadow-sm">
              <div className="flex items-center gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
                  <Award className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-display text-lg font-extrabold tabular-nums text-zinc-950">
                    {yearsBadge}
                  </div>
                  <div className="text-xs font-medium text-zinc-700">of Global Guidance</div>
                </div>
              </div>

              <div className="hidden h-8 w-px bg-zinc-200 sm:block" />

              <div className="flex items-center gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-display text-lg font-extrabold tabular-nums text-zinc-950">
                    {visaMetric}
                  </div>
                  <div className="text-xs font-medium text-zinc-700">{visaLabel}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Contrast Copy, Value Highlights, and CTA */}
          <div className="space-y-6 lg:col-span-6">
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full bg-teal-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700 ring-1 ring-inset ring-teal-200">
                About StudySphere
              </span>

              <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                {heading}
              </h2>

              {siteContent?.highlightTitle && (
                <p className="text-sm font-semibold text-teal-700">{siteContent.highlightTitle}</p>
              )}
            </div>

            <div className="space-y-4 text-base leading-relaxed text-zinc-800">
              {paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            <ul className="space-y-3 pt-1">
              {VALUE_HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-semibold text-zinc-950">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <Link
                to={ctaLink}
                onMouseEnter={() => void prefetchAboutPage(queryClient)}
                onTouchStart={() => void prefetchAboutPage(queryClient)}
                onFocus={() => void prefetchAboutPage(queryClient)}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
              >
                <span>{ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
