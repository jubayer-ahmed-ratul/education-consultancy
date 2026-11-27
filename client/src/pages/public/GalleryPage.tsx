import { useState } from 'react';
import { X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { usePublicBundle } from '../../hooks/usePublicBundle';

export default function GalleryPage() {
  const { data: bundle, isLoading } = usePublicBundle();
  const settings = bundle?.gallerySetting;
  const items = bundle?.galleryItems ?? [];
  const [selected, setSelected] = useState<{ title: string; imageUrl: string; description?: string | null } | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-8">
      <Helmet>
        <title>{settings?.heading || 'Gallery'} — Zero Compile</title>
      </Helmet>

      <div className="border-b border-[#E5E2DC] pb-6 space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706]">Campus & Events</span>
        <h1 className="font-display text-3xl font-bold text-[#111827]">{settings?.heading || 'Media Gallery'}</h1>
        <p className="text-sm text-[#4B5563]">{settings?.description}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[16/10] animate-pulse rounded-lg bg-[#F3F1EC]" />
          ))}
        </div>
      ) : !items.length ? (
        <div className="rounded-lg border border-[#E5E2DC] bg-white p-10 text-center text-sm text-[#6B7280]">
          No gallery items published yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              className="group text-left rounded-lg border border-[#E5E2DC] bg-white overflow-hidden transition-all hover:border-[#CFCAC0] hover:shadow-sm"
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-[#F3F1EC]">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <div className="p-4 space-y-1">
                <div className="font-display font-semibold text-sm text-[#111827]">{item.title}</div>
                {item.description && <div className="text-xs text-[#6B7280]">{item.description}</div>}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Clean Lightbox Modal */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full rounded-lg bg-white overflow-hidden shadow-xl"
          >
            <button
              type="button"
              aria-label="Close preview"
              onClick={() => setSelected(null)}
              className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-[#111827] shadow"
            >
              <X className="h-4 w-4" />
            </button>
            <img src={selected.imageUrl} alt={selected.title} className="max-h-[75vh] w-full object-contain bg-black" />
            <div className="p-4">
              <div className="font-display font-bold text-[#111827]">{selected.title}</div>
              {selected.description && <p className="mt-1 text-xs text-[#4B5563]">{selected.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
