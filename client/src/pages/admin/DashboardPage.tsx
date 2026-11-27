import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Globe2,
  Inbox,
  Plus,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { InquiryStatusType } from '@zero-compile/shared';
import { Avatar } from '../../components/ui/avatar';
import { Select } from '../../components/ui/select';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-keys';

interface RecentInquiry {
  id: string;
  referenceNumber: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  status: InquiryStatusType;
  createdAt: string;
  preferredCountry?: { name: string } | null;
}

interface AuditItem {
  id: string;
  action: string;
  createdAt: string;
  performedBy?: { name: string } | null;
}

const SPARKLINE_PATHS = [
  'M0 24 Q 18 10, 36 18 T 72 12 T 108 6',
  'M0 22 Q 20 26, 40 16 T 76 14 T 108 8',
  'M0 26 Q 22 14, 44 20 T 80 10 T 108 4',
  'M0 20 Q 18 16, 38 22 T 74 12 T 108 7',
];

export default function DashboardPage() {
  const { user, can } = useAuth();
  const [timeframe, setTimeframe] = useState<'6m' | '30d'>('6m');

  const { data: inquiriesRes, isLoading } = useQuery({
    queryKey: queryKeys.inquiries.list({ page: 1, limit: 8 }),
    queryFn: () => apiRequest<RecentInquiry[]>('/inquiries?page=1&limit=8'),
  });

  const { data: newRes } = useQuery({
    queryKey: queryKeys.inquiries.list({ page: 1, limit: 1, status: 'new' }),
    queryFn: () => apiRequest<unknown[]>('/inquiries?page=1&limit=1&status=new'),
  });

  const { data: reviewRes } = useQuery({
    queryKey: queryKeys.inquiries.list({ page: 1, limit: 1, status: 'in-review' }),
    queryFn: () => apiRequest<unknown[]>('/inquiries?page=1&limit=1&status=in-review'),
  });

  const { data: approvedRes } = useQuery({
    queryKey: queryKeys.inquiries.list({ page: 1, limit: 1, status: 'approved' }),
    queryFn: () => apiRequest<unknown[]>('/inquiries?page=1&limit=1&status=approved'),
  });

  const { data: countriesRes } = useQuery({
    queryKey: queryKeys.countries.publicList({ page: 1, limit: 1 }),
    queryFn: () => apiRequest<unknown[]>('/countries?page=1&limit=1'),
  });

  const { data: universitiesRes } = useQuery({
    queryKey: queryKeys.universities.publicList({ page: 1, limit: 1 }),
    queryFn: () => apiRequest<unknown[]>('/universities?page=1&limit=1'),
  });

  const { data: logsRes } = useQuery({
    queryKey: queryKeys.activityLogs.list({ page: 1, limit: 5 }),
    queryFn: () => apiRequest<AuditItem[]>('/activity-logs?page=1&limit=5'),
    enabled: can('activity-log:view'),
  });

  const totalActive = inquiriesRes?.meta?.total ?? 0;
  const newCount = newRes?.meta?.total ?? 0;
  const reviewCount = reviewRes?.meta?.total ?? 0;
  const approvedCount = approvedRes?.meta?.total ?? 0;
  const countriesCount = countriesRes?.meta?.total ?? 0;
  const universitiesCount = universitiesRes?.meta?.total ?? 0;

  const firstName = user?.name?.split(' ')[0] || 'Admin';

  const statsCards = [
    {
      label: 'Total Inquiries',
      value: totalActive,
      trend: `${newCount} new`,
      icon: Inbox,
      sparkline: SPARKLINE_PATHS[0],
    },
    {
      label: 'Active Countries',
      value: countriesCount,
      trend: 'Published',
      icon: Globe2,
      sparkline: SPARKLINE_PATHS[1],
    },
    {
      label: 'Partner Universities',
      value: universitiesCount,
      trend: 'Directory',
      icon: Building2,
      sparkline: SPARKLINE_PATHS[2],
    },
    {
      label: 'Approved Outcomes',
      value: approvedCount,
      trend: totalActive > 0 ? `${Math.round((approvedCount / totalActive) * 100)}% rate` : '0% rate',
      icon: CheckCircle2,
      sparkline: SPARKLINE_PATHS[3],
    },
  ];

  // Build monochrome chart series from actual inquiries count
  const chartPoints = useMemo(() => {
    const base = Math.max(totalActive, 4);
    const ratios =
      timeframe === '6m'
        ? [0.42, 0.56, 0.51, 0.72, 0.84, 1]
        : [0.65, 0.7, 0.78, 0.82, 0.91, 1];
    const labels =
      timeframe === '6m'
        ? ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']
        : ['W1', 'W2', 'W3', 'W4', 'W5', 'Now'];
    return ratios.map((r, idx) => ({
      label: labels[idx],
      value: Math.round(base * r),
    }));
  }, [totalActive, timeframe]);

  // Donut breakdown using single-hue teal opacity shades (100%, 65%, 35%)
  const breakdownTotal = Math.max(newCount + reviewCount + approvedCount, 1);
  const newPct = Math.round((newCount / breakdownTotal) * 100);
  const reviewPct = Math.round((reviewCount / breakdownTotal) * 100);
  const approvedPct = Math.max(0, 100 - newPct - reviewPct);

  const circumference = 2 * Math.PI * 38;
  const newDash = (newPct / 100) * circumference;
  const reviewDash = (reviewPct / 100) * circumference;
  const approvedDash = (approvedPct / 100) * circumference;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Dashboard — Zero Compile Admin</title>
      </Helmet>

      {/* Top Greeting */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
            Hello, {firstName}!
          </h1>
          <p className="mt-0.5 text-sm font-medium text-zinc-700">
            Here is your admissions pipeline, partner catalog, and recent activity.
          </p>
        </div>
      </div>

      {/* Top Row — 4 Monochrome KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                  {stat.label}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600/10 text-teal-700">
                  <Icon className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <div className="text-3xl font-extrabold tabular-nums text-zinc-950">
                    {stat.value}
                  </div>
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-teal-600/10 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
                    <TrendingUp className="h-3 w-3" /> {stat.trend}
                  </span>
                </div>

                <svg viewBox="0 0 110 30" className="h-8 w-24 shrink-0 overflow-visible">
                  <path
                    d={stat.sparkline}
                    fill="none"
                    stroke="#0D9488"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Inquiries Overview (6) | Recent Inquiries (4) | Public Portal Preview (2) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Inquiries Overview Line/Area Chart */}
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-xs lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-zinc-950">Inquiries Overview</h2>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold tabular-nums text-zinc-950">
                  {totalActive}
                </span>
                <span className="rounded-full bg-teal-600/10 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
                  Total Cases
                </span>
              </div>
            </div>
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as '6m' | '30d')}
              className="h-8 w-36 rounded-xl text-xs font-semibold text-zinc-950"
            >
              <option value="6m">Last 6 Months</option>
              <option value="30d">Last 30 Days</option>
            </Select>
          </div>

          <div className="mt-5">
            <svg viewBox="0 0 420 140" className="h-44 w-full overflow-visible">
              <defs>
                <linearGradient id="tealAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0D9488" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#0D9488" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Subtle horizontal grid */}
              {[25, 60, 95].map((y) => (
                <line
                  key={y}
                  x1="10"
                  y1={y}
                  x2="410"
                  y2={y}
                  stroke="#E4E4E7"
                  strokeDasharray="3 3"
                />
              ))}
              {/* Area fill */}
              <path
                d="M15 98 C 75 82, 115 88, 170 68 C 225 48, 285 52, 335 32 L 405 18 L 405 115 L 15 115 Z"
                fill="url(#tealAreaGrad)"
              />
              {/* Smooth single-color line */}
              <path
                d="M15 98 C 75 82, 115 88, 170 68 C 225 48, 285 52, 335 32 L 405 18"
                fill="none"
                stroke="#0D9488"
                strokeWidth="2.75"
                strokeLinecap="round"
              />
              {/* Highlight dot + tooltip pill */}
              <circle cx="405" cy="18" r="4.5" fill="#0D9488" stroke="#FFFFFF" strokeWidth="2" />
              <g transform="translate(342, 0)">
                <rect width="58" height="20" rx="10" fill="#0F172A" />
                <text
                  x="29"
                  y="13.5"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="700"
                >
                  {totalActive} cases
                </text>
              </g>
              {/* X-Axis Labels */}
              {chartPoints.map((pt, i) => (
                <text
                  key={pt.label}
                  x={15 + i * 78}
                  y="134"
                  textAnchor="middle"
                  fill="#52525B"
                  fontSize="11"
                  fontWeight="600"
                >
                  {pt.label}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-xs lg:col-span-4">
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-base font-bold text-zinc-950">Recent Inquiries</h2>
            <Link
              to="/admin/inquiries"
              className="text-xs font-bold text-teal-700 hover:text-teal-800"
            >
              View All →
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-zinc-100" />
              ))}
            </div>
          ) : !inquiriesRes?.data?.length ? (
            <p className="py-8 text-center text-xs font-medium text-zinc-600">
              No inquiries found.
            </p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {inquiriesRes.data.slice(0, 4).map((inq) => (
                <Link
                  key={inq.id}
                  to={`/admin/inquiries/${inq.id}`}
                  className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-zinc-50/80 rounded-lg px-1.5 -mx-1.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      name={`${inq.studentFirstName} ${inq.studentLastName}`}
                      className="h-9 w-9 shrink-0 bg-teal-600/10 text-teal-700 text-xs font-bold"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-zinc-950">
                        {inq.studentFirstName} {inq.studentLastName}
                      </div>
                      <div className="truncate font-mono text-[11px] font-medium text-zinc-600">
                        {inq.referenceNumber} •{' '}
                        {inq.preferredCountry?.name ?? new Date(inq.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-zinc-950">
                    {inq.status.replace('-', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Public Portal Preview Card */}
        <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#0B1120] via-[#132238] to-[#0D9488] p-5 text-white shadow-xs lg:col-span-2">
          <div className="space-y-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-white">
              <Globe2 className="h-4 w-4" />
            </span>
            <h2 className="text-base font-bold leading-snug text-white">Public Portal</h2>
            <p className="text-xs leading-relaxed text-white/80">
              Preview live destinations, universities, and student tracking.
            </p>
          </div>
          <Link
            to="/"
            target="_blank"
            className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3.5 py-2.5 text-xs font-bold text-zinc-950 shadow-xs transition-colors hover:bg-zinc-100"
          >
            Visit Live Site <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Bottom Row: Recent Activity (5) | Inquiries Breakdown (4) | Quick Actions (3) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Recent Activity */}
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-xs lg:col-span-5">
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-base font-bold text-zinc-950">Recent Activity</h2>
            {can('activity-log:view') && (
              <Link
                to="/admin/activity-logs"
                className="text-xs font-bold text-teal-700 hover:text-teal-800"
              >
                View All →
              </Link>
            )}
          </div>

          {!logsRes?.data?.length ? (
            <p className="py-8 text-center text-xs font-medium text-zinc-600">
              No recent activity logged.
            </p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {logsRes.data.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-teal-600" />
                    <div className="min-w-0">
                      <div className="truncate font-mono text-xs font-bold text-zinc-950">
                        {log.action}
                      </div>
                      <div className="text-xs font-medium text-zinc-600">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-950">
                    {log.performedBy?.name ?? 'System'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inquiries Breakdown — Monochrome Donut Chart */}
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-xs lg:col-span-4">
          <h2 className="text-base font-bold text-zinc-950">Inquiries Breakdown</h2>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="relative h-32 w-32 shrink-0">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#F4F4F5"
                  strokeWidth="12"
                />
                {/* New (100% opacity) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#0D9488"
                  strokeOpacity="1"
                  strokeWidth="12"
                  strokeDasharray={`${newDash} ${circumference}`}
                  strokeDashoffset="0"
                />
                {/* In Review (65% opacity) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#0D9488"
                  strokeOpacity="0.6"
                  strokeWidth="12"
                  strokeDasharray={`${reviewDash} ${circumference}`}
                  strokeDashoffset={-newDash}
                />
                {/* Approved (35% opacity) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#0D9488"
                  strokeOpacity="0.3"
                  strokeWidth="12"
                  strokeDasharray={`${approvedDash} ${circumference}`}
                  strokeDashoffset={-(newDash + reviewDash)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-semibold uppercase text-zinc-600">Total</span>
                <span className="text-lg font-extrabold tabular-nums text-zinc-950">
                  {newCount + reviewCount + approvedCount}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold text-zinc-950">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0D9488]" /> New
                </span>
                <span className="font-mono font-bold tabular-nums text-zinc-950">{newCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold text-zinc-950">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0D9488]/60" /> In Review
                </span>
                <span className="font-mono font-bold tabular-nums text-zinc-950">{reviewCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold text-zinc-950">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0D9488]/30" /> Approved
                </span>
                <span className="font-mono font-bold tabular-nums text-zinc-950">{approvedCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-xs lg:col-span-3 flex flex-col justify-between space-y-4">
          <h2 className="text-base font-bold text-zinc-950">Quick Actions</h2>

          <div className="space-y-2.5">
            <Link
              to="/apply"
              target="_blank"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" /> Add New Inquiry
            </Link>

            <Link
              to="/admin/countries"
              className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-[#F4F6FA] px-3.5 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-zinc-100"
            >
              <span className="flex items-center gap-2">
                <Globe2 className="h-3.5 w-3.5 text-teal-700" /> Manage Countries
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
            </Link>

            <Link
              to="/admin/universities"
              className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-[#F4F6FA] px-3.5 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-zinc-100"
            >
              <span className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-teal-700" /> Manage Universities
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
            </Link>

            <Link
              to="/admin/cms/settings"
              className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-[#F4F6FA] px-3.5 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-zinc-100"
            >
              <span className="flex items-center gap-2">
                <Settings className="h-3.5 w-3.5 text-teal-700" /> Site Settings
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
