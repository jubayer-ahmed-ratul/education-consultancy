import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Calendar, GraduationCap, Globe2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePublicBundle } from '../../hooks/usePublicBundle';
import { apiRequest } from '../../lib/api-client';
import { prefetchBlog, prefetchDestination, prefetchEvent, prefetchUniversity } from '../../lib/prefetch';
import { queryKeys } from '../../lib/query-keys';

export default function HomePage() {
  const queryClient = useQueryClient();
  const { data: bundle, isLoading } = usePublicBundle();

  const { data: countriesRes } = useQuery({
    queryKey: queryKeys.countries.publicList({ page: 1, limit: 6 }),
    queryFn: () =>
      apiRequest<Array<{ id: string; name: string; slug: string; description: string; imageUrl: string | null; intakes: string[] }>>(
        '/countries?page=1&limit=6'
      ),
  });

  const { data: universitiesRes } = useQuery({
    queryKey: queryKeys.universities.publicList({ page: 1, limit: 6 }),
    queryFn: () =>
      apiRequest<Array<{ id: string; name: string; slug: string; city: string | null; description: string; country?: { name: string } }>>(
        '/universities?page=1&limit=6'
      ),
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

  return (
    <div className="space-y-16 pb-20">
      <Helmet>
        <title>Zero Compile — Global Higher Education Consultancy</title>
        <meta
          name="description"
          content={hero?.description || 'Study abroad admissions, scholarships, and visa guidance.'}
        />
      </Helmet>

      {/* Editorial Hero Section */}
      <section className="border-b border-[#E5E2DC] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E2DC] bg-[#FAF9F6] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#0D3B2E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
              {hero?.subheading || 'Zero Compile Overseas Consultancy'}
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.1] text-[#111827] sm:text-5xl">
              {hero?.heading || 'Precision Guidance for Global Higher Education'}
            </h1>

            <p className="text-base leading-relaxed text-[#4B5563] sm:text-lg">
              {hero?.description ||
                'From university shortlisting and scholarship strategy to visa filing, we guide ambitious students into leading institutions worldwide.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 rounded-md bg-[#0D3B2E] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#092A20]"
              >
                Start Your Application <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/track"
                className="inline-flex items-center gap-2 rounded-md border border-[#CFCAC0] bg-white px-5 py-3 text-sm font-medium text-[#111827] transition-colors hover:bg-[#F3F1EC]"
              >
                Track Existing Case
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Elevated 4-Stat Strip */}
      {bundle?.heroStats && bundle.heroStats.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 -mt-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {bundle.heroStats.map((stat) => (
              <div
                key={stat.order}
                className="rounded-lg border border-[#E5E2DC] bg-white p-5 transition-colors hover:border-[#CFCAC0]"
              >
                <div className="font-mono text-2xl font-bold text-[#0D3B2E] sm:text-3xl">
                  {stat.value}
                  <span className="text-[#D97706]">{stat.suffix}</span>
                </div>
                <div className="mt-1 text-xs font-medium text-[#4B5563]">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Study Destinations */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
        <div className="flex items-end justify-between gap-4 border-b border-[#E5E2DC] pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D97706]">
              <Globe2 className="h-3.5 w-3.5" /> Global Pathways
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-[#111827]">Study Destinations</h2>
          </div>
          <Link to="/destinations" className="inline-flex items-center gap-1 text-sm font-semibold text-[#0D3B2E] hover:underline">
            Explore All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {countriesRes?.data.map((c) => (
            <Link
              key={c.id}
              to={`/destinations/${c.slug}`}
              onMouseEnter={() => void prefetchDestination(queryClient, c.slug)}
              onTouchStart={() => void prefetchDestination(queryClient, c.slug)}
              onFocus={() => void prefetchDestination(queryClient, c.slug)}
              className="group flex flex-col rounded-lg border border-[#E5E2DC] bg-white overflow-hidden transition-all hover:border-[#CFCAC0] hover:shadow-sm"
            >
              {c.imageUrl && (
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#F3F1EC]">
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#111827] group-hover:text-[#0D3B2E]">
                    {c.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-[#4B5563] line-clamp-2">{c.description}</p>
                </div>
                {c.intakes.length > 0 && (
                  <div className="pt-2 border-t border-[#E5E2DC] text-xs font-medium text-[#6B7280]">
                    Intakes: {c.intakes.slice(0, 2).join(' • ')}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Partner Universities */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
        <div className="flex items-end justify-between gap-4 border-b border-[#E5E2DC] pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D97706]">
              <GraduationCap className="h-3.5 w-3.5" /> Accredited Institutions
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-[#111827]">Partner Universities</h2>
          </div>
          <Link to="/universities" className="inline-flex items-center gap-1 text-sm font-semibold text-[#0D3B2E] hover:underline">
            View Directory <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {universitiesRes?.data.map((u) => (
            <Link
              key={u.id}
              to={`/universities/${u.slug}`}
              onMouseEnter={() => void prefetchUniversity(queryClient, u.slug)}
              onTouchStart={() => void prefetchUniversity(queryClient, u.slug)}
              onFocus={() => void prefetchUniversity(queryClient, u.slug)}
              className="group rounded-lg border border-[#E5E2DC] bg-white p-5 transition-all hover:border-[#CFCAC0] hover:shadow-sm space-y-2"
            >
              <div className="text-xs font-medium text-[#0D3B2E]">
                {[u.city, u.country?.name].filter(Boolean).join(', ')}
              </div>
              <h3 className="font-display text-base font-bold text-[#111827] group-hover:text-[#0D3B2E]">
                {u.name}
              </h3>
              <p className="text-xs leading-relaxed text-[#4B5563] line-clamp-2">{u.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* About Story Block */}
      {about && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-lg border border-[#E5E2DC] bg-[#132A4A] p-8 text-white sm:p-10">
            <div className="max-w-3xl space-y-4">
              <span className="inline-block rounded bg-[#D97706] px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                {about.yearsBadgeText}
              </span>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">{about.heading}</h2>
              {about.highlightTitle && (
                <p className="text-base font-medium text-amber-300">{about.highlightTitle}</p>
              )}
              <div className="space-y-2 text-sm leading-relaxed text-slate-200">
                {about.bodyParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div className="pt-2">
                <Link
                  to={about.buttonLink || '/about'}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-semibold text-[#132A4A] hover:bg-slate-100"
                >
                  {about.buttonText || 'Learn More'} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Student Success Stories Preview */}
      {stories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
          <div className="flex items-end justify-between gap-4 border-b border-[#E5E2DC] pb-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D97706]">
                <Award className="h-3.5 w-3.5" /> Alumni Outcomes
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-[#111827]">Student Success Stories</h2>
            </div>
            <Link to="/success-stories" className="inline-flex items-center gap-1 text-sm font-semibold text-[#0D3B2E] hover:underline">
              All Stories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stories.slice(0, 3).map((s) => (
              <div key={s.id} className="rounded-lg border border-[#E5E2DC] bg-white p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#6B7280]">
                  <span>{s.countryFlag} {s.country}</span>
                  {s.admissionYear && <span className="font-mono">{s.admissionYear}</span>}
                </div>
                <div className="font-display font-bold text-[#111827]">{s.name}</div>
                <div className="text-xs font-medium text-[#0D3B2E]">{s.program} — {s.university}</div>
                <p className="text-xs leading-relaxed text-[#4B5563] line-clamp-3">“{s.testimonial}”</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Latest Blogs & Upcoming Events */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E2DC] pb-3">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-[#111827]">
              <BookOpen className="h-4 w-4 text-[#0D3B2E]" /> Study Guides
            </h2>
            <Link to="/blogs" className="text-xs font-semibold text-[#0D3B2E] hover:underline">All Blogs</Link>
          </div>
          <div className="space-y-3">
            {blogsRes?.data.map((b) => (
              <Link
                key={b.id}
                to={`/blogs/${b.slug}`}
                onMouseEnter={() => void prefetchBlog(queryClient, b.slug)}
                onTouchStart={() => void prefetchBlog(queryClient, b.slug)}
                onFocus={() => void prefetchBlog(queryClient, b.slug)}
                className="block rounded-lg border border-[#E5E2DC] bg-white p-4 transition-colors hover:border-[#CFCAC0]"
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#D97706]">{b.category}</div>
                <div className="mt-1 font-display font-semibold text-[#111827]">{b.title}</div>
                <p className="mt-1 text-xs text-[#4B5563] line-clamp-2">{b.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E2DC] pb-3">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-[#111827]">
              <Calendar className="h-4 w-4 text-[#0D3B2E]" /> Upcoming Events
            </h2>
            <Link to="/events" className="text-xs font-semibold text-[#0D3B2E] hover:underline">All Events</Link>
          </div>
          <div className="space-y-3">
            {eventsRes?.data.slice(0, 3).map((ev) => (
              <Link
                key={ev.id}
                to={`/events/${ev.slug}`}
                onMouseEnter={() => void prefetchEvent(queryClient, ev.slug)}
                onTouchStart={() => void prefetchEvent(queryClient, ev.slug)}
                onFocus={() => void prefetchEvent(queryClient, ev.slug)}
                className="block rounded-lg border border-[#E5E2DC] bg-white p-4 transition-colors hover:border-[#CFCAC0]"
              >
                <div className="font-mono text-[11px] font-semibold text-[#0D3B2E]">
                  {new Date(ev.eventDate).toLocaleDateString()} • {ev.venue}
                </div>
                <div className="mt-1 font-display font-semibold text-[#111827]">{ev.title}</div>
                <p className="mt-1 text-xs text-[#4B5563] line-clamp-2">{ev.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {isLoading && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="h-24 animate-pulse rounded-lg bg-[#F3F1EC]" />
        </div>
      )}
    </div>
  );
}
