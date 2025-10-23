import { useState } from 'react';

interface UploadResponse {
  success: boolean;
  filename: string;
  fileUrl: string;
  folder: string;
}

type FolderType = 'profiles' | 'brands' | 'categories' | 'products';

interface UseS3UploadOptions {
  maxFileSize?: number; // in bytes, default 5MB
  allowedTypes?: string[];
}

export const useS3Upload = (options: UseS3UploadOptions = {}) => {
  const {
    maxFileSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (
    file: File,
    folder: FolderType
  ): Promise<UploadResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Client-side validation
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only images are allowed.');
      }

      if (file.size > maxFileSize) {
        throw new Error(`File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`);
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Upload to server
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data: UploadResponse = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Upload error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async (filename: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Delete error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadImage,
    deleteImage,
    isLoading,
    error,
  };
};