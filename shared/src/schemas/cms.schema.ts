import { z } from 'zod';
import { cloudinaryImageSchema, slugRegex } from './common.schema';

// --- Blogs ---
export const blogSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().toLowerCase().regex(slugRegex).max(220).optional(),
  excerpt: z.string().trim().min(1).max(500),
  content: z.string().trim().min(1),
  featuredImage: cloudinaryImageSchema.optional().nullable(),
  category: z.string().trim().max(100).default('Study Abroad Guide'),
  author: z.string().trim().max(100).default('StudySphere Editorial Desk'),
  isPublished: z.boolean().default(false),
  publishedAt: z.coerce.date().optional().nullable(),
  seoTitle: z.string().trim().max(100).optional().nullable(),
  seoDescription: z.string().trim().max(255).optional().nullable(),
});
export const updateBlogSchema = blogSchema.partial();

// --- Events ---
export const eventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().toLowerCase().regex(slugRegex).max(220).optional(),
  shortDescription: z.string().trim().min(1).max(500),
  fullDescription: z.string().trim().min(1),
  eventBanner: cloudinaryImageSchema.optional().nullable(),
  eventDate: z.coerce.date(),
  startTime: z.string().trim().max(40).default('10:00 AM'),
  endTime: z.string().trim().max(40).default('02:00 PM'),
  timeZone: z.string().trim().max(60).default('Asia/Dhaka'),
  locationType: z.enum(['in-person', 'online', 'hybrid']).default('in-person'),
  venue: z.string().trim().min(1).max(300),
  registrationUrl: z.string().trim().url().max(2048).optional().nullable(),
  isPublished: z.boolean().default(false),
  seoTitle: z.string().trim().max(100).optional().nullable(),
  seoDescription: z.string().trim().max(255).optional().nullable(),
});
export const updateEventSchema = eventSchema.partial();

// --- Success Stories ---
export const successStorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  title: z.string().trim().max(200).optional().nullable(),
  youtubeUrl: z.string().trim().max(500).optional().nullable(),
  thumbnailUrl: z.string().trim().max(2048).optional().nullable(),
  slug: z.string().trim().toLowerCase().regex(slugRegex).max(220).optional(),
  studentImage: z.string().trim().max(2048).optional().nullable(),
  country: z.string().trim().min(1).max(100),
  countryFlag: z.string().trim().max(10).optional().nullable(),
  university: z.string().trim().min(1).max(150),
  program: z.string().trim().min(1).max(150),
  testimonial: z.string().trim().min(1).max(2000),
  achievement: z.string().trim().max(100).optional().nullable(),
  admissionYear: z.string().trim().max(20).optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),
});
export const updateSuccessStorySchema = successStorySchema.partial();

// --- Gallery Items ---
export const galleryItemSchema = z.object({
  title: z.string().trim().min(1).max(120),
  imageUrl: z.string().trim().min(1).max(2048),
  description: z.string().trim().max(300).optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),
});
export const updateGalleryItemSchema = galleryItemSchema.partial();

// --- Sister Concerns ---
export const sisterConcernSchema = z.object({
  name: z.string().trim().min(1).max(100),
  logoUrl: z.string().trim().min(1).max(2048),
  description: z.string().trim().min(1).max(300),
  websiteUrl: z.string().trim().url().max(2048),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});
export const updateSisterConcernSchema = sisterConcernSchema.partial();

// --- Reorder helper ---
export const reorderDisplayItemsSchema = z.object({
  items: z.array(z.object({ id: z.string().uuid(), displayOrder: z.coerce.number().int().min(0) })).min(1),
});

// --- CMS Singletons ---
export const siteContentAboutSchema = z.object({
  heading: z.string().trim().min(1).max(200),
  highlightTitle: z.string().trim().max(200).optional().nullable(),
  bodyParagraphs: z.array(z.string().trim().max(3000)).max(10).default([]),
  buttonText: z.string().trim().max(60).default('Learn More'),
  buttonLink: z.string().trim().max(200).default('/about'),
  mainImageUrl: z.string().trim().max(2048).optional().nullable(),
  topRightImageUrl: z.string().trim().max(2048).optional().nullable(),
  bottomRightImageUrl: z.string().trim().max(2048).optional().nullable(),
  yearsBadgeText: z.string().trim().max(100).default('10+ Years Experience'),
});

