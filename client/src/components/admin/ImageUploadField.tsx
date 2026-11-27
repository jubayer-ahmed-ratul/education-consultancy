import { useState } from 'react';
import type { UploadPurpose } from '@zero-compile/shared';
import { uploadImageToCloudinary } from '../../lib/cloudinary';
import { useToast } from '../../context/ToastContext';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  purpose: UploadPurpose;
}

export function ImageUploadField({ label, value, onChange, purpose }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const { addToast } = useToast();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadImageToCloudinary(file, purpose);
      onChange(uploaded.secureUrl);
      addToast('success', 'Image uploaded to Cloudinary.');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-700">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or upload via Cloudinary"
          className="flex-1 rounded border border-slate-300 px-3 py-1.5 text-sm"
        />
        <label className="cursor-pointer rounded border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
          {uploading ? 'Uploading...' : 'Upload'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
