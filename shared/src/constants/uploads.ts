export const ALLOWED_UPLOAD_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export type AllowedUploadMimeType = (typeof ALLOWED_UPLOAD_MIME_TYPES)[number];

export const UPLOAD_PURPOSE_MAP = {
  'country-cover': 'zero-compile/countries/covers',
  'country-gallery': 'zero-compile/countries/gallery',
  'university-logo': 'zero-compile/universities/logos',
  'university-cover': 'zero-compile/universities/covers',
  'university-gallery': 'zero-compile/universities/gallery',
  'blog-featured': 'zero-compile/blogs',
  'event-banner': 'zero-compile/events',
  'success-story': 'zero-compile/success-stories',
  'gallery-item': 'zero-compile/gallery',
  'sister-concern': 'zero-compile/sister-concerns',
  'cms-hero': 'zero-compile/cms/hero',
  'cms-about': 'zero-compile/cms/about',
  'cms-team': 'zero-compile/cms/team',
  'cms-chairman': 'zero-compile/cms/chairman',
} as const;

export type UploadPurpose = keyof typeof UPLOAD_PURPOSE_MAP;
