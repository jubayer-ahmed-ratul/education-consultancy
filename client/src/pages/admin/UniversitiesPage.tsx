import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Trash2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { DataTable } from '../../components/admin/DataTable';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/sheet';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-keys';

interface UniversityRecord {
  id: string;
  name: string;
  slug: string;
  countryId: string;
  city: string | null;
  logoUrl: string | null;
  imageUrl: string | null;
  description: string;
  programs: string[];
  englishRequirements: string | null;
  website: string | null;
  tuitionRange: { min: number; max: number; currency: string } | null;
  isPublished: boolean;
  country?: { id: string; name: string };
}

const EMPTY_FORM = {
  name: '',
  slug: '',
  countryId: '',
  city: '',
  logoUrl: '',
  imageUrl: '',
  description: '',
  programsText: '',
  englishRequirements: '',
  website: '',
  tuitionMin: '',
  tuitionMax: '',
  tuitionCurrency: 'USD',
  isPublished: false,
};

export default function UniversitiesPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UniversityRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: countriesRes } = useQuery({
    queryKey: queryKeys.countries.adminList({ page: 1, limit: 100 }),
    queryFn: () => apiRequest<Array<{ id: string; name: string }>>('/countries/admin/list?page=1&limit=100'),
  });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.universities.adminList({ page: 1, limit: 100 }),
    queryFn: () => apiRequest<UniversityRecord[]>('/universities/admin/list?page=1&limit=100'),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editingId
        ? apiRequest(`/universities/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
        : apiRequest('/universities', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      addToast('success', editingId ? 'University updated.' : 'University created.');
      setSheetOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      void queryClient.invalidateQueries({ queryKey: queryKeys.universities.all });
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Save failed.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/universities/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      addToast('success', 'University deleted.');
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.universities.all });
    },
  });

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSheetOpen(true);
  }

  function startEdit(u: UniversityRecord) {
    setEditingId(u.id);
    setForm({
      name: u.name,
      slug: u.slug,
      countryId: u.countryId,
      city: u.city ?? '',
      logoUrl: u.logoUrl ?? '',
      imageUrl: u.imageUrl ?? '',
      description: u.description,
      programsText: u.programs.join(', '),
      englishRequirements: u.englishRequirements ?? '',
      website: u.website ?? '',
      tuitionMin: u.tuitionRange ? String(u.tuitionRange.min) : '',
      tuitionMax: u.tuitionRange ? String(u.tuitionRange.max) : '',
      tuitionCurrency: u.tuitionRange?.currency ?? 'USD',
      isPublished: u.isPublished,
    });
    setSheetOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const hasTuition = form.tuitionMin !== '' && form.tuitionMax !== '';
    saveMutation.mutate({
      name: form.name,
      ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
      countryId: form.countryId,
      city: form.city.trim() || null,
      logoUrl: form.logoUrl.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
      description: form.description,
      programs: form.programsText.split(',').map((s) => s.trim()).filter(Boolean),
      englishRequirements: form.englishRequirements.trim() || null,
      website: form.website.trim() || null,
      tuitionRange: hasTuition
        ? { min: Number(form.tuitionMin), max: Number(form.tuitionMax), currency: form.tuitionCurrency.toUpperCase() }
        : null,
      isPublished: form.isPublished,
    });
  }

  const columns = useMemo<ColumnDef<UniversityRecord, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'University',
        cell: ({ row }) => <span className="font-semibold">{row.original.name}</span>,
      },
      {
        id: 'country',
        header: 'Country',
        accessorFn: (r) => r.country?.name ?? '',
        cell: ({ row }) => <span className="text-xs text-[#4B5563]">{row.original.country?.name ?? '—'}</span>,
      },
      {
        accessorKey: 'city',
        header: 'City',
        cell: ({ row }) => <span className="text-xs text-[#6B7280]">{row.original.city ?? '—'}</span>,
      },
      {
        accessorKey: 'isPublished',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.isPublished ? 'success' : 'secondary'}>
            {row.original.isPublished ? 'Published' : 'Draft'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => startEdit(row.original)}>Edit</Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => setDeleteTarget(row.original)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <Helmet>
        <title>Universities — Zero Compile Admin</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#111827]">Partner Universities</h1>
          <p className="text-xs text-[#6B7280]">Manage partner institution profiles, programs, and tuition ranges.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add University
        </Button>
      </div>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} emptyMessage="No universities added yet." />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingId ? 'Edit University' : 'New University'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-6">
            <Input required placeholder="University Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select required value={form.countryId} onChange={(e) => setForm((f) => ({ ...f, countryId: e.target.value }))}>
                <option value="">Select Country *</option>
                {countriesRes?.data.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
              <Input placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </div>
            <Textarea required rows={3} placeholder="Description *" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <Input placeholder="Programs (comma-separated)" value={form.programsText} onChange={(e) => setForm((f) => ({ ...f, programsText: e.target.value }))} />
            <Input placeholder="English Requirements" value={form.englishRequirements} onChange={(e) => setForm((f) => ({ ...f, englishRequirements: e.target.value }))} />
            <ImageUploadField label="Logo URL" value={form.logoUrl} onChange={(url) => setForm((f) => ({ ...f, logoUrl: url }))} purpose="university-logo" />
            <ImageUploadField label="Cover Image URL" value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} purpose="university-cover" />
            <div className="grid grid-cols-3 gap-2">
              <Input type="number" placeholder="Tuition Min" value={form.tuitionMin} onChange={(e) => setForm((f) => ({ ...f, tuitionMin: e.target.value }))} />
              <Input type="number" placeholder="Tuition Max" value={form.tuitionMax} onChange={(e) => setForm((f) => ({ ...f, tuitionMax: e.target.value }))} />
              <Input maxLength={3} placeholder="USD" value={form.tuitionCurrency} onChange={(e) => setForm((f) => ({ ...f, tuitionCurrency: e.target.value }))} />
            </div>
            <Input type="url" placeholder="Website URL" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} />
                Published
              </label>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save University'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.name}?</DialogTitle>
            <DialogDescription>This permanently removes the university profile.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMutation.isPending} onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
