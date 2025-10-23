"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import Image from "next/image";
import DeleteConfirmModal from "@/components/Deleteconfirmmodal";
import { toast } from "sonner";

interface Category {
  _id: string;
  name: string;
  slug: string;
  parentCategory?: { name: string };
  isActive: boolean;
  image?: string;
  imageUrl?: string;
  createdAt: string;
}

const CategoriesPage = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    categoryId: "",
    categoryName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: search,
      });

      const response = await fetch(`/api/admin/categories?${query}`);
      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
        setTotalPages(data.pagination.pages);
        setTotal(data.pagination.total);
      } else {
        toast.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error loading categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      categoryId: id,
      categoryName: name,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      categoryId: "",
      categoryName: "",
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const toastId = toast.loading(`Deleting "${deleteModal.categoryName}"...`);

      const response = await fetch(`/api/admin/categories/${deleteModal.categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCategories(categories.filter((c) => c._id !== deleteModal.categoryId));
        toast.dismiss(toastId);
        toast.success(`"${deleteModal.categoryName}" deleted successfully`);
        closeDeleteModal();
      } else {
        toast.dismiss(toastId);
        toast.error("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error deleting category. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <Link
          href="/admin/categories/new"
          className="ml-4 bg-brand-pink text-white px-4 py-2 rounded-lg hover:scale-105 transform transition-transform flex items-center gap-2"
        >
          <Plus size={20} /> Add Category
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-pink-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-pink-50 border-b border-brand-pink">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-pink-700">Image</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-pink-700">Category</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-pink-700">Parent Category</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-pink-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-pink-700">Created</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-pink-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category._id} className="border-b border-brand-pink hover:bg-pink-50">
                  {/* Image Column */}
                  <td className="py-4 text-sm">
                    <div className="flex justify-center">
                      <div className="max-w-24 w-full flex justify-center items-center">
                        {category.image || category.imageUrl ? (
                          <Image
                            src={category.image || category.imageUrl || ""}
                            alt={category.name || "Category"}
                            width={96}
                            height={26}
                            className="object-contain"
                            unoptimized
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-image-off"
                            >
                              <line x1="2" x2="22" y1="2" y2="22" />
                              <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
                              <line x1="13.5" x2="6" y1="13.5" y2="21" />
                              <line x1="18" x2="21" y1="12" y2="15" />
                              <path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59" />
                              <path d="M21 15V5a2 2 0 0 0-2-2H9" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{category.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{category.parentCategory?.name || "—"}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-2 text-sm space-x-6">
                    <button
                      onClick={() => router.push(`/admin/categories/${category._id}`)}
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(category._id, category.name)}
                      className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing 1-{Math.min(10, total)} of {total} categories
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Category"
        message="Are you sure you want to delete this category?"
        itemName={deleteModal.categoryName}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};

export default CategoriesPage;