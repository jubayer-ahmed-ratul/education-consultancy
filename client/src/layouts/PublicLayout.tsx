import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ArrowUpRight, Compass, Menu, MessageCircle } from 'lucide-react';
import { ScrollToTop } from '../components/ScrollToTop';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
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
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-zinc-950">
      <ScrollToTop />

      {/* Sticky Glassmorphic Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs transition-colors group-hover:bg-teal-700">
              <Compass className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-zinc-950">
              Zero Compile
            </span>
          </Link>

          <nav className="hidden xl:flex items-center gap-6 text-sm">
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onMouseEnter={handlePrefetch(item.to)}
                onTouchStart={handlePrefetch(item.to)}
                onFocus={handlePrefetch(item.to)}
                className={({ isActive }) =>
                  `transition-colors ${
                    isActive
                      ? 'font-semibold text-teal-700 underline decoration-teal-600 decoration-2 underline-offset-8'
                      : 'font-medium text-zinc-700 hover:text-zinc-950'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <Link to="/track" className="hidden sm:inline-flex">
              <Button variant="secondary" size="sm" className="text-zinc-950 ring-zinc-300">
                Track Application
              </Button>
            </Link>
            <Link to="/apply">
              <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700">
                Book Free Consultation
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-50 xl:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Responsive Mobile Sheet Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-80 bg-white p-0">
          <SheetHeader className="border-b border-zinc-200 px-5 py-4 text-left">
            <SheetTitle className="flex items-center gap-2.5 text-zinc-950">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                <Compass className="h-4 w-4" />
              </span>
              <span className="font-display text-base font-extrabold tracking-tight">Zero Compile</span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col justify-between p-4 space-y-6">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onMouseEnter={handlePrefetch(item.to)}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-teal-50 font-semibold text-teal-700'
                        : 'text-zinc-950 hover:bg-zinc-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="space-y-2.5 border-t border-zinc-200 pt-4">
              <Link to="/track" onClick={() => setMobileOpen(false)} className="block">
                <Button variant="secondary" className="w-full text-zinc-950">
                  Track Application
                </Button>
              </Link>
              <Link to="/apply" onClick={() => setMobileOpen(false)} className="block">
                <Button className="w-full bg-teal-600 text-white hover:bg-teal-700">
                  Book Free Consultation
                </Button>
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* High-Contrast Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 text-zinc-300">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3 lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                  <Compass className="h-4 w-4" />
                </span>
                <span className="font-display text-lg font-bold text-white">Zero Compile</span>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-zinc-300">
                {bundle?.siteContent?.highlightTitle ||
                  'Transparent admissions advisory, scholarship evaluation, and student visa guidance for global higher education.'}
              </p>
              <div className="pt-1">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-400 hover:text-teal-300"
                >
                  Counselor & Admin Portal <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-teal-400">
                Featured Destinations
              </div>
              <ul className="space-y-2 text-sm text-zinc-300">
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
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-teal-400">
                Quick Links
              </div>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>
                  <Link to="/apply" className="transition-colors hover:text-white">
                    Book Free Consultation
                  </Link>
                </li>
                <li>
                  <Link to="/track" className="transition-colors hover:text-white">
                    Track & Recover ID
                  </Link>
                </li>
                <li>
                  <Link
                    to="/success-stories"
                    onMouseEnter={handlePrefetch('/success-stories')}
                    className="transition-colors hover:text-white"
                  >
                    Student Success Stories
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    onMouseEnter={handlePrefetch('/about')}
                    className="transition-colors hover:text-white"
                  >
                    About Zero Compile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    onMouseEnter={handlePrefetch('/contact')}
                    className="transition-colors hover:text-white"
                  >
                    Contact & Office Map
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {sisterConcerns.length > 0 && (
            <div className="mt-10 border-t border-zinc-800 pt-6">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Sister Concerns & Partner Ventures
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
            <span>© {new Date().getFullYear()} Zero Compile. All rights reserved.</span>
            <span>
              Reference Prefix: <code className="text-zinc-200">ZRC-YYYY-XXX</code>
            </span>
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
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg ring-1 ring-teal-500/40 transition-transform hover:-translate-y-0.5 hover:bg-teal-700"
        >
          <MessageCircle className="h-4 w-4 text-white" />
          <span>WhatsApp Advisory</span>
        </a>
      )}
    </div>
  );
}
