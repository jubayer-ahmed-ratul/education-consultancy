import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, Compass, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PublicBundleData } from '../hooks/usePublicBundle';
import { apiRequest } from '../lib/api-client';
import { prefetchRoute } from '../lib/prefetch';
import { queryKeys } from '../lib/query-keys';

interface FooterProps {
  bundle?: PublicBundleData;
  waHref: string | null;
}

export function Footer({ bundle, waHref }: FooterProps) {
  const queryClient = useQueryClient();
  const footer = bundle?.footerSetting;
  const sisterConcerns = bundle?.sisterConcerns ?? [];

  const { data: countriesRes } = useQuery({
    queryKey: queryKeys.countries.publicList({ page: 1, limit: 100 }),
    queryFn: () =>
      apiRequest<Array<{ id: string; name: string; slug: string }>>('/countries?page=1&limit=100'),
    enabled: !(footer?.featuredCountrySlugs?.length),
  });

  const destinationLinks = footer?.featuredCountrySlugs?.length
    ? footer.featuredCountrySlugs.map((slug) => ({
        slug,
        label: slug.replace(/-/g, ' '),
      }))
    : (countriesRes?.data ?? []).slice(0, 5).map((c) => ({
        slug: c.slug,
        label: c.name,
      }));

  const handlePrefetch = (to: string) => () => {
    void prefetchRoute(queryClient, to);
  };

  return (
    <footer className="overflow-hidden border-t border-zinc-800 bg-[#09090B] text-zinc-300">
      <div className="mx-auto max-w-11/12 px-4 pt-14 pb-6 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand Summary & Contact */}
          <div className="space-y-4 lg:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
                <Compass className="h-4.5 w-4.5" />
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-white">
                StudySphere
              </span>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-zinc-400">
              {bundle?.siteContent?.highlightTitle ||
                'Transparent admissions advisory, scholarship evaluation, and student visa guidance for global higher education.'}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-teal-600/15 px-3.5 py-1.5 text-xs font-semibold text-teal-400 ring-1 ring-inset ring-teal-500/30 transition-colors hover:bg-teal-600 hover:text-white"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Advisory
                </a>
              )}
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-400 hover:text-teal-300"
              >
                Counselor &amp; Admin Portal <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-teal-400">
              Quick Links
            </div>
            <ul className="space-y-2.5 text-sm text-zinc-300">
              <li>
                <Link to="/apply" className="transition-colors hover:text-white">
                  Book Consultation
                </Link>
              </li>
              <li>
                <Link
                  to="/universities"
                  onMouseEnter={handlePrefetch('/universities')}
                  className="transition-colors hover:text-white"
                >
                  Partner Universities
                </Link>
              </li>
              <li>
                <Link
                  to="/success-stories"
                  onMouseEnter={handlePrefetch('/success-stories')}
                  className="transition-colors hover:text-white"
                >
                  Success Stories
                </Link>
              </li>
              <li>
                <Link
                  to="/blogs"
                  onMouseEnter={handlePrefetch('/blogs')}
                  className="transition-colors hover:text-white"
                >
                  Study Guides &amp; Blogs
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  onMouseEnter={handlePrefetch('/events')}
                  className="transition-colors hover:text-white"
                >
                  Events &amp; Expos
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Destinations */}
          <div className="lg:col-span-3">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-teal-400">
              Top Destinations
            </div>
            <ul className="space-y-2.5 text-sm text-zinc-300">
              {destinationLinks.map((dest) => (
                <li key={dest.slug}>
                  <Link
                    to={`/countries/${dest.slug}`}
                    onMouseEnter={handlePrefetch(`/countries/${dest.slug}`)}
                    onFocus={handlePrefetch(`/countries/${dest.slug}`)}
                    className="capitalize transition-colors hover:text-white"
                  >
                    {dest.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="lg:col-span-2">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-teal-400">
              Support
            </div>
            <ul className="space-y-2.5 text-sm text-zinc-300">
              <li>
                <Link to="/track" className="transition-colors hover:text-white">
                  Track Application
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  onMouseEnter={handlePrefetch('/about')}
                  className="transition-colors hover:text-white"
                >
                  About StudySphere
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  onMouseEnter={handlePrefetch('/contact')}
                  className="transition-colors hover:text-white"
                >
                  Contact &amp; Office Map
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  onMouseEnter={handlePrefetch('/gallery')}
                  className="transition-colors hover:text-white"
                >
                  Campus Gallery
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {sisterConcerns.length > 0 && (
          <div className="mt-10 border-t border-zinc-800 pt-6">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Sister Concerns &amp; Partner Ventures
            </div>
            <div className="flex flex-wrap gap-3">
              {sisterConcerns.map((sc) => (
                <a
                  key={sc.id}
                  href={sc.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-800"
                >
                  <span>{sc.name}</span>
                  <ArrowUpRight className="h-3 w-3 text-teal-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 pt-6 text-xs text-zinc-400">
          <span>© {new Date().getFullYear()} StudySphere. All rights reserved.</span>
          <span>
            Tracking Prefix: <code className="text-zinc-200">ZRC-YYYY-XXX</code>
          </span>
        </div>

        {/* Signature Oversized Wordmark with -50px Bottom Margin */}
        <div className="mt-8 text-center">
          <div className="font-display text-5xl font-extrabold tracking-tight text-white/15 select-none leading-none mb-[-50px] sm:text-7xl lg:text-8xl">
            StudySphere
          </div>
        </div>
      </div>
    </footer>
  );
}
