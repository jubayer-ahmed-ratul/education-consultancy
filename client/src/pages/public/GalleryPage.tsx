import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { usePublicBundle } from '../../hooks/usePublicBundle';

export default function GalleryPage() {
  const { data: bundle, isLoading } = usePublicBundle();
  const settings = bundle?.gallerySetting;
  const items = bundle?.galleryItems ?? [];
  const [selected, setSelected] = useState<{
    title: string;
    imageUrl: string;
    description?: string | null;
  } | null>(null);

  return (
    <div className="mx-auto max-w-11/12 space-y-8 px-4 py-10 sm:px-6">
      <Helmet>
        <title>{settings?.heading || 'Gallery'} â€” StudySphere</title>
      </Helmet>

      <div className="space-y-1 border-b border-zinc-200 pb-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700">
          <ImageIcon className="h-3.5 w-3.5" /> Campus & Events
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-950">
          {settings?.heading || 'Media Gallery'}
        </h1>
        <p className="text-sm text-zinc-700">{settings?.description}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[16/10] animate-pulse rounded-xl bg-zinc-200/70" />
          ))}
        </div>
      ) : !items.length ? (
        <div className="rounded-xl bg-white p-10 text-center text-sm text-zinc-600 ring-1 ring-zinc-950/10">
          No gallery items published yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              className="group overflow-hidden rounded-xl bg-white text-left ring-1 ring-zinc-950/10 transition-all hover:ring-teal-600/40 hover:shadow-sm cursor-pointer"
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-zinc-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="space-y-1 p-4">
                <div className="font-display text-sm font-bold text-zinc-950">{item.title}</div>
                {item.description && <div className="text-xs text-zinc-600">{item.description}</div>}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Radix Lightbox Dialog */}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{selected?.title || 'Image Preview'}</DialogTitle>
          </DialogHeader>
          {selected && (
            <>
              <img
                src={selected.imageUrl}
                alt={selected.title}
                className="max-h-[75vh] w-full bg-zinc-950 object-contain"
              />
              <div className="p-4">
                <div className="font-display font-bold text-zinc-950">{selected.title}</div>
                {selected.description && (
                  <p className="mt-1 text-xs text-zinc-700">{selected.description}</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
