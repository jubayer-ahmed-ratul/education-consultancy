export interface CmsImageMeta {
  publicId?: string;
  secureUrl?: string;
  url?: string;
}

export type CmsImageField = CmsImageMeta | string | null | undefined;

export const DEFAULT_BLOG_IMAGE =
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=80';

export const DEFAULT_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80';

const RAW_API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';
const API_ORIGIN = RAW_API_BASE.startsWith('http')
  ? RAW_API_BASE.replace(/\/api\/?$/, '')
  : '';

function extractRawUrl(field: CmsImageField): string | null {
  if (!field) return null;
  if (typeof field === 'string') return field.trim() || null;
  const candidate = field.secureUrl || field.url;
  return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : null;
}

export function resolveMediaUrl(
  item: {
    featuredImage?: CmsImageField;
    eventBanner?: CmsImageField;
    coverImage?: CmsImageField;
    imageUrl?: CmsImageField;
    image?: CmsImageField;
    bannerImage?: CmsImageField;
  },
  fallback: string,
): string {
  const raw =
    extractRawUrl(item.featuredImage) ||
    extractRawUrl(item.eventBanner) ||
    extractRawUrl(item.coverImage) ||
    extractRawUrl(item.imageUrl) ||
    extractRawUrl(item.image) ||
    extractRawUrl(item.bannerImage);

  if (!raw) return fallback;
  if (raw.startsWith('/uploads/')) {
    return `${API_ORIGIN}${raw}`;
  }
  return raw;
}
