import { z } from 'zod';

export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const uuidOrSlugSchema = z.string().trim().min(1).max(160);
export const uuidSchema = z.string().uuid('Invalid identifier format');

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
});

export const cloudinaryImageSchema = z.object({
  publicId: z.string().trim().min(1).max(300),
  secureUrl: z.string().url().max(2048),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  format: z.string().trim().max(20).optional(),
});

export type CloudinaryImageMeta = z.infer<typeof cloudinaryImageSchema>;
