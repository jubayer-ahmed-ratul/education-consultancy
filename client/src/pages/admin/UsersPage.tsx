import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Trash2 } from 'lucide-react';
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
        cell: ({ row }) => <span className="font-semibold">{row.original.name}</span>,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <span className="text-xs text-[#4B5563]">{row.original.email}</span>,
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
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'success' : 'destructive'}>
            {row.original.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => updateMutation.mutate({ id: row.original.id, payload: { isActive: !row.original.isActive } })}
            >
              {row.original.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateMutation.mutate({
                  id: row.original.id,
                  payload: { role: row.original.role === 'admin' ? 'super-admin' : 'admin' },
                })
              }
            >
              Toggle Role
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => setDeleteTarget(row.original)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
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
    <div className="space-y-4">
      <Helmet>
        <title>Staff Users — Zero Compile Admin</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#111827]">Staff & Administrator Accounts</h1>
          <p className="text-xs text-[#6B7280]">Manage counselor access and Super Admin privileges.</p>
        </div>
        <Button onClick={() => setSheetOpen(true)}>
          <Plus className="h-4 w-4" /> New Staff User
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
