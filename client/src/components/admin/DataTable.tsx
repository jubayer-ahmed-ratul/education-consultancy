import { useState, type ReactNode } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronLeft, ChevronRight, Columns3 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Select } from '../ui/select';
import { Skeleton } from '../ui/skeleton';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
  toolbar?: ReactNode;
  enableSelection?: boolean;
  renderBulkActions?: (selectedRows: TData[], clearSelection: () => void) => ReactNode;
  pagination?: {
    page: number;
    limit?: number;
    totalPages: number;
    total: number;
    onPageChange: (nextPage: number) => void;
    onLimitChange?: (nextLimit: number) => void;
  };
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No records found.',
  toolbar,
  enableSelection = false,
  renderBulkActions,
  pagination,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const finalColumns: ColumnDef<TData, unknown>[] = enableSelection
    ? [
        {
          id: 'select',
          enableSorting: false,
          enableHiding: false,
          header: ({ table }) => (
            <input
              type="checkbox"
              aria-label="Select all rows"
              checked={table.getIsAllPageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
              className="h-4 w-4 rounded border-zinc-300 accent-teal-600 cursor-pointer"
            />
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              aria-label="Select row"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              className="h-4 w-4 rounded border-zinc-300 accent-teal-600 cursor-pointer"
            />
          ),
        },
        ...columns,
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: finalColumns,
    state: { sorting, columnVisibility, rowSelection },
    enableRowSelection: enableSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const limit = pagination?.limit ?? 20;
  const startIdx = pagination && pagination.total > 0 ? (pagination.page - 1) * limit + 1 : 0;
  const endIdx = pagination ? Math.min(pagination.page * limit, pagination.total) : data.length;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {selectedRows.length > 0 && renderBulkActions ? (
            <div className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
              <span className="tabular-nums">{selectedRows.length} selected</span>
              {renderBulkActions(selectedRows, () => setRowSelection({}))}
            </div>
          ) : null}
          {toolbar}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm">
              <Columns3 className="h-3.5 w-3.5 text-zinc-700" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(Boolean(value))}
                  className="capitalize text-zinc-950"
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-11 w-full bg-zinc-100" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    return (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-950 whitespace-nowrap"
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="inline-flex items-center gap-1 hover:text-teal-700 cursor-pointer"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <ArrowUpDown className="h-3 w-3 text-zinc-600" />
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={finalColumns.length} className="px-4 py-12 text-center text-sm font-medium text-zinc-600">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`transition-colors hover:bg-zinc-50 ${
                      row.getIsSelected() ? 'bg-teal-50/50' : ''
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5 align-middle text-sm text-zinc-950">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {pagination && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-700">
          <div className="tabular-nums">
            Showing <strong className="font-bold text-zinc-950">{startIdx}</strong> to{' '}
            <strong className="font-bold text-zinc-950">{endIdx}</strong> of{' '}
            <strong className="font-bold text-zinc-950">{pagination.total}</strong> results
          </div>

          <div className="flex items-center gap-3">
            {pagination.onLimitChange && (
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-zinc-700">Per page</span>
                <Select
                  value={String(limit)}
                  onChange={(e) => pagination.onLimitChange?.(Number(e.target.value))}
                  className="h-8 w-20 text-xs"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </Select>
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                  className="h-8 px-2"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="px-2 font-semibold text-zinc-950 tabular-nums">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                  className="h-8 px-2"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
