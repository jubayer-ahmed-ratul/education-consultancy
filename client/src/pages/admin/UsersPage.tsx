import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { ChevronRight, Plus } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import type { UserRoleType } from '@zero-compile/shared';
import { DataTable } from '../../components/admin/DataTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/sheet';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-keys';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as UserRoleType,
    isActive: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.users.list({ page: 1 }),
    queryFn: () => apiRequest<UserRecord[]>('/users?page=1&limit=50'),
  });

  const createMutation = useMutation({
    mutationFn: () => apiRequest('/users', { method: 'POST', body: JSON.stringify(form) }),
    onSuccess: () => {
      addToast('success', 'Staff user created.');
      setSheetOpen(false);
      setForm({ name: '', email: '', password: '', role: 'admin', isActive: true });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Failed to create user.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      apiRequest(`/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    onSuccess: () => {
      addToast('success', 'User updated.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Update failed.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      addToast('success', 'User removed/deactivated.');
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Action failed.'),
  });

  const columns = useMemo<ColumnDef<UserRecord, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <span className="font-semibold text-gray-950">{row.original.name}</span>,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <span className="text-xs text-gray-600">{row.original.email}</span>,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <Badge variant={row.original.role === 'super-admin' ? 'amber' : 'outline'}>
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Active',
        cell: ({ row }) => (
          <button
            type="button"
            role="switch"
            aria-checked={row.original.isActive}
            onClick={() =>
              updateMutation.mutate({
                id: row.original.id,
                payload: { isActive: !row.original.isActive },
              })
            }
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              row.original.isActive ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition ${
                row.original.isActive ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() =>
                updateMutation.mutate({
                  id: row.original.id,
                  payload: { role: row.original.role === 'admin' ? 'super-admin' : 'admin' },
                })
              }
              className="text-teal-600 hover:text-teal-700 cursor-pointer"
            >
              Toggle role
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(row.original)}
              className="text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createMutation.mutate();
  }

  return (
    <div className="space-y-5">
      <Helmet>
        <title>Team & Roles — Zero Compile Admin</title>
      </Helmet>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <span>Team & Roles</span>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-900">List</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">Team & Roles</h1>
        </div>
        <Button onClick={() => setSheetOpen(true)}>
          <Plus className="h-4 w-4" /> New User
        </Button>
      </div>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create Staff Account</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <Input required placeholder="Full Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Input type="password" required minLength={8} placeholder="Password (min 8 chars)" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            <Select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRoleType }))}>
              <option value="admin">admin (Counselor)</option>
              <option value="super-admin">super-admin</option>
            </Select>
            <Button type="submit" disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? 'Creating...' : 'Create Staff Account'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {deleteTarget?.name}?</DialogTitle>
            <DialogDescription>Users with authored inquiry notes will be deactivated to preserve audit history.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMutation.isPending} onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
