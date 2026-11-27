import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { INQUIRY_STATUSES, type InquiryStatusType } from '@zero-compile/shared';
import { DataTable } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { apiRequest } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-keys';

interface InquiryRow {
  id: string;
  referenceNumber: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  category: string;
  priority: string;
  status: InquiryStatusType;
  createdAt: string;
  preferredCountry?: { name: string } | null;
  assignedTo?: { name: string } | null;
}

export default function InquiriesListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'priority_desc' | 'priority_asc'>('newest');

  const queryParams = new URLSearchParams({ page: String(page), limit: '20', sort });
  if (search.trim()) queryParams.set('search', search.trim());
  if (status) queryParams.set('status', status);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.inquiries.list({ page, search, status, sort }),
    queryFn: () => apiRequest<InquiryRow[]>(`/inquiries?${queryParams.toString()}`),
  });

  const columns = useMemo<ColumnDef<InquiryRow, unknown>[]>(
    () => [
      {
        accessorKey: 'referenceNumber',
        header: 'Reference',
        cell: ({ row }) => (
          <Link
            to={`/admin/inquiries/${row.original.id}`}
            className="font-mono font-bold text-[#0D3B2E] hover:underline"
          >
            {row.original.referenceNumber}
          </Link>
        ),
      },
      {
        id: 'student',
        header: 'Applicant',
        accessorFn: (r) => `${r.studentFirstName} ${r.studentLastName}`,
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-[#111827]">
              {row.original.studentFirstName} {row.original.studentLastName}
            </div>
            <div className="text-xs text-[#6B7280]">{row.original.studentEmail}</div>
          </div>
        ),
      },
      {
        id: 'destination',
        header: 'Destination',
        accessorFn: (r) => r.preferredCountry?.name ?? '',
        cell: ({ row }) => (
          <span className="text-xs text-[#4B5563]">{row.original.preferredCountry?.name ?? '—'}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => (
          <Badge variant={row.original.priority === 'urgent' || row.original.priority === 'high' ? 'amber' : 'outline'} className="capitalize">
            {row.original.priority}
          </Badge>
        ),
      },
      {
        id: 'counselor',
        header: 'Counselor',
        accessorFn: (r) => r.assignedTo?.name ?? 'Unassigned',
        cell: ({ row }) => (
          <span className="text-xs text-[#4B5563]">{row.original.assignedTo?.name ?? 'Unassigned'}</span>
        ),
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
            <Button variant="secondary" size="sm">Manage</Button>
          </Link>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <Helmet>
        <title>Inquiries Queue — Zero Compile Admin</title>
      </Helmet>

      <div>
        <h1 className="font-display text-2xl font-bold text-[#111827]">Inquiries Queue</h1>
        <p className="text-xs text-[#6B7280]">
          Active queue excludes <code>closed</code> cases by default unless explicitly filtered.
        </p>
      </div>

      {/* Quick Status Filter Pills */}
      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          variant={status === '' ? 'default' : 'secondary'}
          onClick={() => {
            setStatus('');
            setPage(1);
          }}
        >
          Active (Excl. Closed)
        </Button>
        {INQUIRY_STATUSES.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? 'default' : 'secondary'}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className="capitalize"
          >
            {s}
          </Button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        emptyMessage="No matching inquiries found."
        toolbar={
          <>
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B7280]" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search ZRC-..., name, or email..."
                className="pl-8"
              />
            </div>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="w-44"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority_desc">Priority High → Low</option>
              <option value="priority_asc">Priority Low → High</option>
            </Select>
          </>
        }
        pagination={
          data?.meta
            ? {
                page: data.meta.page,
                totalPages: data.meta.totalPages,
                total: data.meta.total,
                onPageChange: setPage,
              }
            : undefined
        }
      />
    </div>
  );
}