export const aboutPageSchema = z.object({
  whoWeAreTitle: z.string().trim().max(200).default('Who We Are'),
  whoWeAreBody: z.string().trim().max(10000).default(''),
  establishmentYear: z.string().trim().max(20).default('2015'),
  establishmentStory: z.string().trim().max(10000).default(''),
  milestones: z.array(z.object({ year: z.string(), title: z.string(), description: z.string() })).default([]),
  companyOverview: z.string().trim().max(10000).default(''),
  chairmanName: z.string().trim().max(120).default(''),
  chairmanTitle: z.string().trim().max(120).default('Chairman'),
  chairmanPortraitUrl: z.string().trim().max(2048).optional().nullable(),
  chairmanMessage: z.string().trim().max(10000).default(''),
  chairmanSignature: z.string().trim().max(200).optional().nullable(),
  teamMembers: z
    .array(
      z.object({
        name: z.string().trim().max(100),
        designation: z.string().trim().max(120),
        photoUrl: z.string().trim().max(2048).optional().nullable(),
        bio: z.string().trim().max(500).optional().nullable(),
      })
    )
    .default([]),
  whyChooseUs: z
    .array(
      z.object({
        title: z.string().trim().max(120),
        description: z.string().trim().max(500),
        icon: z.string().trim().max(60).optional(),
      })
    )
    .default([]),
  ctaHeading: z.string().trim().max(200).default('Ready to Start Your Global Journey?'),
  ctaButtonText: z.string().trim().max(60).default('Apply Now'),
  ctaButtonLink: z.string().trim().max(200).default('/apply'),
  seoTitle: z.string().trim().max(100).optional().nullable(),
  seoDescription: z.string().trim().max(255).optional().nullable(),
});

export const contactPageSchema = z.object({
  headerTitle: z.string().trim().max(200).default('Contact StudySphere'),
  headerSubtitle: z.string().trim().max(500).default('Speak with our admissions counselors.'),
  address: z.string().trim().max(500).default(''),
  phones: z.array(z.string().trim().max(40)).default([]),
  whatsappNumber: z.string().trim().max(40).optional().nullable(),
  emails: z.array(z.string().trim().email()).default([]),
  officeHours: z.string().trim().max(200).default('Sun–Thu: 10:00 AM – 6:00 PM'),
  socialLinks: z.record(z.string().trim().max(2048)).default({}),
  mapLatitude: z.coerce.number().min(-90).max(90).default(23.8103),
  mapLongitude: z.coerce.number().min(-180).max(180).default(90.4125),
  mapZoom: z.coerce.number().int().min(1).max(20).default(14),
  mapAddress: z.string().trim().max(300).default(''),
  ctaHeading: z.string().trim().max(200).default('Book a Free Consultation'),
  seoTitle: z.string().trim().max(100).optional().nullable(),
  seoDescription: z.string().trim().max(255).optional().nullable(),
});

export const heroContentSchema = z.object({
  heading: z.string().trim().min(1).max(200),
  subheading: z.string().trim().max(200).default(''),
  description: z.string().trim().max(1000).default(''),
  slides: z
    .array(
      z.object({
        imageUrl: z.string().trim().max(2048),
        title: z.string().trim().max(150).optional(),
        subtitle: z.string().trim().max(300).optional(),
      })
    )
    .max(5)
    .default([]),
});

export const heroStatsSchema = z.object({
  stats: z
    .array(
      z.object({
        order: z.coerce.number().int().min(1).max(4),
        label: z.string().trim().min(1).max(100),
        value: z.string().trim().min(1).max(40),
        suffix: z.string().trim().max(20).optional().nullable(),
      })
    )
    .length(4),
});

export const footerSettingSchema = z.object({
  socialLinks: z.record(z.string().trim().max(2048)).default({}),
  featuredCountrySlugs: z.array(z.string().trim().max(120)).max(6).default([]),
});

export const whatsappSettingSchema = z.object({
  phoneNumber: z.string().trim().min(5).max(30),
  defaultMessage: z.string().trim().max(300).optional().nullable(),
  isEnabled: z.boolean().default(true),
});

export const successStoriesPageSettingSchema = z.object({
  heroHeading: z.string().trim().min(1).max(200),
  heroSubtitle: z.string().trim().max(500).default(''),
  ctaHeading: z.string().trim().max(200).default('Write Your Own Success Story'),
  ctaButtonText: z.string().trim().max(60).default('Apply Today'),
  ctaButtonLink: z.string().trim().max(200).default('/apply'),
  seoTitle: z.string().trim().max(100).optional().nullable(),
  seoDescription: z.string().trim().max(255).optional().nullable(),
});

export const gallerySettingSchema = z.object({
  heading: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500).default(''),
  ctaText: z.string().trim().max(60).default('View Full Gallery'),
});
