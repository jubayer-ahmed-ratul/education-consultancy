import { z } from 'zod';
import { slugRegex } from './common.schema';

const safeImageUrl = z.string().trim().max(2048).optional().nullable();

export const createCountrySchema = z.object({
  name: z.string().trim().min(1, 'Country name is required').max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(slugRegex, 'Slug must be lowercase alphanumeric with single hyphens')
    .max(120)
    .optional(),
  description: z.string().trim().min(1, 'Description is required').max(5000),
  highlights: z.array(z.string().trim().max(200)).max(20).default([]),
  imageUrl: safeImageUrl,
  images: z.array(z.string().trim().max(2048)).max(20).default([]),
  educationSystem: z.string().trim().max(10000).optional().nullable(),
  admissionRequirements: z.string().trim().max(10000).optional().nullable(),
  tuitionAndLivingCosts: z.string().trim().max(10000).optional().nullable(),
  visaRequirements: z.string().trim().max(10000).optional().nullable(),
  intakes: z.array(z.string().trim().max(100)).max(20).default([]),
  scholarshipInfo: z.string().trim().max(10000).optional().nullable(),
  isPublished: z.boolean().default(false),
  order: z.coerce.number().int().min(0).default(0),
});

export const updateCountrySchema = createCountrySchema.partial();

export const reorderCountriesSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        order: z.coerce.number().int().min(0),
      })
    )
    .min(1),
});

export type CreateCountryInput = z.infer<typeof createCountrySchema>;
export type UpdateCountryInput = z.infer<typeof updateCountrySchema>;
export type ReorderCountriesInput = z.infer<typeof reorderCountriesSchema>;
