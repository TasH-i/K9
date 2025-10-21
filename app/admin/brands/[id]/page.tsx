"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

interface BrandForm {
  name: string;
  description: string;
  image: string;
  isActive: boolean;
}

const BrandForm = () => {
  const router = useRouter();
  const params = useParams();
  const isEdit = params?.id && params.id !== "new";

  const [form, setForm] = useState<BrandForm>({
    name: "",
    description: "",
    image: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchBrand();
    }
  }, []);

  const fetchBrand = async () => {
    try {
      const response = await fetch(`/api/admin/brands/${params?.id}`);
      const data = await response.json();
      if (data.success) {
        setForm(data.data);
      }
    } catch (error) {
      console.error("Error fetching brand:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (url: string) => {
    setForm((prev) => ({
      ...prev,
      image: url,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `/api/admin/brands/${params?.id}` : "/api/admin/brands";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/admin/brands");
      } else {
        alert(data.error || "Failed to save brand");
      }
    } catch (error) {
      console.error("Error saving brand:", error);
      alert("Error saving brand");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand Logo</label>
          <ImageUploader onImageUpload={handleImageUpload} currentImage={form.image} folder="brands" />
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <span className="text-gray-700">Brand is Active</span>
        </label>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Brand" : "Create Brand"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BrandForm;