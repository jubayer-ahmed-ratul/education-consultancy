import { randomUUID } from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  UPLOAD_PURPOSE_MAP,
  type AllowedUploadMimeType,
  type UploadPurpose,
} from '@zero-compile/shared';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export interface SignedUploadParams {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  maxFileSizeBytes: number;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const cloudinaryService = {
  generateUploadSignature(purpose: UploadPurpose, mimeType: AllowedUploadMimeType): SignedUploadParams {
    if (!ALLOWED_UPLOAD_MIME_TYPES.includes(mimeType)) {
      throw new AppError(400, 'INVALID_MIME_TYPE', 'Unsupported file MIME type.');
    }

    const folder = UPLOAD_PURPOSE_MAP[purpose];
    if (!folder) {
      throw new AppError(400, 'INVALID_UPLOAD_PURPOSE', 'Unsupported upload purpose.');
    }

    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      throw new AppError(
        503,
        'CLOUDINARY_NOT_CONFIGURED',
        'Cloudinary credentials are not configured on the server.'
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = randomUUID();

    const paramsToSign = {
      folder,
      public_id: publicId,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, env.CLOUDINARY_API_SECRET);

    return {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      timestamp,
      signature,
      folder,
      publicId,
      maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
    };
  },
};
