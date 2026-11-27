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
import { Select } from '../../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/sheet';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-keys';

export type CmsCollectionKind = 'blogs' | 'events' | 'success-stories' | 'gallery' | 'sister-concerns';

const TITLES: Record<CmsCollectionKind, string> = {
  blogs: 'Blogs & Study Guides',
  events: 'Educational Events',
  'success-stories': 'Student Success Stories',
  gallery: 'Media Gallery Items',
  'sister-concerns': 'Sister Concerns',
};

export default function CmsCollectionsPage({ kind }: { kind: CmsCollectionKind }) {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const endpoint = `/admin/content/${kind}`;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Record<string, unknown> | null>(null);
  const [formState, setFormState] = useState<Record<string, unknown>>({});

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.cms.section(kind),
    queryFn: () => apiRequest<Array<Record<string, unknown>>>(endpoint),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editingId
        ? apiRequest(`${endpoint}/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
        : apiRequest(endpoint, { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      addToast('success', 'Saved successfully.');
      setSheetOpen(false);
      setEditingId(null);
      setFormState({});
      void queryClient.invalidateQueries({ queryKey: queryKeys.cms.section(kind) });
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Save failed.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`${endpoint}/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      addToast('success', 'Deleted successfully.');
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.cms.section(kind) });
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Delete failed.'),
  });

  const reorderStoriesMutation = useMutation({
    mutationFn: (items: Array<{ id: string; displayOrder: number }>) =>
      apiRequest('/admin/content/success-stories/reorder', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      }),
    onSuccess: () => {
      addToast('success', 'Stories reordered.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.cms.section(kind) });
    },
  });

  function val(key: string, fallback = ''): string {
    const v = formState[key];
    return typeof v === 'string' ? v : v != null ? String(v) : fallback;
  }

  function boolVal(key: string, fallback = false): boolean {
    const v = formState[key];
    return typeof v === 'boolean' ? v : fallback;
  }

  function setField(key: string, value: unknown) {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }

  function openCreate() {
    setEditingId(null);
    setFormState({});
    setSheetOpen(true);
  }

  function startEdit(item: Record<string, unknown>) {
    setEditingId(String(item.id));
    if (kind === 'events' && item.eventDate) {
      setFormState({
        ...item,
        eventDate: String(item.eventDate).slice(0, 10),
        locationType: item.locationType === 'in_person' ? 'in-person' : item.locationType,
      });
    } else {
      setFormState({ ...item });
    }
    setSheetOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = { ...formState };
    delete payload.id;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.createdById;
    delete payload.updatedById;

    if (kind === 'events' && typeof payload.eventDate === 'string') {
      payload.eventDate = new Date(payload.eventDate).toISOString();
    }
    if (kind === 'success-stories' || kind === 'gallery' || kind === 'sister-concerns') {
      payload.displayOrder = Number(payload.displayOrder ?? 0);
    }
    saveMutation.mutate(payload);
  }

  function moveStory(index: number, delta: number) {
    const list = data?.data;
    if (!list) return;
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const swapped = [...list];
    const [moved] = swapped.splice(index, 1);
    swapped.splice(targetIdx, 0, moved!);
    reorderStoriesMutation.mutate(
      swapped.map((item, idx) => ({ id: String(item.id), displayOrder: idx + 1 }))
    );
  }

  const columns = useMemo<ColumnDef<Record<string, unknown>, unknown>[]>(
    () => [
      {
        id: 'title',
        header: 'Title / Name',
        accessorFn: (r) => String(r.title ?? r.name ?? ''),
        cell: ({ row }) => (
          <span className="font-semibold text-[#111827]">
            {String(row.original.title ?? row.original.name)}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessorFn: (r) => (r.isPublished ? 'Published' : 'Draft'),
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
          <div className="flex justify-end gap-1.5">
            {kind === 'success-stories' && (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveStory(row.index, -1)}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveStory(row.index, 1)}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
            <Button variant="secondary" size="sm" onClick={() => startEdit(row.original)}>Edit</Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => setDeleteTarget(row.original)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [kind, data?.data]
  );

  return (
    <div className="space-y-4">
      <Helmet>
        <title>{TITLES[kind]} — Zero Compile Admin</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#111827]">{TITLES[kind]}</h1>
          <p className="text-xs text-[#6B7280]">Create, edit, publish, and organize CMS entries.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Create New
        </Button>
      </div>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingId ? `Edit ${TITLES[kind]}` : `New ${TITLES[kind]}`}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-6">
            {kind === 'blogs' && (
              <>
                <Input required placeholder="Blog Title *" value={val('title')} onChange={(e) => setField('title', e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Category" value={val('category', 'Study Abroad Guide')} onChange={(e) => setField('category', e.target.value)} />
                  <Input placeholder="Author" value={val('author', 'Zero Compile Editorial Desk')} onChange={(e) => setField('author', e.target.value)} />
                </div>
                <Input required placeholder="Excerpt *" value={val('excerpt')} onChange={(e) => setField('excerpt', e.target.value)} />
                <Textarea required rows={6} placeholder="Full Content *" value={val('content')} onChange={(e) => setField('content', e.target.value)} />
              </>
            )}

            {kind === 'events' && (
              <>
                <Input required placeholder="Event Title *" value={val('title')} onChange={(e) => setField('title', e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Input type="date" required value={val('eventDate')} onChange={(e) => setField('eventDate', e.target.value)} />
                  <Select value={val('locationType', 'in-person')} onChange={(e) => setField('locationType', e.target.value)}>
                    <option value="in-person">in-person</option>
                    <option value="online">online</option>
                    <option value="hybrid">hybrid</option>
                  </Select>
                </div>
                <Input required placeholder="Venue *" value={val('venue')} onChange={(e) => setField('venue', e.target.value)} />
                <Input type="url" placeholder="Registration URL" value={val('registrationUrl')} onChange={(e) => setField('registrationUrl', e.target.value || null)} />
                <Input required placeholder="Short Description *" value={val('shortDescription')} onChange={(e) => setField('shortDescription', e.target.value)} />
                <Textarea required rows={4} placeholder="Full Description *" value={val('fullDescription')} onChange={(e) => setField('fullDescription', e.target.value)} />
              </>
            )}

            {kind === 'success-stories' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Input required placeholder="Student Name *" value={val('name')} onChange={(e) => setField('name', e.target.value)} />
                  <Input required placeholder="Country *" value={val('country')} onChange={(e) => setField('country', e.target.value)} />
                  <Input required placeholder="University *" value={val('university')} onChange={(e) => setField('university', e.target.value)} />
                  <Input required placeholder="Program *" value={val('program')} onChange={(e) => setField('program', e.target.value)} />
                </div>
                <Input placeholder="Achievement" value={val('achievement')} onChange={(e) => setField('achievement', e.target.value)} />
                <Input placeholder="YouTube URL" value={val('youtubeUrl')} onChange={(e) => setField('youtubeUrl', e.target.value)} />
                <ImageUploadField label="Student Photo" value={val('studentImage')} onChange={(u) => setField('studentImage', u)} purpose="success-story" />
                <Textarea required rows={4} placeholder="Testimonial *" value={val('testimonial')} onChange={(e) => setField('testimonial', e.target.value)} />
              </>
            )}

            {kind === 'gallery' && (
              <>
                <Input required placeholder="Title *" value={val('title')} onChange={(e) => setField('title', e.target.value)} />
                <ImageUploadField label="Image URL *" value={val('imageUrl')} onChange={(u) => setField('imageUrl', u)} purpose="gallery-item" />
                {val('imageUrl') && <img src={val('imageUrl')} alt="Preview" className="h-32 w-full rounded border object-cover" />}
                <Input placeholder="Description" value={val('description')} onChange={(e) => setField('description', e.target.value)} />
              </>
            )}

            {kind === 'sister-concerns' && (
              <>
                <Input required placeholder="Company Name *" value={val('name')} onChange={(e) => setField('name', e.target.value)} />
                <Input type="url" required placeholder="Website URL *" value={val('websiteUrl')} onChange={(e) => setField('websiteUrl', e.target.value)} />
                <ImageUploadField label="Logo URL *" value={val('logoUrl')} onChange={(u) => setField('logoUrl', u)} purpose="sister-concern" />
                <Input required placeholder="Description *" value={val('description')} onChange={(e) => setField('description', e.target.value)} />
              </>
            )}

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={boolVal('isPublished', kind === 'sister-concerns')}
                  onChange={(e) => setField('isPublished', e.target.checked)}
                />
                Published
              </label>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save Entry'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete entry?</DialogTitle>
            <DialogDescription>This permanently deletes the selected CMS item.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(String(deleteTarget.id))}
            >
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
