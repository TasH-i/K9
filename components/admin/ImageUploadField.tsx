// components/admin/ImageUploadField.tsx
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useS3Upload } from '@/lib/hooks/useS3Upload';

type FolderType = 'profiles' | 'brands' | 'categories' | 'products';

interface ImageUploadFieldProps {
  folder: FolderType;
  onImageUpload: (imageUrl: string, filename: string) => void;
  initialImage?: string;
  initialFilename?: string;
  label?: string;
  required?: boolean;
}

export const ImageUploadField = ({
  folder,
  onImageUpload,
  initialImage,
  initialFilename,
  label,
  required = false,
}: ImageUploadFieldProps) => {
  const { uploadImage, deleteImage, isLoading, error } = useS3Upload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const [currentFilename, setCurrentFilename] = useState<string | null>(initialFilename || null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to S3
    const result = await uploadImage(file, folder);
    if (result) {
      setCurrentFilename(result.filename);
      onImageUpload(result.fileUrl, result.filename);
    } else if (error) {
      setUploadError(error);
      setPreview(null); // Remove preview if upload fails
    }
  };

  const handleRemoveImage = async () => {
    if (currentFilename) {
      const deleted = await deleteImage(currentFilename);
      if (deleted) {
        setPreview(null);
        setCurrentFilename(null);
        onImageUpload('', '');
      } else if (error) {
        setUploadError(error);
      }
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        {preview ? (
          <div className="space-y-4">
            <div className="relative w-full h-48">
              <Image
                src={preview}
                alt={`${folder} preview`}
                fill
                className="object-contain"
              />
            </div>
            <p className="text-xs text-gray-500">
              {currentFilename?.split('/').pop() || 'Image uploaded'}
            </p>
          </div>
        ) : (
          <div className="py-8 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-8l-3.172-3.172a4 4 0 00-5.656 0L28 20M8 24l3.172-3.172a4 4 0 015.656 0L20 24"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm font-medium mt-2">Upload an image</p>
            <p className="text-xs">PNG, JPG, GIF or WebP up to 5MB</p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isLoading}
        className="hidden"
        aria-label={`Upload ${folder} image`}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </span>
          ) : (
            'Upload Image'
          )}
        </button>

        {preview && (
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Remove
          </button>
        )}
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {uploadError}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};