import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Globe2,
  Search,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AboutPreviewSection } from '../../components/AboutPreviewSection';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { FaqSection } from '../../components/FaqSection';
import { HowItWorksSection } from '../../components/HowItWorksSection';
import { ServicesSection } from '../../components/ServicesSection';
import { SuccessStoriesSection } from '../../components/SuccessStoriesSection';
import { UniversitiesMarqueeSection } from '../../components/UniversitiesMarqueeSection';
import { Button } from '../../components/ui/button';
import { usePublicBundle } from '../../hooks/usePublicBundle';
import { apiRequest } from '../../lib/api-client';
import { prefetchCountriesList, prefetchDestination } from '../../lib/prefetch';
import { queryKeys } from '../../lib/query-keys';

const FALLBACK_DESTINATION_IMAGES = [
  '/hero-landmarks.jpg',
  '/about-primary.jpg',
  '/about-campus.jpg',
  '/about-counseling.jpg',
];

export default function HomePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: bundle, isLoading } = usePublicBundle();
  const [heroSearch, setHeroSearch] = useState('');

  const { data: countriesRes } = useQuery({
    queryKey: queryKeys.countries.publicList({ page: 1, limit: 6 }),
    queryFn: () =>
      apiRequest<Array<{ id: string; name: string; slug: string; description: string; imageUrl: string | null; intakes: string[] }>>(
        '/countries?page=1&limit=6'
      ),
  });

  const { data: universitiesRes } = useQuery({
    queryKey: queryKeys.universities.publicList({ page: 1, limit: 24 }),
    queryFn: () =>
      apiRequest<
        Array<{
          id: string;
          name: string;
          slug: string;
          logoUrl?: string | null;
          city: string | null;
          description: string;
          programs?: string[];
          country?: { name: string; slug?: string };
        }>
      >('/universities?page=1&limit=24'),
  });

  const hero = bundle?.heroContent;
  const about = bundle?.siteContent;
  const stories = bundle?.successStories ?? [];

  function handleHeroSearch(e: FormEvent) {
    e.preventDefault();
    const q = heroSearch.trim();
    navigate(q ? `/universities?search=${encodeURIComponent(q)}` : '/universities');
  }

  const heroBgUrl = hero?.slides?.[0]?.imageUrl || '/hero-landmarks.jpg';

  const statsList =
    bundle?.heroStats && bundle.heroStats.length > 0
      ? bundle.heroStats
      : [
          { order: 1, value: '10,000', suffix: '+', label: 'Programs Listed' },
          { order: 2, value: '500', suffix: '+', label: 'Partner Universities' },
          { order: 3, value: '50', suffix: '+', label: 'Countries Covered' },
          { order: 4, value: '95', suffix: '%', label: 'Student Satisfaction Rate' },
        ];

  return (
    <div className="space-y-20 pb-24">
      <Helmet>
        <title>StudySphere — Global Higher Education Consultancy</title>
        <meta
          name="description"
          content={hero?.description || 'Study abroad admissions, scholarships, and visa guidance.'}
        />
      </Helmet>

      {/* Panoramic Rounded Hero Banner + Centered 4-Stat Strip */}
      <section className="bg-white pt-4 pb-8">
        <div className="mx-auto max-w-11/12 px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-zinc-950 min-h-[440px] sm:min-h-[500px] flex items-center shadow-sm">
            {/* Background Landmark Photo */}
            <img
              src={heroBgUrl}
              alt={hero?.heading || 'Global study destinations'}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Dark Left Gradient Overlay for High-Contrast White Text */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120]/90 via-[#0B1120]/55 to-[#0B1120]/15" />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-2xl space-y-5 px-6 py-14 sm:px-12 lg:px-14"
            >
              {/* Frosted Badge Pill */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 p-1 pr-4 backdrop-blur-md ring-1 ring-white/20">
                <span className="rounded-full bg-teal-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  500+
                </span>
                <span className="text-xs font-medium text-white/95">
                  {hero?.subheading || 'Partner Universities Worldwide'}
                </span>
              </div>

              <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
                {hero?.heading || 'Find Your Perfect University Abroad'}
              </h1>

              <p className="max-w-lg text-sm leading-relaxed text-white/90 sm:text-base">
                {hero?.description ||
                  'Guided by your background, matched to your goals — from shortlisting and scholarships to student visa approval.'}
              </p>

              {/* Signature White Pill Search Bar */}
              <form
                onSubmit={handleHeroSearch}
                className="flex max-w-md items-center rounded-full bg-white p-1.5 shadow-xl"
              >
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search your desired subject..."
                  className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-zinc-950 placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-teal-600 py-1.5 pl-2 pr-4 text-xs font-semibold text-white transition-colors hover:bg-teal-700 cursor-pointer shrink-0"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950 text-white">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <span>Search</span>
                </button>
              </form>
            </motion.div>
          </div>

          {/* Centered 4-Stat Strip Directly Below Hero */}
          <div className="mt-4 rounded-2xl bg-[#EEF2F6] px-6 py-7 sm:px-10">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {statsList.map((stat) => (
                <div key={stat.order} className="text-center">
                  <div className="font-display text-3xl font-extrabold tabular-nums text-zinc-950 sm:text-4xl">
                    <AnimatedNumber value={stat.value} />
                    <span className="text-teal-600">{stat.suffix}</span>
                  </div>
                  <div className="mt-1 text-xs font-medium text-zinc-700">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Us 2-Column Asymmetric Section */}
      <AboutPreviewSection
        siteContent={about}
        galleryItems={bundle?.galleryItems}
        heroStats={bundle?.heroStats}
      />

      {/* Top Destinations — 4 Full-Bleed Image Cards */}
      <section className="mx-auto max-w-11/12 space-y-8 px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700">
              <Globe2 className="h-3.5 w-3.5" /> Global Pathways
            </div>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              Top Destinations
            </h2>
          </div>
          <Link
            to="/countries"
            onMouseEnter={() => void prefetchCountriesList(queryClient)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-700"
          >
            View All Destinations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {countriesRes?.data.slice(0, 4).map((c, idx) => (
            <Link
              key={c.id}
              to={`/countries/${c.slug}`}
              onMouseEnter={() => void prefetchDestination(queryClient, c.slug)}
              onTouchStart={() => void prefetchDestination(queryClient, c.slug)}
              onFocus={() => void prefetchDestination(queryClient, c.slug)}
              className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-zinc-950/10"
            >
              <img
                src={c.imageUrl || FALLBACK_DESTINATION_IMAGES[idx % FALLBACK_DESTINATION_IMAGES.length]}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                <div className="space-y-1.5">
                  {c.intakes.length > 0 && (
                    <span className="inline-block rounded-full bg-teal-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      {c.intakes[0]}
                    </span>
                  )}
                  <h3 className="font-display text-2xl font-bold tracking-tight text-white">
                    {c.name}
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs transition-all group-hover:bg-teal-600">
                  Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 8 Core Study Abroad Services */}
      <ServicesSection />

      {/* Dual-Row Infinite Partner Universities Marquee */}
      <UniversitiesMarqueeSection universities={universitiesRes?.data ?? []} />

      {/* 6-Step Ascending Curved Path — How It Works */}
      <HowItWorksSection />

      {/* 6-Card Center-Focus Peek Carousel — Success Stories */}
      <SuccessStoriesSection stories={stories} />

      {/* Frequently Asked Questions */}
      <FaqSection />

      {/* Conversion Banner */}
      <section className="mx-auto max-w-11/12 px-4 sm:px-6">
        <div className="rounded-2xl bg-zinc-950 p-8 text-white ring-1 ring-zinc-900 sm:p-12">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl space-y-3">
              {about?.yearsBadgeText && (
                <span className="inline-block rounded-md bg-teal-600 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  {about.yearsBadgeText}
                </span>
              )}
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                {about?.heading || 'Ready to Begin Your Study Abroad Journey?'}
              </h2>
              <p className="text-sm leading-relaxed text-zinc-300">
                {about?.highlightTitle ||
                  'Speak with an experienced admissions counselor for university shortlisting, scholarship guidance, and visa planning.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link to={about?.buttonLink || '/apply'}>
                <Button size="lg" className="rounded-full bg-teal-600 text-white hover:bg-teal-500">
                  {about?.buttonText || 'Book Consultation'} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/track">
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full bg-zinc-900 text-white ring-zinc-700 hover:bg-zinc-800"
                >
                  Track Application
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {isLoading && (
        <div className="mx-auto max-w-11/12 px-4 sm:px-6">
          <div className="h-24 animate-pulse rounded-xl bg-zinc-200/70" />
        </div>
      )}
    </div>
  );
}
