import { z } from 'zod';
import { USER_ROLES } from '../constants/rbac';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().toLowerCase().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  role: z.enum(USER_ROLES).default('admin'),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  password: z.string().min(8).max(128).optional(),
  role: z.enum(USER_ROLES).optional(),
  isActive: z.boolean().optional(),
});

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(USER_ROLES).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  search: z.string().trim().max(100).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
