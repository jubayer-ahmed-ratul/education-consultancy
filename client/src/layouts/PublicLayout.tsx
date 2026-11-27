import { useEffect, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Compass, Menu, MessageCircle, Search } from 'lucide-react';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { usePublicBundle } from '../hooks/usePublicBundle';
import { prefetchRoute } from '../lib/prefetch';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/destinations', label: 'Destinations' },
  { to: '/universities', label: 'Universities' },
  { to: '/success-stories', label: 'Success Stories' },
  { to: '/events', label: 'Events' },
  { to: '/blogs', label: 'Blogs' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicLayout() {
  const { data: bundle } = usePublicBundle();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isScrolled, setIsScrolled] = useState(() =>
    typeof window !== 'undefined' ? window.scrollY > 24 : false
  );

  useEffect(() => {
    let ticking = false;
    const updateScroll = () => {
      const next = window.scrollY > 24;
      setIsScrolled((prev) => (prev === next ? prev : next));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handlePrefetch = (to: string) => () => {
    void prefetchRoute(queryClient, to);
  };

  function handleQuickSearch(e: FormEvent) {
    e.preventDefault();
    const q = searchText.trim();
    setSearchOpen(false);
    setSearchText('');
    navigate(q ? `/universities?search=${encodeURIComponent(q)}` : '/universities');
  }

  const whatsapp = bundle?.whatsappSetting;

  const waHref =
    whatsapp?.isEnabled && whatsapp.phoneNumber
      ? `https://wa.me/${whatsapp.phoneNumber.replace(/[^0-9]/g, '')}${
          whatsapp.defaultMessage ? `?text=${encodeURIComponent(whatsapp.defaultMessage)}` : ''
        }`
      : null;

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-950">
      <ScrollToTop />

      {/* Scroll-Aware Floating Header */}
      <header
        className={`fixed left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ease-out ${
          isScrolled
            ? 'top-3 w-11/12 max-w-7xl rounded-2xl bg-white/90 px-5 py-2.5 shadow-lg shadow-zinc-950/5 ring-1 ring-zinc-950/10 backdrop-blur-md'
            : 'top-0 w-full rounded-none border-b border-zinc-200/70 bg-white/95 py-4 backdrop-blur-md'
        }`}
      >
        <div
          className={`mx-auto flex items-center justify-between gap-4 ${
            isScrolled ? 'w-full' : 'max-w-11/12 px-4 sm:px-6'
          }`}
        >
          {/* Left: Brand Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white transition-colors group-hover:bg-teal-600">
              <Compass className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-zinc-950">
              StudySphere
            </span>
          </Link>

          {/* Center: Clean Pill Navigation */}
          <nav className="hidden xl:flex items-center gap-1 text-xs">
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onMouseEnter={handlePrefetch(item.to)}
                onTouchStart={handlePrefetch(item.to)}
                onFocus={handlePrefetch(item.to)}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 transition-colors ${
                    isActive
                      ? 'bg-zinc-100 font-semibold text-zinc-950'
                      : 'font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: Circular Search Icon + Track + Rounded Pill CTA */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search universities or subjects"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-950 transition-colors hover:bg-zinc-200 cursor-pointer"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              to="/track"
              className="hidden sm:inline-flex h-9 items-center rounded-full border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-950 transition-colors hover:bg-zinc-50"
            >
              Track Application
            </Link>
            <Link
              to="/apply"
              className="inline-flex h-9 items-center rounded-full bg-teal-600 px-5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-teal-700"
            >
              Book Free Consultation
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-50 xl:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Quick Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-950">Search Universities &amp; Programs</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleQuickSearch} className="flex gap-2">
            <Input
              autoFocus
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search subject, university, or city..."
              className="text-zinc-950"
            />
            <Button type="submit" className="bg-teal-600 text-white hover:bg-teal-700">
              Search
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Responsive Mobile Sheet Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-80 bg-white p-0">
          <SheetHeader className="border-b border-zinc-200 px-5 py-4 text-left">
            <SheetTitle className="flex items-center gap-2.5 text-zinc-950">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white">
                <Compass className="h-4 w-4" />
              </span>
              <span className="font-display text-base font-extrabold tracking-tight">StudySphere</span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col justify-between p-4 space-y-6">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onMouseEnter={handlePrefetch(item.to)}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-zinc-100 font-semibold text-zinc-950'
                        : 'text-zinc-950 hover:bg-zinc-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="space-y-2.5 border-t border-zinc-200 pt-4">
              <Link to="/track" onClick={() => setMobileOpen(false)} className="block">
                <Button variant="secondary" className="w-full rounded-full text-zinc-950">
                  Track Application
                </Button>
              </Link>
              <Link to="/apply" onClick={() => setMobileOpen(false)} className="block">
                <Button className="w-full rounded-full bg-teal-600 text-white hover:bg-teal-700">
                  Book Consultation
                </Button>
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex-1 bg-[#F8FAFC] pt-[72px]">
        <Outlet />
      </main>

      {/* Modern StudySphere Footer */}
      <Footer bundle={bundle} waHref={waHref} />

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
