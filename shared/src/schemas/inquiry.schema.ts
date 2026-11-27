import { z } from 'zod';
import {
  INQUIRY_CATEGORIES,
  INQUIRY_PRIORITIES,
  INQUIRY_STATUSES,
  INTAKE_SEMESTERS,
} from '../constants/inquiry-fsm';

export const publicSubmitInquirySchema = z
  .object({
    student: z.object({
      firstName: z.string().trim().min(1, 'First name is required').max(50),
      lastName: z.string().trim().min(1, 'Last name is required').max(50),
      email: z.string().trim().toLowerCase().email('Please provide a valid student email address'),
      phone: z.string().trim().max(30).optional().nullable(),
      nationality: z.string().trim().max(50).optional().nullable(),
    }),
    academic: z.object({
      currentEducationLevel: z.string().trim().min(1, 'Current education level is required').max(100),
      fieldOfStudy: z.string().trim().max(100).optional().nullable(),
      gpa: z.string().trim().max(20).optional().nullable(),
      englishProficiency: z.string().trim().max(100).optional().nullable(),
    }),
    preferredCountry: z.string().uuid('Invalid country ID').optional().nullable(),
    preferredUniversity: z.string().uuid('Invalid university ID').optional().nullable(),
    intendedProgram: z.string().trim().max(150).optional().nullable(),
    intakeYear: z.coerce.number().int().min(2020).max(2050).optional().nullable(),
    intakeSemester: z.enum(INTAKE_SEMESTERS).optional().nullable(),
    category: z.enum(INQUIRY_CATEGORIES).default('general'),
    message: z
      .string()
      .trim()
      .min(10, 'Message must be at least 10 characters')
      .max(3000, 'Message cannot exceed 3000 characters'),
  })
  .strict(); // Strictly forbids client-supplied status, priority, referenceNumber, assignedTo, notes, documents

export const updateInquiryStatusSchema = z.object({
  status: z.enum(INQUIRY_STATUSES),
});

export const addInquiryNoteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Note content is required')
    .max(5000, 'Note cannot exceed 5000 characters'),
});

export const assignInquirySchema = z.object({
  assignedTo: z.string().uuid('Valid counselor user ID is required'),
});

export const inquiryListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(INQUIRY_STATUSES).optional(),
  priority: z.enum(INQUIRY_PRIORITIES).optional(),
  category: z.enum(INQUIRY_CATEGORIES).optional(),
  assignedTo: z.string().uuid().optional(),
  preferredCountry: z.string().uuid().optional(),
  preferredUniversity: z.string().uuid().optional(),
  search: z.string().trim().max(120).optional(),
  sort: z.enum(['newest', 'oldest', 'priority_desc', 'priority_asc']).default('newest'),
});

export type PublicSubmitInquiryInput = z.infer<typeof publicSubmitInquirySchema>;
export type UpdateInquiryStatusInput = z.infer<typeof updateInquiryStatusSchema>;
export type AddInquiryNoteInput = z.infer<typeof addInquiryNoteSchema>;
export type AssignInquiryInput = z.infer<typeof assignInquirySchema>;
export type InquiryListQuery = z.infer<typeof inquiryListQuerySchema>;
