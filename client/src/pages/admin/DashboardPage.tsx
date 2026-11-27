import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpRight, Building2, CheckCircle2, Clock, Inbox, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { InquiryStatusType } from '@zero-compile/shared';
import { DataTable } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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

export default function DashboardPage() {
  const { user, can } = useAuth();

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

  const columns = useMemo<ColumnDef<RecentInquiry, unknown>[]>(
    () => [
      {
        accessorKey: 'referenceNumber',
        header: 'Reference',
        cell: ({ row }) => (
          <Link
            to={`/admin/inquiries/${row.original.id}`}
            className="font-mono text-xs font-bold text-teal-700 hover:underline"
          >
            {row.original.referenceNumber}
          </Link>
        ),
      },
      {
        id: 'student',
        header: 'Applicant',
        accessorFn: (row) => `${row.studentFirstName} ${row.studentLastName}`,
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-zinc-950">
              {row.original.studentFirstName} {row.original.studentLastName}
            </div>
            <div className="text-xs text-zinc-600">{row.original.studentEmail}</div>
          </div>
        ),
      },
      {
        id: 'country',
        header: 'Destination',
        cell: ({ row }) => (
          <span className="text-xs font-medium text-zinc-950">
            {row.original.preferredCountry?.name ?? '—'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="text-right">
            <Link
              to={`/admin/inquiries/${row.original.id}`}
              className="text-xs font-bold text-teal-600 hover:text-teal-700"
            >
              View
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  const statusBreakdown = [
    { label: 'New', count: newCount, color: 'bg-sky-600' },
    { label: 'In Review', count: reviewCount, color: 'bg-amber-500' },
    { label: 'Approved', count: approvedCount, color: 'bg-emerald-600' },
  ];

  const statsCards = [
    {
      label: 'Active Inquiries',
      value: totalActive,
      badge: 'Live queue',
      icon: Inbox,
      barColor: 'bg-teal-600',
      barWidth: '78%',
    },
    {
      label: 'Pending Review',
      value: newCount + reviewCount,
      badge: 'Needs triage',
      icon: Clock,
      barColor: 'bg-amber-500',
      barWidth: '52%',
    },
    {
      label: 'Approved Outcomes',
      value: approvedCount,
      badge: 'Verified',
      icon: CheckCircle2,
      barColor: 'bg-emerald-600',
      barWidth: '64%',
    },
    {
      label: 'Partner Universities',
      value: universitiesRes?.meta?.total ?? 0,
      badge: 'Published',
      icon: Building2,
      barColor: 'bg-teal-600',
      barWidth: '88%',
    },
  ];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Dashboard — Zero Compile Admin</title>
      </Helmet>

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Dashboard</h1>
          <p className="mt-0.5 text-sm font-medium text-zinc-700">
            Signed in as <span className="font-bold text-zinc-950">{user?.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/" target="_blank">
            <Button variant="secondary" size="sm">
              Visit Site <ArrowUpRight className="h-3.5 w-3.5 text-zinc-700" />
            </Button>
          </Link>
          <Link to="/apply" target="_blank">
            <Button size="sm">+ New Inquiry</Button>
          </Link>
        </div>
      </div>

      {/* 4 High-Contrast Stat Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                  {stat.label}
                </span>
                <Icon className="h-4 w-4 text-teal-600" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tabular-nums text-zinc-950">
                  {stat.value}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
                  <TrendingUp className="h-3 w-3" /> {stat.badge}
                </span>
              </div>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                <div className={`h-full rounded-full ${stat.barColor}`} style={{ width: stat.barWidth }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-950">Recent Inquiries</h2>
            <Link to="/admin/inquiries" className="text-xs font-bold text-teal-600 hover:text-teal-700">
              View all →
            </Link>
          </div>
          <DataTable
            columns={columns}
            data={inquiriesRes?.data ?? []}
            isLoading={isLoading}
            emptyMessage="No active inquiries found."
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusBreakdown.map((item) => {
                const pct = totalActive > 0 ? Math.min(100, Math.round((item.count / totalActive) * 100)) : 0;
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-950">{item.label}</span>
                      <span className="font-mono font-bold tabular-nums text-zinc-950">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {can('activity-log:view') && (
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Latest Activity</CardTitle>
                <Link to="/admin/activity-logs" className="text-xs font-bold text-teal-600 hover:underline">
                  All logs
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {!logsRes?.data?.length ? (
                  <p className="text-xs font-medium text-zinc-600">No recent activity.</p>
                ) : (
                  logsRes.data.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between gap-2 border-b border-zinc-200 pb-2.5 last:border-0 last:pb-0"
                    >
                      <div>
                        <div className="font-mono text-xs font-bold text-zinc-950">{log.action}</div>
                        <div className="text-xs font-medium text-zinc-700">
                          {log.performedBy?.name ?? 'Public / System'}
                        </div>
                      </div>
                      <span className="font-mono text-[11px] font-medium text-zinc-600">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
