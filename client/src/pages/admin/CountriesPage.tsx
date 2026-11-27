import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronRight, Plus } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { DataTable } from '../../components/admin/DataTable';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/sheet';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-keys';

interface CountryRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  highlights: string[];
  imageUrl: string | null;
  intakes: string[];
  educationSystem: string | null;
  admissionRequirements: string | null;
  tuitionAndLivingCosts: string | null;
  visaRequirements: string | null;
  scholarshipInfo: string | null;
  isPublished: boolean;
  order: number;
}

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  highlightsText: '',
  intakesText: '',
  imageUrl: '',
  educationSystem: '',
  admissionRequirements: '',
  tuitionAndLivingCosts: '',
  visaRequirements: '',
  scholarshipInfo: '',
  isPublished: false,
  order: 0,
};

export default function CountriesPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CountryRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [createAnother, setCreateAnother] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.countries.adminList({ page: 1, limit: 100 }),
    queryFn: () => apiRequest<CountryRecord[]>('/countries/admin/list?page=1&limit=100'),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editingId
        ? apiRequest(`/countries/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
        : apiRequest('/countries', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      addToast('success', editingId ? 'Country updated.' : 'Country created.');
      setEditingId(null);
      setForm(EMPTY_FORM);
      if (!createAnother) setSheetOpen(false);
      setCreateAnother(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.countries.all });
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Save failed.'),
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      apiRequest(`/countries/${id}`, { method: 'PUT', body: JSON.stringify({ isPublished }) }),
    onSuccess: () => {
      addToast('success', 'Visibility updated.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.countries.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/countries/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      addToast('success', 'Country deleted.');
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.countries.all });
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Delete failed.'),
  });

  const reorderMutation = useMutation({
    mutationFn: (items: Array<{ id: string; order: number }>) =>
      apiRequest('/countries/reorder', { method: 'PUT', body: JSON.stringify({ items }) }),
    onSuccess: () => {
      addToast('success', 'Display order updated.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.countries.all });
    },
  });

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSheetOpen(true);
  }

  function startEdit(c: CountryRecord) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description,
      highlightsText: c.highlights.join(', '),
      intakesText: c.intakes.join(', '),
      imageUrl: c.imageUrl ?? '',
      educationSystem: c.educationSystem ?? '',
      admissionRequirements: c.admissionRequirements ?? '',
      tuitionAndLivingCosts: c.tuitionAndLivingCosts ?? '',
      visaRequirements: c.visaRequirements ?? '',
      scholarshipInfo: c.scholarshipInfo ?? '',
      isPublished: c.isPublished,
      order: c.order,
    });
    setSheetOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    saveMutation.mutate({
      name: form.name,
      ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
      description: form.description,
      highlights: form.highlightsText.split(',').map((s) => s.trim()).filter(Boolean),
      intakes: form.intakesText.split(',').map((s) => s.trim()).filter(Boolean),
      imageUrl: form.imageUrl.trim() || null,
      educationSystem: form.educationSystem.trim() || null,
      admissionRequirements: form.admissionRequirements.trim() || null,
      tuitionAndLivingCosts: form.tuitionAndLivingCosts.trim() || null,
      visaRequirements: form.visaRequirements.trim() || null,
      scholarshipInfo: form.scholarshipInfo.trim() || null,
      isPublished: form.isPublished,
      order: Number(form.order) || 0,
    });
  }

  function moveOrder(index: number, delta: number) {
    const list = data?.data;
    if (!list) return;
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const swapped = [...list];
    const [moved] = swapped.splice(index, 1);
    swapped.splice(targetIdx, 0, moved!);
    reorderMutation.mutate(swapped.map((item, idx) => ({ id: item.id, order: idx + 1 })));
  }

  const columns = useMemo<ColumnDef<CountryRecord, unknown>[]>(
    () => [
      {
        accessorKey: 'order',
        header: 'Order',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <span className="font-mono text-xs tabular-nums text-gray-600">{row.original.order}</span>
            <button type="button" onClick={() => moveOrder(row.index, -1)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-teal-600 cursor-pointer">
              <ArrowUp className="h-3 w-3" />
            </button>
            <button type="button" onClick={() => moveOrder(row.index, 1)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-teal-600 cursor-pointer">
              <ArrowDown className="h-3 w-3" />
            </button>
          </div>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Country',
        cell: ({ row }) => <span className="font-semibold text-gray-950">{row.original.name}</span>,
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ row }) => <code className="text-xs text-gray-500">{row.original.slug}</code>,
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
    [data?.data]
  );

  return (
    <div className="space-y-5">
      <Helmet>
        <title>Countries — Zero Compile Admin</title>
      </Helmet>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <span>Countries</span>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-900">List</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">Countries</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Country
        </Button>
      </div>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} emptyMessage="No countries created yet." />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{editingId ? 'Edit Country' : 'Create Country'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Name *</label>
                  <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Slug (auto if blank)</label>
                  <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Overview Description *</label>
                <Textarea required rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Highlights (comma-separated)</label>
                  <Input value={form.highlightsText} onChange={(e) => setForm((f) => ({ ...f, highlightsText: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Intakes (comma-separated)</label>
                  <Input value={form.intakesText} onChange={(e) => setForm((f) => ({ ...f, intakesText: e.target.value }))} />
                </div>
              </div>

              <ImageUploadField label="Cover Image" value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} purpose="country-cover" />
              {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="h-32 w-full rounded-lg border object-cover" />}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Textarea rows={2} placeholder="Education System" value={form.educationSystem} onChange={(e) => setForm((f) => ({ ...f, educationSystem: e.target.value }))} />
                <Textarea rows={2} placeholder="Admission Requirements" value={form.admissionRequirements} onChange={(e) => setForm((f) => ({ ...f, admissionRequirements: e.target.value }))} />
                <Textarea rows={2} placeholder="Tuition & Living Costs" value={form.tuitionAndLivingCosts} onChange={(e) => setForm((f) => ({ ...f, tuitionAndLivingCosts: e.target.value }))} />
                <Textarea rows={2} placeholder="Visa Requirements" value={form.visaRequirements} onChange={(e) => setForm((f) => ({ ...f, visaRequirements: e.target.value }))} />
              </div>
              <Textarea rows={2} placeholder="Scholarship Info" value={form.scholarshipInfo} onChange={(e) => setForm((f) => ({ ...f, scholarshipInfo: e.target.value }))} />

              <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-950/5 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer">
                  <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} className="h-4 w-4 accent-teal-600" />
                  Published on public portal
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Order</span>
                  <Input type="number" className="w-20" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} />
                </div>
              </div>
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
            <DialogDescription>Countries with linked universities cannot be deleted.</DialogDescription>
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
