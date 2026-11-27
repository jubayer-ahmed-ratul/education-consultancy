import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ArrowUpRight, Compass, Menu, MessageCircle, X } from 'lucide-react';
import { usePublicBundle } from '../hooks/usePublicBundle';
import { prefetchRoute } from '../lib/prefetch';

const NAV_LINKS = [
  { to: '/destinations', label: 'Destinations' },
  { to: '/universities', label: 'Universities' },
  { to: '/success-stories', label: 'Success Stories' },
  { to: '/events', label: 'Events' },
  { to: '/blogs', label: 'Blogs' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicLayout() {
  const { data: bundle } = usePublicBundle();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handlePrefetch = (to: string) => () => {
    void prefetchRoute(queryClient, to);
  };

  const whatsapp = bundle?.whatsappSetting;
  const footer = bundle?.footerSetting;
  const sisterConcerns = bundle?.sisterConcerns ?? [];

  const waHref =
    whatsapp?.isEnabled && whatsapp.phoneNumber
      ? `https://wa.me/${whatsapp.phoneNumber.replace(/[^0-9]/g, '')}${
          whatsapp.defaultMessage ? `?text=${encodeURIComponent(whatsapp.defaultMessage)}` : ''
        }`
      : null;

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F6] text-[#111827]">
      {/* Sticky Glassmorphic Editorial Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-[#E5E2DC] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0D3B2E] text-white transition-colors group-hover:bg-[#092A20]">
              <Compass className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-[#111827]">
              Zero Compile
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-5 text-sm">
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onMouseEnter={handlePrefetch(item.to)}
                onFocus={handlePrefetch(item.to)}
                className={({ isActive }) =>
                  `transition-colors ${
                    isActive
                      ? 'font-semibold text-[#0D3B2E] underline decoration-[#D97706] decoration-2 underline-offset-8'
                      : 'text-[#4B5563] hover:text-[#111827]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              to="/track"
              className="hidden sm:inline-flex items-center rounded-md border border-[#CFCAC0] bg-white px-3.5 py-2 text-xs font-medium text-[#111827] transition-colors hover:bg-[#F3F1EC]"
            >
              Track Application
            </Link>
            <Link
              to="/apply"
              className="inline-flex items-center rounded-md bg-[#0D3B2E] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#092A20]"
            >
              Apply Now
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#E5E2DC] bg-white text-[#111827] lg:hidden"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="border-b border-[#E5E2DC] bg-white px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-[#F3F1EC] text-[#0D3B2E]' : 'text-[#4B5563] hover:bg-[#FAF9F6]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link
                to="/track"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-md border border-[#CFCAC0] px-3 py-2 text-center text-sm font-medium text-[#111827]"
              >
                Track Application
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Deep Academic Navy Editorial Footer */}
      <footer className="border-t border-[#1E3A5F] bg-[#132A4A] text-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3 lg:col-span-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded bg-[#D97706] text-white">
                  <Compass className="h-4 w-4" />
                </span>
                <span className="font-display text-lg font-bold text-white">Zero Compile</span>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-slate-300">
                {bundle?.siteContent?.highlightTitle ||
                  'Transparent admissions advisory, scholarship evaluation, and student visa guidance for global higher education.'}
              </p>
              <div className="pt-1">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1 text-xs font-medium text-amber-300 hover:text-amber-200"
                >
                  Counselor & Admin Portal <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
                Featured Destinations
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                {(footer?.featuredCountrySlugs ?? []).map((slug) => (
                  <li key={slug}>
                    <Link
                      to={`/destinations/${slug}`}
                      onMouseEnter={handlePrefetch(`/destinations/${slug}`)}
                      onFocus={handlePrefetch(`/destinations/${slug}`)}
                      className="capitalize transition-colors hover:text-white"
                    >
                      {slug.replace(/-/g, ' ')}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
                Quick Links
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link to="/apply" className="hover:text-white">Submit Online Inquiry</Link></li>
                <li><Link to="/track" className="hover:text-white">Track & Recover ID</Link></li>
                <li><Link to="/success-stories" onMouseEnter={handlePrefetch('/success-stories')} className="hover:text-white">Student Success Stories</Link></li>
                <li><Link to="/about" onMouseEnter={handlePrefetch('/about')} className="hover:text-white">About Zero Compile</Link></li>
                <li><Link to="/contact" onMouseEnter={handlePrefetch('/contact')} className="hover:text-white">Contact & Office Map</Link></li>
              </ul>
            </div>
          </div>

          {sisterConcerns.length > 0 && (
            <div className="mt-10 border-t border-white/10 pt-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Sister Concerns & Partner Ventures
              </div>
              <div className="flex flex-wrap gap-3">
                {sisterConcerns.map((sc) => (
                  <a
                    key={sc.id}
                    href={sc.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
                  >
                    <span>{sc.name}</span>
                    <ArrowUpRight className="h-3 w-3 text-amber-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-400">
            <span>© {new Date().getFullYear()} Zero Compile. All rights reserved.</span>
            <span>Reference Prefix: <code className="text-slate-300">ZRC-YYYY-XXX</code></span>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Support Pill */}
      {waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-emerald-700 bg-[#0D3B2E] px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-[#092A20]"
        >
          <MessageCircle className="h-4 w-4 text-amber-400" />
          <span>WhatsApp Advisory</span>
        </a>
      )}
    </div>
  );
}
