import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  Globe2,
  GraduationCap,
  PlaneTakeoff,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { usePublicBundle } from '../../hooks/usePublicBundle';
import { apiRequest } from '../../lib/api-client';
import { prefetchBlog, prefetchDestination, prefetchEvent, prefetchUniversity } from '../../lib/prefetch';
import { queryKeys } from '../../lib/query-keys';

const ADMISSION_STEPS = [
  {
    step: '01',
    title: 'Profile Evaluation',
    description: 'Assess your academic background, test scores, and budget with a senior advisor.',
    icon: UserCheck,
  },
  {
    step: '02',
    title: 'University Shortlisting',
    description: 'Receive a curated list of accredited universities matched to your career goals.',
    icon: GraduationCap,
  },
  {
    step: '03',
    title: 'Applications & Scholarships',
    description: 'Submit error-free applications, SOP reviews, and merit scholarship nominations.',
    icon: FileCheck2,
  },
  {
    step: '04',
    title: 'Visa & Departure',
    description: 'Complete financial documentation, mock visa interviews, and pre-departure briefing.',
    icon: PlaneTakeoff,
  },
];

export default function HomePage() {
  const queryClient = useQueryClient();
  const { data: bundle, isLoading } = usePublicBundle();
  const [selectedUniCountry, setSelectedUniCountry] = useState<string>('all');

  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: false });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const { data: countriesRes } = useQuery({
    queryKey: queryKeys.countries.publicList({ page: 1, limit: 6 }),
    queryFn: () =>
      apiRequest<Array<{ id: string; name: string; slug: string; description: string; imageUrl: string | null; intakes: string[] }>>(
        '/countries?page=1&limit=6'
      ),
  });

  const { data: universitiesRes } = useQuery({
    queryKey: queryKeys.universities.publicList({ page: 1, limit: 9 }),
    queryFn: () =>
      apiRequest<
        Array<{
          id: string;
          name: string;
          slug: string;
          city: string | null;
          description: string;
          programs?: string[];
          country?: { name: string; slug?: string };
        }>
      >('/universities?page=1&limit=9'),
  });

  const { data: blogsRes } = useQuery({
    queryKey: ['public-blogs', 1],
    queryFn: () =>
      apiRequest<Array<{ id: string; title: string; slug: string; excerpt: string; category: string; author: string }>>(
        '/blogs?page=1&limit=3'
      ),
  });

  const { data: eventsRes } = useQuery({
    queryKey: ['public-events', 'upcoming'],
    queryFn: () =>
      apiRequest<Array<{ id: string; title: string; slug: string; shortDescription: string; eventDate: string; venue: string }>>(
        '/events?filter=upcoming'
      ),
  });

  const hero = bundle?.heroContent;
  const about = bundle?.siteContent;
  const stories = bundle?.successStories ?? [];

  const uniCountries = useMemo(() => {
    const names = new Set<string>();
    universitiesRes?.data.forEach((u) => {
      if (u.country?.name) names.add(u.country.name);
    });
    return Array.from(names);
  }, [universitiesRes?.data]);

  const filteredUniversities = useMemo(() => {
    const list = universitiesRes?.data ?? [];
    if (selectedUniCountry === 'all') return list.slice(0, 6);
    return list.filter((u) => u.country?.name === selectedUniCountry).slice(0, 6);
  }, [universitiesRes?.data, selectedUniCountry]);

  return (
    <div className="space-y-20 pb-24">
      <Helmet>
        <title>Zero Compile — Global Higher Education Consultancy</title>
        <meta
          name="description"
          content={hero?.description || 'Study abroad admissions, scholarships, and visa guidance.'}
        />
      </Helmet>

      {/* Split Hero Section */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6 lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700 ring-1 ring-inset ring-teal-200">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                {hero?.subheading || 'Zero Compile Overseas Consultancy'}
              </div>

              <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-zinc-950 sm:text-5xl lg:text-[3.25rem]">
                {hero?.heading || 'Precision Guidance for Global Higher Education'}
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-zinc-700 sm:text-lg">
                {hero?.description ||
                  'From university shortlisting and scholarship strategy to visa filing, we guide ambitious students into leading institutions worldwide.'}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/apply">
                  <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700">
                    Book Free Consultation <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/track">
                  <Button variant="secondary" size="lg" className="text-zinc-950 ring-zinc-300">
                    Track Application
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-medium text-zinc-700">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" /> Verified Offer & Visa Support
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-teal-600" /> Live ZRC-YYYY-XXX Case Tracking
                </span>
              </div>
            </motion.div>

            {/* Right-Side Hero Visual / Snapshot */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5"
            >
              {hero?.slides?.[0]?.imageUrl ? (
                <div className="overflow-hidden rounded-2xl bg-[#F8FAFC] ring-1 ring-zinc-950/10 shadow-sm">
                  <img
                    src={hero.slides[0].imageUrl}
                    alt={hero.slides[0].title || hero.heading || 'Global Higher Education'}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-2xl bg-[#F8FAFC] p-6 ring-1 ring-zinc-950/10 space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                        Admissions Desk
                      </div>
                      <div className="mt-0.5 font-display text-lg font-bold text-zinc-950">
                        2026 / 2027 Intakes Open
                      </div>
                    </div>
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
                      Live
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-4 ring-1 ring-zinc-950/10">
                      <div className="text-xs font-medium text-zinc-600">Destinations</div>
                      <div className="mt-1 text-2xl font-extrabold tabular-nums text-zinc-950">
                        {countriesRes?.data.length ? `${countriesRes.data.length}+` : '10+'}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white p-4 ring-1 ring-zinc-950/10">
                      <div className="text-xs font-medium text-zinc-600">Partner Campuses</div>
                      <div className="mt-1 text-2xl font-extrabold tabular-nums text-zinc-950">
                        {universitiesRes?.data.length ? `${universitiesRes.data.length}+` : '50+'}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-4 ring-1 ring-zinc-950/10 space-y-2">
                    <div className="text-xs font-semibold text-zinc-950">Included in Free Consultation</div>
                    <ul className="space-y-1.5 text-xs text-zinc-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                        Personalized country & university shortlist
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                        Scholarship & tuition budget assessment
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                        Instant reference ID for live status tracking
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Trust Stats Bar */}
      {bundle?.heroStats && bundle.heroStats.length > 0 && (
        <section className="mx-auto -mt-12 max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {bundle.heroStats.map((stat) => (
              <div
                key={stat.order}
                className="rounded-xl bg-white p-5 ring-1 ring-zinc-950/10 shadow-xs transition-colors hover:ring-teal-600/30"
              >
                <div className="font-mono text-2xl font-extrabold tabular-nums text-zinc-950 sm:text-3xl">
                  {stat.value}
                  <span className="text-teal-600">{stat.suffix}</span>
                </div>
                <div className="mt-1 text-xs font-medium text-zinc-700">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top Study Destinations */}
      <section className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700">
              <Globe2 className="h-3.5 w-3.5" /> Global Pathways
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
              Top Study Destinations
            </h2>
          </div>
          <Link
            to="/destinations"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            Explore All Destinations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {countriesRes?.data.map((c) => (
            <Link
              key={c.id}
              to={`/destinations/${c.slug}`}
              onMouseEnter={() => void prefetchDestination(queryClient, c.slug)}
              onTouchStart={() => void prefetchDestination(queryClient, c.slug)}
              onFocus={() => void prefetchDestination(queryClient, c.slug)}
              className="group flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-zinc-950/10 transition-all hover:ring-teal-600/40 hover:shadow-sm"
            >
              {c.imageUrl && (
                <div className="aspect-[16/10] w-full overflow-hidden bg-zinc-100">
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
                <div>
                  <h3 className="font-display text-lg font-bold text-zinc-950 group-hover:text-teal-700">
                    {c.name}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-700 line-clamp-2">{c.description}</p>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-xs">
                  <span className="font-medium text-zinc-600">
                    {c.intakes.length > 0 ? `Intakes: ${c.intakes.slice(0, 2).join(' • ')}` : 'Multiple intakes'}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-teal-700">
                    Guide <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Universities (Filterable Grid) */}
      <section className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700">
              <GraduationCap className="h-3.5 w-3.5" /> Accredited Institutions
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
              Featured Universities
            </h2>
          </div>
          <Link
            to="/universities"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            View Full Directory <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {uniCountries.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedUniCountry('all')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                selectedUniCountry === 'all'
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-zinc-700 ring-1 ring-zinc-950/10 hover:text-zinc-950'
              }`}
            >
              All Countries
            </button>
            {uniCountries.map((countryName) => (
              <button
                key={countryName}
                type="button"
                onClick={() => setSelectedUniCountry(countryName)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  selectedUniCountry === countryName
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-zinc-700 ring-1 ring-zinc-950/10 hover:text-zinc-950'
                }`}
              >
                {countryName}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUniversities.map((u) => (
            <Link
              key={u.id}
              to={`/universities/${u.slug}`}
              onMouseEnter={() => void prefetchUniversity(queryClient, u.slug)}
              onTouchStart={() => void prefetchUniversity(queryClient, u.slug)}
              onFocus={() => void prefetchUniversity(queryClient, u.slug)}
              className="group flex flex-col justify-between space-y-3 rounded-xl bg-white p-5 ring-1 ring-zinc-950/10 transition-all hover:ring-teal-600/40 hover:shadow-sm"
            >
              <div className="space-y-2">
                <div className="text-xs font-semibold text-teal-700">
                  {[u.city, u.country?.name].filter(Boolean).join(', ')}
                </div>
                <h3 className="font-display text-base font-bold text-zinc-950 group-hover:text-teal-700">
                  {u.name}
                </h3>
                <p className="text-xs leading-relaxed text-zinc-700 line-clamp-2">{u.description}</p>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-xs">
                <span className="font-medium text-zinc-600">
                  {u.programs?.length ? `${u.programs.length} Programs` : 'View Details'}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-teal-700">
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works — 4-Step Admission Process */}
      <section className="border-y border-zinc-200 bg-white py-16">
        <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              How It Works
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
              4 Steps From Consultation to Campus
            </h2>
            <p className="text-sm text-zinc-700">
              A structured, transparent admissions workflow backed by real-time status tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ADMISSION_STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="rounded-xl bg-[#F8FAFC] p-6 ring-1 ring-zinc-950/10 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-200">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-xs font-bold text-zinc-500">{item.step}</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-zinc-950">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-zinc-700">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Success Stories Carousel (Embla) */}
      {stories.length > 0 && (
        <section className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700">
                <Award className="h-3.5 w-3.5" /> Alumni Outcomes
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                Student Success Stories
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={scrollPrev}
                aria-label="Previous story"
              >
                <ChevronLeft className="h-4 w-4 text-zinc-950" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={scrollNext}
                aria-label="Next story"
              >
                <ChevronRight className="h-4 w-4 text-zinc-950" />
              </Button>
              <Link
                to="/success-stories"
                className="ml-2 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800"
              >
                All Stories <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex gap-5">
              {stories.map((s) => (
                <div
                  key={s.id}
                  className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_48%] lg:flex-[0_0_32%] rounded-xl bg-white p-6 ring-1 ring-zinc-950/10 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-600">
                    <span className="font-semibold text-zinc-950">
                      {s.countryFlag} {s.country}
                    </span>
                    {s.admissionYear && <span className="font-mono">{s.admissionYear}</span>}
                  </div>
                  <div className="font-display text-base font-bold text-zinc-950">{s.name}</div>
                  <div className="text-xs font-semibold text-teal-700">
                    {s.program} — {s.university}
                  </div>
                  {s.achievement && (
                    <Badge variant="success" className="bg-teal-50 text-teal-700 border-teal-200">
                      {s.achievement}
                    </Badge>
                  )}
                  <p className="text-xs leading-relaxed text-zinc-700 line-clamp-4">“{s.testimonial}”</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Blogs & Upcoming Events */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-zinc-950">
              <BookOpen className="h-4.5 w-4.5 text-teal-600" /> Study Guides & Blogs
            </h2>
            <Link to="/blogs" className="text-xs font-semibold text-teal-700 hover:underline">
              All Blogs
            </Link>
          </div>
          <div className="space-y-3">
            {blogsRes?.data.map((b) => (
              <Link
                key={b.id}
                to={`/blogs/${b.slug}`}
                onMouseEnter={() => void prefetchBlog(queryClient, b.slug)}
                onTouchStart={() => void prefetchBlog(queryClient, b.slug)}
                onFocus={() => void prefetchBlog(queryClient, b.slug)}
                className="block rounded-xl bg-white p-4 ring-1 ring-zinc-950/10 transition-all hover:ring-teal-600/40"
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-700">
                  {b.category}
                </div>
                <div className="mt-1 font-display font-bold text-zinc-950">{b.title}</div>
                <p className="mt-1 text-xs text-zinc-700 line-clamp-2">{b.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-zinc-950">
              <Calendar className="h-4.5 w-4.5 text-teal-600" /> Upcoming Events
            </h2>
            <Link to="/events" className="text-xs font-semibold text-teal-700 hover:underline">
              All Events
            </Link>
          </div>
          <div className="space-y-3">
            {eventsRes?.data.slice(0, 3).map((ev) => (
              <Link
                key={ev.id}
                to={`/events/${ev.slug}`}
                onMouseEnter={() => void prefetchEvent(queryClient, ev.slug)}
                onTouchStart={() => void prefetchEvent(queryClient, ev.slug)}
                onFocus={() => void prefetchEvent(queryClient, ev.slug)}
                className="block rounded-xl bg-white p-4 ring-1 ring-zinc-950/10 transition-all hover:ring-teal-600/40"
              >
                <div className="font-mono text-[11px] font-semibold text-teal-700">
                  {new Date(ev.eventDate).toLocaleDateString()} • {ev.venue}
                </div>
                <div className="mt-1 font-display font-bold text-zinc-950">{ev.title}</div>
                <p className="mt-1 text-xs text-zinc-700 line-clamp-2">{ev.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
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
                <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-500">
                  {about?.buttonText || 'Book Free Consultation'} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/track">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-zinc-900 text-white ring-zinc-700 hover:bg-zinc-800"
                >
                  Track Application
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {isLoading && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="h-24 animate-pulse rounded-xl bg-zinc-200/70" />
        </div>
      )}
    </div>
  );
}
