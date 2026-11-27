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
  assignedTo?: { name: string } | null;
}

interface AuditItem {
  id: string;
  action: string;
  entityType: string;
  createdAt: string;
  performedBy?: { name: string } | null;
}

function MiniSparkline({ color = '#0D9488', points = '0,22 18,16 36,19 54,10 72,13 90,6 108,8 126,2' }: { color?: string; points?: string }) {
  return (
    <svg viewBox="0 0 126 26" className="mt-3 h-7 w-full overflow-visible" fill="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
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
            className="font-mono text-xs font-semibold text-teal-600 hover:underline"
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
            <div className="font-medium text-gray-950">
              {row.original.studentFirstName} {row.original.studentLastName}
            </div>
            <div className="text-xs text-gray-500">{row.original.studentEmail}</div>
          </div>
        ),
      },
      {
        id: 'country',
        header: 'Country',
        cell: ({ row }) => (
          <span className="text-xs text-gray-600">{row.original.preferredCountry?.name ?? '—'}</span>
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
              className="text-xs font-semibold text-teal-600 hover:text-teal-700"
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
    { label: 'New', count: newCount, color: 'bg-sky-500' },
    { label: 'In Review', count: reviewCount, color: 'bg-amber-500' },
    { label: 'Approved', count: approvedCount, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Dashboard — Zero Compile Admin</title>
      </Helmet>

      {/* Filament Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Welcome back, <strong className="font-medium text-gray-800">{user?.name}</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/" target="_blank">
            <Button variant="secondary" size="sm">
              View Public Site <ArrowUpRight className="h-3.5 w-3.5 text-gray-400" />
            </Button>
          </Link>
          <Link to="/admin/inquiries">
            <Button size="sm">Open Inquiries Queue</Button>
          </Link>
        </div>
      </div>

      {/* Filament Stats Overview Widget */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-white p-6 ring-1 ring-gray-950/5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Active Inquiries</span>
            <Inbox className="h-4 w-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold tabular-nums text-gray-950">{totalActive}</span>
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              <TrendingUp className="h-3 w-3" /> Live
            </span>
          </div>
          <MiniSparkline color="#0D9488" />
        </div>

        <div className="rounded-xl bg-white p-6 ring-1 ring-gray-950/5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Pending Review</span>
            <Clock className="h-4 w-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold tabular-nums text-gray-950">{newCount + reviewCount}</span>
            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
              Needs triage
            </span>
          </div>
          <MiniSparkline color="#F59E0B" points="0,18 18,20 36,14 54,16 72,9 90,11 108,7 126,5" />
        </div>

        <div className="rounded-xl bg-white p-6 ring-1 ring-gray-950/5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Approved Outcomes</span>
            <CheckCircle2 className="h-4 w-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold tabular-nums text-gray-950">{approvedCount}</span>
            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              Verified
            </span>
          </div>
          <MiniSparkline color="#10B981" points="0,24 18,21 36,18 54,14 72,15 90,9 108,6 126,3" />
        </div>

        <div className="rounded-xl bg-white p-6 ring-1 ring-gray-950/5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Partner Universities</span>
            <Building2 className="h-4 w-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold tabular-nums text-gray-950">
              {universitiesRes?.meta?.total ?? '—'}
            </span>
            <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[11px] font-medium text-teal-700 ring-1 ring-inset ring-teal-200">
              Published
            </span>
          </div>
          <MiniSparkline color="#0D9488" points="0,20 18,18 36,18 54,15 72,12 90,10 108,8 126,6" />
        </div>
      </div>

      {/* 2-Column Widget Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-950">Latest Inquiries</h2>
            <Link to="/admin/inquiries" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
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
                      <span className="font-medium text-gray-700">{item.label}</span>
                      <span className="font-mono font-semibold tabular-nums text-gray-950">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
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
                <CardTitle>Recent Activity</CardTitle>
                <Link to="/admin/activity-logs" className="text-xs font-semibold text-teal-600 hover:underline">
                  All logs
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {!logsRes?.data?.length ? (
                  <p className="text-xs text-gray-500">No recent activity.</p>
                ) : (
                  logsRes.data.map((log) => (
                    <div key={log.id} className="flex items-start justify-between gap-2 border-b border-gray-950/5 pb-2.5 last:border-0 last:pb-0">
                      <div>
                        <div className="font-mono text-xs font-semibold text-teal-700">{log.action}</div>
                        <div className="text-[11px] text-gray-500">
                          {log.performedBy?.name ?? 'Public / System'}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-gray-400">
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
