import { z } from 'zod';

export const trackInquirySchema = z.object({
  trackingId: z
    .string()
    .trim()
    .toUpperCase()
    .min(5, 'Tracking ID must be at least 5 characters')
    .max(40, 'Tracking ID cannot exceed 40 characters')
    .regex(/^[A-Z0-9-]+$/, 'Tracking ID must contain only letters, numbers, and hyphens'),
  email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
});

export const requestRecoverySchema = z.object({
  email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
});

export const verifyRecoverySchema = z.object({
  email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Verification code must be a 6-digit number'),
});

export type TrackInquiryInput = z.infer<typeof trackInquirySchema>;
export type RequestRecoveryInput = z.infer<typeof requestRecoverySchema>;
export type VerifyRecoveryInput = z.infer<typeof verifyRecoverySchema>;
