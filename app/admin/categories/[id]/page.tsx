"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import { toast } from "sonner";

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
  const categoryId = params?.id;
  const isEdit = categoryId && categoryId !== "new";

  const [form, setForm] = useState<CategoryForm>({
    name: "",
    description: "",
    image: "",
    parentCategory: null,
    isActive: true,
  });

  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(Boolean(isEdit));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchParentCategories();
    if (isEdit && categoryId) {
      fetchCategory();
    }
  }, [isEdit, categoryId]);

  const fetchParentCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories?limit=100");
      const data = await response.json();
      if (data.success) {
        const filtered = data.data.filter(
          (c: any) => !isEdit || c._id !== categoryId
        );
        setParentCategories(filtered);
      }
    } catch (error) {
      console.error("Error fetching parent categories:", error);
      toast.error("Failed to load parent categories");
    }
  };

  const fetchCategory = async () => {
    try {
      setIsFetching(true);
      setError(null);

      const response = await fetch(`/api/admin/categories/${categoryId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch category");
      }

      const data = await response.json();

      if (data.success) {
        setForm({
          name: data.data.name || "",
          description: data.data.description || "",
          image: data.data.image || "",
          parentCategory: data.data.parentCategory?._id || null,
          isActive: data.data.isActive !== undefined ? data.data.isActive : true,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load category";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching category:", err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
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
    if (!url) {
      toast.error("Image upload failed. Please try again.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      image: url,
    }));

    toast.success("Image uploaded successfully!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      const errorMsg = "Category name is required";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!form.image.trim()) {
      const errorMsg = "Category image is required";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    const toastId = toast.loading(isEdit ? "Updating category..." : "Creating category...");

    try {
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit
        ? `/api/admin/categories/${categoryId}`
        : "/api/admin/categories";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save category");
      }

      if (data.success || response.ok) {
        toast.dismiss(toastId);
        toast.success(
          `Category has been ${isEdit ? "updated" : "created"} successfully!`
        );
        setTimeout(() => {
          router.push("/admin/categories");
        }, 500);
      } else {
        throw new Error(data.error || "Failed to save category");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error saving category";
      setError(errorMessage);
      toast.dismiss(toastId);
      toast.error(errorMessage);
      console.error("Error saving category:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading category details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft size={20} /> Back
      </button>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="Enter category name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="Enter category description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parent Category
          </label>
          <select
            name="parentCategory"
            value={form.parentCategory || ""}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Image *
          </label>
          <ImageUploader
            onImageUpload={handleImageUpload}
            currentImage={form.image}
            folder="categories"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            disabled={loading}
            className="w-4 h-4 disabled:opacity-50"
          />
          <span className="text-gray-700">Category is Active</span>
        </label>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || isFetching}
            className="bg-brand-pink text-white px-6 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;