import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { INQUIRY_STATUSES, type InquiryStatusType } from '@zero-compile/shared';
import { DataTable } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
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

const TAB_FILTERS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All Active' },
  { value: 'new', label: 'New' },
  { value: 'in-review', label: 'In Review' },
  { value: 'documents-requested', label: 'Documents Requested' },
  { value: 'processing', label: 'Processing' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'closed', label: 'Closed' },
];

export default function InquiriesListPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'priority_desc' | 'priority_asc'>('newest');
  const [bulkStatus, setBulkStatus] = useState<InquiryStatusType>('in-review');

  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit), sort });
  if (search.trim()) queryParams.set('search', search.trim());
  if (status) queryParams.set('status', status);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.inquiries.list({ page, limit, search, status, sort }),
    queryFn: () => apiRequest<InquiryRow[]>(`/inquiries?${queryParams.toString()}`),
  });

  const bulkStatusMutation = useMutation({
    mutationFn: async ({ rows, target }: { rows: InquiryRow[]; target: InquiryStatusType }) => {
      await Promise.all(
        rows.map((r) =>
          apiRequest(`/inquiries/${r.id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: target }),
          })
        )
      );
    },
    onSuccess: () => {
      addToast('success', 'Selected inquiries updated.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.inquiries.all });
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Bulk update failed.'),
  });

  const columns = useMemo<ColumnDef<InquiryRow, unknown>[]>(
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
        accessorFn: (r) => `${r.studentFirstName} ${r.studentLastName}`,
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
        id: 'destination',
        header: 'Country',
        accessorFn: (r) => r.preferredCountry?.name ?? '',
        cell: ({ row }) => (
          <span className="text-xs text-gray-600">{row.original.preferredCountry?.name ?? 'â€”'}</span>
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
          <Badge
            variant={row.original.priority === 'urgent' || row.original.priority === 'high' ? 'amber' : 'outline'}
            className="capitalize"
          >
            {row.original.priority}
          </Badge>
        ),
      },
      {
        id: 'counselor',
        header: 'Counselor',
        accessorFn: (r) => r.assignedTo?.name ?? 'Unassigned',
        cell: ({ row }) => (
          <span className="text-xs text-gray-600">{row.original.assignedTo?.name ?? 'Unassigned'}</span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Submitted',
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums text-gray-500">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
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

  return (
    <div className="space-y-5">
      <Helmet>
        <title>Inquiries â€” StudySphere Admin</title>
      </Helmet>

      {/* Filament Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <span>Inquiries</span>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-900">List</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">Inquiries</h1>
        </div>
        <Link to="/apply" target="_blank">
          <Button size="sm">+ New Inquiry</Button>
        </Link>
      </div>

      {/* Filament Horizontal Tabs Bar */}
      <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-white p-1.5 ring-1 ring-gray-950/5 shadow-xs">
        {TAB_FILTERS.map((tab) => {
          const active = status === tab.value;
          return (
            <button
              key={tab.value || 'all'}
              type="button"
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                active
                  ? 'bg-teal-50 text-teal-700 font-semibold ring-1 ring-inset ring-teal-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
              }`}
            >
              <span>{tab.label}</span>
              {active && data?.meta?.total !== undefined && (
                <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-teal-700 ring-1 ring-teal-200">
                  {data.meta.total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        emptyMessage="No matching inquiries found."
        enableSelection
        renderBulkActions={(selectedRows, clearSelection) => (
          <div className="flex items-center gap-2">
            <Select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as InquiryStatusType)}
              className="h-7 w-40 text-xs"
            >
              {INQUIRY_STATUSES.filter((s) =>
                user?.role === 'super-admin' ? true : s !== 'closed' && s !== 'rejected'
              ).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Button
              size="sm"
              className="h-7 px-2.5 text-xs"
              disabled={bulkStatusMutation.isPending}
              onClick={() => {
                bulkStatusMutation.mutate(
                  { rows: selectedRows, target: bulkStatus },
                  { onSuccess: clearSelection }
                );
              }}
            >
              Update status
            </Button>
          </div>
        )}
        toolbar={
          <>
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
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
              <option value="priority_desc">Priority High â†’ Low</option>
              <option value="priority_asc">Priority Low â†’ High</option>
            </Select>
          </>
        }
        pagination={
          data?.meta
            ? {
                page: data.meta.page,
                limit,
                totalPages: data.meta.totalPages,
                total: data.meta.total,
                onPageChange: setPage,
                onLimitChange: (next) => {
                  setLimit(next);
                  setPage(1);
                },
              }
            : undefined
        }
      />
    </div>
  );
}
