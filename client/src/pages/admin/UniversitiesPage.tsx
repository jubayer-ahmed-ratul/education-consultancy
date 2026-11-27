import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { ChevronRight, Plus } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { DataTable } from '../../components/admin/DataTable';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
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
  const [createAnother, setCreateAnother] = useState(false);

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
      setEditingId(null);
      setForm(EMPTY_FORM);
      if (!createAnother) setSheetOpen(false);
      setCreateAnother(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.universities.all });
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Save failed.'),
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      apiRequest(`/universities/${id}`, { method: 'PUT', body: JSON.stringify({ isPublished }) }),
    onSuccess: () => {
      addToast('success', 'Visibility updated.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.universities.all });
    },
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
        cell: ({ row }) => <span className="font-semibold text-gray-950">{row.original.name}</span>,
      },
      {
        id: 'country',
        header: 'Country',
        accessorFn: (r) => r.country?.name ?? '',
        cell: ({ row }) => <span className="text-xs text-gray-600">{row.original.country?.name ?? '—'}</span>,
      },
      {
        accessorKey: 'city',
        header: 'City',
        cell: ({ row }) => <span className="text-xs text-gray-500">{row.original.city ?? '—'}</span>,
      },
      {
        accessorKey: 'isPublished',
        header: 'Published',
        cell: ({ row }) => (
          <button
            type="button"
            role="switch"
            aria-checked={row.original.isPublished}
            onClick={() =>
              togglePublishMutation.mutate({
                id: row.original.id,
                isPublished: !row.original.isPublished,
              })
            }
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              row.original.isPublished ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition ${
                row.original.isPublished ? 'translate-x-4' : 'translate-x-0'
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
            <button type="button" onClick={() => startEdit(row.original)} className="text-teal-600 hover:text-teal-700 cursor-pointer">
              Edit
            </button>
            <button type="button" onClick={() => setDeleteTarget(row.original)} className="text-rose-600 hover:text-rose-700 cursor-pointer">
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <Helmet>
        <title>Universities — Zero Compile Admin</title>
      </Helmet>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <span>Universities</span>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-900">List</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">Universities</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New University
        </Button>
      </div>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} emptyMessage="No universities added yet." />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{editingId ? 'Edit University' : 'Create University'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
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
              <label className="flex items-center gap-2 rounded-xl bg-gray-50 p-4 ring-1 ring-gray-950/5 text-sm font-medium cursor-pointer">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} className="h-4 w-4 accent-teal-600" />
                Published on public portal
              </label>
            </div>
            <div className="flex items-center justify-end gap-2.5 border-t border-gray-950/5 bg-gray-50 px-6 py-4">
              <Button type="button" variant="secondary" onClick={() => setSheetOpen(false)}>Cancel</Button>
              {!editingId && (
                <Button type="submit" variant="secondary" disabled={saveMutation.isPending} onClick={() => setCreateAnother(true)}>
                  Save & create another
                </Button>
              )}
              <Button type="submit" disabled={saveMutation.isPending} onClick={() => setCreateAnother(false)}>
                {saveMutation.isPending ? 'Saving...' : 'Save changes'}
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
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
