import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { DataTable } from '../../components/admin/DataTable';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { apiRequest } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-keys';

interface AuditRow {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
  performedBy?: { name: string; email: string; role: string } | null;
}

export default function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');

  const params = new URLSearchParams({ page: String(page), limit: '25' });
  if (entityType) params.set('entityType', entityType);
  if (action.trim()) params.set('action', action.trim());

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.activityLogs.list({ page, entityType, action }),
    queryFn: () => apiRequest<AuditRow[]>(`/activity-logs?${params.toString()}`),
  });

  const columns = useMemo<ColumnDef<AuditRow, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Timestamp',
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums text-gray-500 whitespace-nowrap">
            {new Date(row.original.createdAt).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => <code className="text-xs font-semibold text-teal-700">{row.original.action}</code>,
      },
      {
        accessorKey: 'entityType',
        header: 'Entity',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Badge variant="outline">{row.original.entityType}</Badge>
            <span className="font-mono text-[11px] text-gray-400">{row.original.entityId.slice(0, 8)}</span>
          </div>
        ),
      },
      {
        id: 'actor',
        header: 'Actor',
        accessorFn: (r) => r.performedBy?.email ?? 'Public / System',
        cell: ({ row }) => (
          <span className="text-xs text-gray-600">{row.original.performedBy?.email ?? 'Public / System'}</span>
        ),
      },
      {
        id: 'details',
        header: 'Redacted Details',
        enableSorting: false,
        cell: ({ row }) => (
          <code className="block max-w-md truncate text-[11px] text-gray-500">
            {JSON.stringify(row.original.details)}
          </code>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <Helmet>
        <title>Activity Logs — Zero Compile Admin</title>
      </Helmet>

      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <span>Activity Logs</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-900">List</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-950">Activity Logs</h1>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        toolbar={
          <>
            <Select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value);
                setPage(1);
              }}
              className="w-44"
            >
              <option value="">All Entities</option>
              <option value="inquiry">inquiry</option>
              <option value="country">country</option>
              <option value="university">university</option>
              <option value="user">user</option>
            </Select>
            <Input
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by action (e.g. inquiry.created)"
              className="max-w-xs"
            />
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
