import type { AllowedUploadMimeType, UploadPurpose } from '@zero-compile/shared';
import { apiRequest } from './api-client';

interface UploadSignatureResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  maxFileSizeBytes: number;
}

export async function uploadImageToCloudinary(
  file: File,
  purpose: UploadPurpose
): Promise<{ secureUrl: string; publicId: string; width?: number; height?: number; format?: string }> {
  const { data: sig } = await apiRequest<UploadSignatureResponse>('/uploads/signature', {
    method: 'POST',
    body: JSON.stringify({
      purpose,
      mimeType: file.type as AllowedUploadMimeType,
    }),
  });

  if (file.size > sig.maxFileSizeBytes) {
    throw new Error(`File exceeds maximum size of ${Math.round(sig.maxFileSizeBytes / 1024 / 1024)} MB.`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sig.apiKey);
  formData.append('timestamp', String(sig.timestamp));
  formData.append('signature', sig.signature);
  formData.append('folder', sig.folder);
  formData.append('public_id', sig.publicId);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Cloudinary upload failed: ${errText}`);
  }

  const uploaded = (await uploadRes.json()) as {
    secure_url: string;
    public_id: string;
    width?: number;
    height?: number;
    format?: string;
  };

  return {
    secureUrl: uploaded.secure_url,
    publicId: uploaded.public_id,
    width: uploaded.width,
    height: uploaded.height,
    format: uploaded.format,
  };
}
