import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Activity,
  Award,
  BookOpen,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  Compass,
  ExternalLink,
  FileText,
  Globe2,
  Image,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import type { PermissionKey } from '@zero-compile/shared';
import { ScrollToTop } from '../components/ScrollToTop';
import { Avatar } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiRequest } from '../lib/api-client';
import { prefetchAdminRoute } from '../lib/prefetch';
import { queryKeys } from '../lib/query-keys';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: PermissionKey;
  end?: boolean;
  badgeKey?: 'inquiries';
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Admissions & CRM',
    items: [
      {
        to: '/admin/inquiries',
        label: 'Inquiries',
        icon: Inbox,
        permission: 'inquiries:view-all',
        badgeKey: 'inquiries',
      },
    ],
  },
  {
    title: 'Academic Catalog',
    items: [
      { to: '/admin/countries', label: 'Countries', icon: Globe2, permission: 'countries:manage' },
      { to: '/admin/universities', label: 'Universities', icon: Building2, permission: 'universities:manage' },
    ],
  },
  {
    title: 'Content & Media',
    items: [
      { to: '/admin/cms/blogs', label: 'Blogs', icon: BookOpen, permission: 'content:manage' },
      { to: '/admin/cms/events', label: 'Events', icon: Calendar, permission: 'content:manage' },
      { to: '/admin/cms/success-stories', label: 'Success Stories', icon: Award, permission: 'content:manage' },
      { to: '/admin/cms/gallery', label: 'Gallery', icon: Image, permission: 'content:manage' },
    ],
  },
  {
    title: 'Site & System',
    items: [
      { to: '/admin/cms/sister-concerns', label: 'Sister Concerns', icon: FileText, permission: 'content:manage' },
      { to: '/admin/cms/settings', label: 'Page Content & Settings', icon: Settings, permission: 'content:manage' },
      { to: '/admin/users', label: 'Team & Roles', icon: Users, permission: 'users:manage' },
      { to: '/admin/activity-logs', label: 'Activity Logs', icon: Activity, permission: 'activity-log:view' },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout, can } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Live inquiry count badge for sidebar
  const { data: inquiryCountRes } = useQuery({
    queryKey: queryKeys.inquiries.list({ page: 1, limit: 1, status: 'new' }),
    queryFn: () => apiRequest<unknown[]>('/inquiries?page=1&limit=1&status=new'),
    enabled: can('inquiries:view-all'),
  });

  // Global Search queries inside Ctrl+K modal
  const q = cmdQuery.trim();
  const { data: searchInquiries } = useQuery({
    queryKey: ['global-search', 'inquiries', q],
    queryFn: () =>
      apiRequest<Array<{ id: string; referenceNumber: string; studentFirstName: string; studentLastName: string }>>(
        `/inquiries?page=1&limit=5&search=${encodeURIComponent(q)}`
      ),
    enabled: cmdOpen && q.length >= 2 && can('inquiries:view-all'),
  });

  const { data: searchCountries } = useQuery({
    queryKey: ['global-search', 'countries', q],
    queryFn: () =>
      apiRequest<Array<{ id: string; name: string }>>(
        `/countries/admin/list?page=1&limit=4&search=${encodeURIComponent(q)}`
      ),
    enabled: cmdOpen && q.length >= 2 && can('countries:manage'),
  });

  const { data: searchUniversities } = useQuery({
    queryKey: ['global-search', 'universities', q],
    queryFn: () =>
      apiRequest<Array<{ id: string; name: string }>>(
        `/universities/admin/list?page=1&limit=4&search=${encodeURIComponent(q)}`
      ),
    enabled: cmdOpen && q.length >= 2 && can('universities:manage'),
  });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  async function handleLogout() {
    await logout();
    addToast('info', 'Signed out.');
    navigate('/admin/login');
  }

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || can(item.permission)),
  })).filter((g) => g.items.length > 0);

  const allNavItems = visibleGroups.flatMap((g) => g.items);
  const filteredNavItems = allNavItems.filter((item) =>
    item.label.toLowerCase().includes(q.toLowerCase())
  );

  const newInquiryCount = inquiryCountRes?.meta?.total ?? 0;

  const sidebarContent = (isCollapsed: boolean) => (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-5">
        <Link to="/admin" className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white">
            <Compass className="h-4 w-4" />
          </span>
          {!isCollapsed && (
            <div className="flex items-center gap-2 truncate">
              <span className="text-sm font-bold tracking-tight text-zinc-950">Zero Compile</span>
              <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700 ring-1 ring-inset ring-teal-200">
                Admin
              </span>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {visibleGroups.map((group) => {
          const isGroupCollapsed = Boolean(collapsedGroups[group.title]);
          return (
            <div key={group.title} className="space-y-1">
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={() =>
                    setCollapsedGroups((prev) => ({ ...prev, [group.title]: !prev[group.title] }))
                  }
                  className="flex w-full items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 cursor-pointer"
                >
                  <span>{group.title}</span>
                  {isGroupCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              )}

              {(!isGroupCollapsed || isCollapsed) &&
                group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Tooltip key={item.to} delayDuration={200}>
                      <TooltipTrigger asChild>
                        <NavLink
                          to={item.to}
                          end={item.end}
                          onMouseEnter={() => void prefetchAdminRoute(queryClient, item.to)}
                          onFocus={() => void prefetchAdminRoute(queryClient, item.to)}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            `group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-teal-50 text-teal-700 font-semibold'
                                : 'text-zinc-950 hover:bg-zinc-100'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <span className="flex items-center gap-3 min-w-0">
                                <Icon
                                  className={`h-4 w-4 shrink-0 ${
                                    isActive ? 'text-teal-600' : 'text-zinc-700 group-hover:text-zinc-950'
                                  }`}
                                />
                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                              </span>
                              {!isCollapsed && item.badgeKey === 'inquiries' && newInquiryCount > 0 && (
                                <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-teal-700 ring-1 ring-inset ring-teal-200">
                                  {newInquiryCount}
                                </span>
                              )}
                            </>
                          )}
                        </NavLink>
                      </TooltipTrigger>
                      {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                    </Tooltip>
                  );
                })}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 p-3 space-y-2">
        <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-zinc-50 p-2.5">
          <Avatar name={user?.name || 'Admin'} className="bg-teal-600 text-white" />
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-bold text-zinc-950">{user?.name}</div>
              <Badge
                variant={user?.role === 'super-admin' ? 'success' : 'secondary'}
                className="mt-0.5 text-[10px]"
              >
                {user?.role}
              </Badge>
            </div>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={handleLogout} className="w-full justify-center">
          <LogOut className="h-3.5 w-3.5 text-zinc-700" />
          {!isCollapsed && <span>Sign out</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <ScrollToTop />
      <div className="flex min-h-screen bg-zinc-100/80 text-zinc-950">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:block shrink-0 border-r border-zinc-200 bg-white transition-all duration-200 ${
            collapsed ? 'w-[72px]' : 'w-72'
          }`}
        >
          {sidebarContent(collapsed)}
        </aside>

        {/* Mobile Sheet Drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin Navigation</SheetTitle>
            </SheetHeader>
            {sidebarContent(false)}
          </SheetContent>
        </Sheet>

        {/* Main Workspace */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                aria-label="Toggle sidebar"
              >
                {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Filament Global Search Trigger */}
              <button
                type="button"
                onClick={() => setCmdOpen(true)}
                className="flex h-9 w-48 sm:w-72 items-center justify-between rounded-lg bg-gray-50 px-3 text-xs text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-white cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-gray-400" />
                  <span>Search...</span>
                </span>
                <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-400 ring-1 ring-gray-200">
                  ⌘K
                </kbd>
              </button>

              <Link to="/" target="_blank">
                <Button variant="secondary" size="sm">
                  <span>Visit Site</span>
                  <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                </Button>
              </Link>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>

        {/* Filament Global Search Modal */}
        <Dialog open={cmdOpen} onOpenChange={setCmdOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Global Search</DialogTitle>
            </DialogHeader>
            <Input
              autoFocus
              value={cmdQuery}
              onChange={(e) => setCmdQuery(e.target.value)}
              placeholder="Search inquiries (ZRC-...), countries, universities, or pages..."
            />
            <div className="mt-3 max-h-80 space-y-3 overflow-y-auto text-sm">
              {searchInquiries?.data && searchInquiries.data.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Inquiries
                  </div>
                  {searchInquiries.data.map((inq) => (
                    <button
                      key={inq.id}
                      type="button"
                      onClick={() => {
                        navigate(`/admin/inquiries/${inq.id}`);
                        setCmdOpen(false);
                        setCmdQuery('');
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-teal-50 hover:text-teal-700 cursor-pointer"
                    >
                      <span className="font-medium">
                        {inq.studentFirstName} {inq.studentLastName}
                      </span>
                      <span className="font-mono text-xs text-teal-600">{inq.referenceNumber}</span>
                    </button>
                  ))}
                </div>
              )}

              {searchCountries?.data && searchCountries.data.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Countries
                  </div>
                  {searchCountries.data.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        navigate('/admin/countries');
                        setCmdOpen(false);
                        setCmdQuery('');
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-teal-50 hover:text-teal-700 cursor-pointer"
                    >
                      <Globe2 className="h-3.5 w-3.5 text-teal-600" />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {searchUniversities?.data && searchUniversities.data.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Universities
                  </div>
                  {searchUniversities.data.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        navigate('/admin/universities');
                        setCmdOpen(false);
                        setCmdQuery('');
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-teal-50 hover:text-teal-700 cursor-pointer"
                    >
                      <Building2 className="h-3.5 w-3.5 text-teal-600" />
                      <span>{u.name}</span>
                    </button>
                  ))}
                </div>
              )}

              <div>
                <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Navigation
                </div>
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.to}
                      type="button"
                      onClick={() => {
                        navigate(item.to);
                        setCmdOpen(false);
                        setCmdQuery('');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-teal-50 hover:text-teal-700 cursor-pointer"
                    >
                      <Icon className="h-4 w-4 text-teal-600" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
