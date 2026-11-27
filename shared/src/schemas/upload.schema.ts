import { z } from 'zod';
import { ALLOWED_UPLOAD_MIME_TYPES, UPLOAD_PURPOSE_MAP } from '../constants/uploads';

const purposeKeys = Object.keys(UPLOAD_PURPOSE_MAP) as [
  keyof typeof UPLOAD_PURPOSE_MAP,
  ...(keyof typeof UPLOAD_PURPOSE_MAP)[],
];

export const uploadSignatureSchema = z.object({
  purpose: z.enum(purposeKeys),
  mimeType: z.enum(ALLOWED_UPLOAD_MIME_TYPES),
});

export type UploadSignatureInput = z.infer<typeof uploadSignatureSchema>;
