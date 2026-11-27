import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/api-client';
import { queryKeys } from '../lib/query-keys';

export interface PublicBundleData {
  heroContent: {
    heading: string;
    subheading: string;
    description: string;
    slides: Array<{ imageUrl: string; title?: string; subtitle?: string }>;
  } | null;
  heroStats: Array<{ order: number; label: string; value: string; suffix?: string | null }>;
  siteContent: {
    heading: string;
    highlightTitle?: string | null;
    bodyParagraphs: string[];
    buttonText: string;
    buttonLink: string;
    mainImageUrl?: string | null;
    yearsBadgeText: string;
  } | null;
  footerSetting: {
    socialLinks: Record<string, string>;
    featuredCountrySlugs: string[];
  } | null;
  whatsappSetting: {
    phoneNumber: string;
    defaultMessage?: string | null;
    isEnabled: boolean;
  } | null;
  gallerySetting: {
    heading: string;
    description: string;
    ctaText: string;
  } | null;
  successStoriesPageSetting: {
    heroHeading: string;
    heroSubtitle: string;
    ctaHeading: string;
    ctaButtonText: string;
    ctaButtonLink: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
  } | null;
  successStories: Array<{
    id: string;
    name: string;
    title?: string | null;
    slug: string;
    country: string;
    countryFlag?: string | null;
    university: string;
    program: string;
    testimonial: string;
    achievement?: string | null;
    admissionYear?: string | null;
    youtubeUrl?: string | null;
    studentImage?: string | null;
  }>;
  galleryItems: Array<{
    id: string;
    title: string;
    imageUrl: string;
    description?: string | null;
  }>;
  sisterConcerns: Array<{
    id: string;
    name: string;
    logoUrl: string;
    description: string;
    websiteUrl: string;
  }>;
}

export function usePublicBundle() {
  return useQuery({
    queryKey: queryKeys.cms.publicBundle,
    queryFn: async () => {
      const res = await apiRequest<PublicBundleData>('/content/public');
      return res.data;
    },
    staleTime: 60_000,
  });
}
