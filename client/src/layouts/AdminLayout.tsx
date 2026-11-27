import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Award,
  BookOpen,
  Building2,
  Calendar,
  ChevronRight,
  Compass,
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
import { Avatar } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { prefetchAdminRoute } from '../lib/prefetch';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: PermissionKey;
  end?: boolean;
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
    title: 'Admissions & Triage',
    items: [{ to: '/admin/inquiries', label: 'Inquiries Queue', icon: Inbox, permission: 'inquiries:view-all' }],
  },
  {
    title: 'Directories',
    items: [
      { to: '/admin/countries', label: 'Destinations', icon: Globe2, permission: 'countries:manage' },
      { to: '/admin/universities', label: 'Universities', icon: Building2, permission: 'universities:manage' },
    ],
  },
  {
    title: 'CMS & Pages',
    items: [
      { to: '/admin/cms/blogs', label: 'Blogs & Guides', icon: BookOpen, permission: 'content:manage' },
      { to: '/admin/cms/events', label: 'Events', icon: Calendar, permission: 'content:manage' },
      { to: '/admin/cms/success-stories', label: 'Success Stories', icon: Award, permission: 'content:manage' },
      { to: '/admin/cms/gallery', label: 'Media Gallery', icon: Image, permission: 'content:manage' },
      { to: '/admin/cms/sister-concerns', label: 'Sister Concerns', icon: FileText, permission: 'content:manage' },
      { to: '/admin/cms/settings', label: 'Site Settings', icon: Settings, permission: 'content:manage' },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/admin/users', label: 'Staff & Roles', icon: Users, permission: 'users:manage' },
      { to: '/admin/activity-logs', label: 'Audit Logs', icon: Activity, permission: 'activity-log:view' },
    ],
  },
];

function buildBreadcrumbs(pathname: string) {
  const parts = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
  if (parts.length === 0) return [{ label: 'Dashboard', to: '/admin' }];
  const crumbs = [{ label: 'Admin', to: '/admin' }];
  let acc = '/admin';
  for (const part of parts) {
    acc += `/${part}`;
    crumbs.push({
      label: part.length > 20 ? `${part.slice(0, 8)}...` : part.replace(/-/g, ' '),
      to: acc,
    });
  }
  return crumbs;
}

export default function AdminLayout() {
  const { user, logout, can } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');

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
  const filteredCmdItems = allNavItems.filter((item) =>
    item.label.toLowerCase().includes(cmdQuery.trim().toLowerCase())
  );

  const breadcrumbs = buildBreadcrumbs(location.pathname);

  const sidebarContent = (isCollapsed: boolean) => (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-14 items-center justify-between border-b border-[#E5E2DC] px-4">
        <Link to="/admin" className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#0D3B2E] text-white">
            <Compass className="h-4 w-4" />
          </span>
          {!isCollapsed && (
            <div className="truncate">
              <div className="font-display text-sm font-extrabold text-[#111827]">Zero Compile</div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-[#D97706]">CMS Console</div>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-3">
        {visibleGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
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
                        `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-[#0D3B2E] text-white'
                            : 'text-[#4B5563] hover:bg-[#F3F1EC] hover:text-[#111827]'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              );
            })}
          </div>
        ))}
      </nav>

      <Separator />
      <div className="p-3 space-y-2.5">
        <div className="flex items-center gap-2.5 rounded-md border border-[#E5E2DC] bg-[#FAF9F6] p-2">
          <Avatar name={user?.name || 'Admin'} />
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-[#111827]">{user?.name}</div>
              <Badge variant={user?.role === 'super-admin' ? 'amber' : 'secondary'} className="mt-0.5 text-[10px]">
                {user?.role}
              </Badge>
            </div>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={handleLogout} className="w-full justify-center">
          <LogOut className="h-3.5 w-3.5" />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-[#FAF9F6] text-[#111827]">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:block shrink-0 border-r border-[#E5E2DC] transition-all duration-200 ${
            collapsed ? 'w-[68px]' : 'w-64'
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
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-[#E5E2DC] bg-white/95 px-4 backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E2DC] md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                className="hidden md:inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E2DC] text-[#4B5563] hover:bg-[#F3F1EC]"
                aria-label="Toggle sidebar"
              >
                {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </button>

              {/* Dynamic Breadcrumbs */}
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
                {breadcrumbs.map((crumb, idx) => (
                  <span key={crumb.to} className="flex items-center gap-1.5">
                    {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-[#CFCAC0]" />}
                    <Link
                      to={crumb.to}
                      className={`capitalize ${
                        idx === breadcrumbs.length - 1
                          ? 'font-semibold text-[#111827]'
                          : 'text-[#6B7280] hover:text-[#111827]'
                      }`}
                    >
                      {crumb.label}
                    </Link>
                  </span>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setCmdOpen(true)}>
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Quick Jump</span>
                <kbd className="hidden sm:inline rounded bg-[#F3F1EC] px-1.5 py-0.5 font-mono text-[10px] text-[#6B7280]">
                  Ctrl K
                </kbd>
              </Button>
              <Link to="/" target="_blank">
                <Button variant="outline" size="sm">View Site</Button>
              </Link>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>

        {/* Quick Jump Command Dialog */}
        <Dialog open={cmdOpen} onOpenChange={setCmdOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quick Jump</DialogTitle>
            </DialogHeader>
            <Input
              autoFocus
              value={cmdQuery}
              onChange={(e) => setCmdQuery(e.target.value)}
              placeholder="Jump to a section (e.g. Inquiries, Destinations, Blogs)..."
            />
            <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
              {filteredCmdItems.map((item) => {
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
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm hover:bg-[#F3F1EC] cursor-pointer"
                  >
                    <Icon className="h-4 w-4 text-[#0D3B2E]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
