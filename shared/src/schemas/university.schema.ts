import { z } from 'zod';
import { slugRegex } from './common.schema';

export const tuitionRangeSchema = z
  .object({
    min: z.coerce.number().min(0),
    max: z.coerce.number().min(0),
    currency: z.string().trim().toUpperCase().length(3).default('USD'),
  })
  .refine((data) => data.max >= data.min, {
    message: 'Maximum tuition must be greater than or equal to minimum tuition',
    path: ['max'],
  });

export const createUniversitySchema = z.object({
  name: z.string().trim().min(1, 'University name is required').max(150),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(slugRegex, 'Slug must be lowercase alphanumeric with single hyphens')
    .max(160)
    .optional(),
  countryId: z.string().uuid('Valid country ID is required'),
  city: z.string().trim().max(100).optional().nullable(),
  logoUrl: z.string().trim().max(2048).optional().nullable(),
  imageUrl: z.string().trim().max(2048).optional().nullable(),
  images: z.array(z.string().trim().max(2048)).max(10).default([]),
  description: z.string().trim().min(1, 'Description is required').max(5000),
  programs: z.array(z.string().trim().max(150)).max(50).default([]),
  admissionRequirements: z.string().trim().max(10000).optional().nullable(),
  englishRequirements: z.string().trim().max(2000).optional().nullable(),
  scholarshipDetails: z.string().trim().max(10000).optional().nullable(),
  applicationDeadlines: z.string().trim().max(2000).optional().nullable(),
  website: z.string().trim().url('Valid website URL is required').max(2048).optional().nullable(),
  tuitionRange: tuitionRangeSchema.optional().nullable(),
  isPublished: z.boolean().default(false),
});

export const updateUniversitySchema = createUniversitySchema.partial();

export const universityListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  country: z.string().trim().max(160).optional(),
  search: z.string().trim().max(150).optional(),
});

export type CreateUniversityInput = z.infer<typeof createUniversitySchema>;
export type UpdateUniversityInput = z.infer<typeof updateUniversitySchema>;
