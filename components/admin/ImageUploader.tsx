"use client";

import React, { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

interface ImageUploaderProps {
  onImageUpload: (url: string, filename: string) => void;
  onImageRemove?: (filename: string) => void;
  currentImage?: string;
  folder?: string;
  maxSize?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  onImageRemove,
  currentImage,
  folder = "admin",
  maxSize = 5242880,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [preview, setPreview] = useState<string>(currentImage || "");

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");

    if (file.size > maxSize) {
      setError("File size exceeds 5MB limit");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    try {
      setUploading(true);

      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onImageUpload(data.fileUrl, data.filename);
    } catch (err) {
      setError("Failed to upload image");
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setPreview("");
    if (onImageRemove && currentImage) {
      // Extract filename from URL if needed
      onImageRemove(currentImage);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={uploading}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 disabled:opacity-50"
          >
            <X size={16} />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors disabled:opacity-50"
        >
          <div className="flex flex-col items-center gap-2">
            <Upload size={24} className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {uploading ? "Uploading..." : "Click to upload image"}
            </span>
          </div>
        </button>
      )}

      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
};

export default ImageUploader;