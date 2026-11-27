import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowRight, Building2, Globe2, Inbox, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { InquiryStatusType } from '@zero-compile/shared';
import { DataTable } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
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
}

export default function DashboardPage() {
  const { user, can } = useAuth();

  const { data: inquiriesRes, isLoading } = useQuery({
    queryKey: queryKeys.inquiries.list({ page: 1, limit: 8 }),
    queryFn: () => apiRequest<RecentInquiry[]>('/inquiries?page=1&limit=8'),
  });

  const { data: countriesRes } = useQuery({
    queryKey: queryKeys.countries.publicList({ page: 1, limit: 1 }),
    queryFn: () => apiRequest<unknown[]>('/countries?page=1&limit=1'),
  });

  const { data: universitiesRes } = useQuery({
    queryKey: queryKeys.universities.publicList({ page: 1, limit: 1 }),
    queryFn: () => apiRequest<unknown[]>('/universities?page=1&limit=1'),
  });

  const columns = useMemo<ColumnDef<RecentInquiry, unknown>[]>(
    () => [
      {
        accessorKey: 'referenceNumber',
        header: 'Reference',
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-[#0D3B2E]">{row.original.referenceNumber}</span>
        ),
      },
      {
        id: 'student',
        header: 'Applicant',
        accessorFn: (row) => `${row.studentFirstName} ${row.studentLastName}`,
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.studentFirstName} {row.original.studentLastName}</div>
            <div className="text-xs text-[#6B7280]">{row.original.studentEmail}</div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'createdAt',
        header: 'Submitted',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-[#6B7280]">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <Link to={`/admin/inquiries/${row.original.id}`}>
            <Button variant="secondary" size="sm">Inspect</Button>
          </Link>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Dashboard — Zero Compile Admin</title>
      </Helmet>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#111827]">Welcome, {user?.name}</h1>
          <p className="text-xs text-[#6B7280]">Admissions & CMS Operations Overview</p>
        </div>
        <Badge variant="amber" className="gap-1.5 py-1 px-3">
          <ShieldCheck className="h-3.5 w-3.5" /> {user?.role}
        </Badge>
      </div>

      {/* Filament KPI Stat Widgets */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <div className="text-xs font-medium text-[#6B7280]">Active Inquiries (Excl. Closed)</div>
              <div className="mt-1 font-mono text-3xl font-bold text-[#0D3B2E]">
                {inquiriesRes?.meta?.total ?? '—'}
              </div>
              <Link to="/admin/inquiries" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#0D3B2E] hover:underline">
                Open Triage Queue <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <span className="rounded-md bg-[#F3F1EC] p-2.5 text-[#0D3B2E]">
              <Inbox className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <div className="text-xs font-medium text-[#6B7280]">Published Destinations</div>
              <div className="mt-1 font-mono text-3xl font-bold text-[#132A4A]">
                {countriesRes?.meta?.total ?? '—'}
              </div>
              {can('countries:manage') && (
                <Link to="/admin/countries" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#0D3B2E] hover:underline">
                  Manage Destinations <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
            <span className="rounded-md bg-[#F3F1EC] p-2.5 text-[#132A4A]">
              <Globe2 className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <div className="text-xs font-medium text-[#6B7280]">Published Universities</div>
              <div className="mt-1 font-mono text-3xl font-bold text-[#D97706]">
                {universitiesRes?.meta?.total ?? '—'}
              </div>
              {can('universities:manage') && (
                <Link to="/admin/universities" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#0D3B2E] hover:underline">
                  Manage Universities <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
            <span className="rounded-md bg-[#FEF3C7] p-2.5 text-[#B45309]">
              <Building2 className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Recent Active Inquiries */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-[#111827]">Recent Active Inquiries</h2>
          <Link to="/admin/inquiries" className="text-xs font-semibold text-[#0D3B2E] hover:underline">
            View All
          </Link>
        </div>
        <DataTable
          columns={columns}
          data={inquiriesRes?.data ?? []}
          isLoading={isLoading}
          emptyMessage="No active inquiries in queue."
        />
      </div>
    </div>
  );
}
