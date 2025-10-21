"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

interface CategoryForm {
  name: string;
  description: string;
  image: string;
  parentCategory: string | null;
  isActive: boolean;
}

const CategoryForm = () => {
  const router = useRouter();
  const params = useParams();
  const isEdit = params?.id && params.id !== "new";

  const [form, setForm] = useState<CategoryForm>({
    name: "",
    description: "",
    image: "",
    parentCategory: null,
    isActive: true,
  });

  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchParentCategories();
    if (isEdit) {
      fetchCategory();
    }
  }, []);

  const fetchParentCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories?limit=100");
      const data = await response.json();
      if (data.success) {
        setParentCategories(data.data.filter((c: any) => c._id !== params?.id));
      }
    } catch (error) {
      console.error("Error fetching parent categories:", error);
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/admin/categories/${params?.id}`);
      const data = await response.json();
      if (data.success) {
        setForm(data.data);
      }
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "parentCategory"
          ? value || null
          : value,
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
      const url = isEdit ? `/api/admin/categories/${params?.id}` : "/api/admin/categories";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/admin/categories");
      } else {
        alert(data.error || "Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Error saving category");
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
          <select
            name="parentCategory"
            value={form.parentCategory || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No Parent Category</option>
            {parentCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
          <ImageUploader onImageUpload={handleImageUpload} currentImage={form.image} folder="categories" />
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <span className="text-gray-700">Category is Active</span>
        </label>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
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

export default CategoryForm;