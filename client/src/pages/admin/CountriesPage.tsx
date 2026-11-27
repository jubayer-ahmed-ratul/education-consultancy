import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { DataTable } from '../../components/admin/DataTable';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import { Badge } from '../../components/ui/badge';
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
      addToast('success', editingId ? 'Destination updated.' : 'Destination created.');
      setSheetOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      void queryClient.invalidateQueries({ queryKey: queryKeys.countries.all });
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Save failed.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/countries/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      addToast('success', 'Destination deleted.');
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
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs">{row.original.order}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveOrder(row.index, -1)}>
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveOrder(row.index, 1)}>
              <ArrowDown className="h-3 w-3" />
            </Button>
          </div>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Country',
        cell: ({ row }) => <span className="font-semibold text-[#111827]">{row.original.name}</span>,
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ row }) => <code className="text-xs text-[#6B7280]">{row.original.slug}</code>,
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
            <Button variant="secondary" size="sm" onClick={() => startEdit(row.original)}>
              Edit
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => setDeleteTarget(row.original)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [data?.data]
  );

  return (
    <div className="space-y-4">
      <Helmet>
        <title>Destinations — Zero Compile Admin</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#111827]">Study Destinations</h1>
          <p className="text-xs text-[#6B7280]">Manage country profiles, requirements, and display order.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Destination
        </Button>
      </div>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} emptyMessage="No destinations created yet." />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingId ? 'Edit Destination' : 'New Destination'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-6">
            <div className="grid grid-cols-2 gap-3">
              <Input required placeholder="Country Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <Input placeholder="Slug (auto if blank)" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            </div>
            <Textarea required rows={3} placeholder="Description *" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <Input placeholder="Highlights (comma-separated)" value={form.highlightsText} onChange={(e) => setForm((f) => ({ ...f, highlightsText: e.target.value }))} />
            <Input placeholder="Intakes (comma-separated)" value={form.intakesText} onChange={(e) => setForm((f) => ({ ...f, intakesText: e.target.value }))} />
            <ImageUploadField label="Cover Image" value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} purpose="country-cover" />
            {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="h-28 w-full rounded border object-cover" />}
            <Textarea rows={2} placeholder="Education System" value={form.educationSystem} onChange={(e) => setForm((f) => ({ ...f, educationSystem: e.target.value }))} />
            <Textarea rows={2} placeholder="Admission Requirements" value={form.admissionRequirements} onChange={(e) => setForm((f) => ({ ...f, admissionRequirements: e.target.value }))} />
            <Textarea rows={2} placeholder="Tuition & Living Costs" value={form.tuitionAndLivingCosts} onChange={(e) => setForm((f) => ({ ...f, tuitionAndLivingCosts: e.target.value }))} />
            <Textarea rows={2} placeholder="Visa Requirements" value={form.visaRequirements} onChange={(e) => setForm((f) => ({ ...f, visaRequirements: e.target.value }))} />
            <Textarea rows={2} placeholder="Scholarship Info" value={form.scholarshipInfo} onChange={(e) => setForm((f) => ({ ...f, scholarshipInfo: e.target.value }))} />
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} />
                Published
              </label>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save Destination'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.name}?</DialogTitle>
            <DialogDescription>This action cannot be undone. Destinations with linked universities cannot be deleted.</DialogDescription>
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
