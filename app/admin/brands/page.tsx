"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import Image from "next/image";
import DeleteConfirmModal from "@/components/Deleteconfirmmodal";
import { toast } from "sonner";

interface Brand {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  image?: string;
  imageUrl?: string;
  createdAt: string;
}

const BrandsPage = () => {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    brandId: "",
    brandName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, [page, search]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: search,
      });

      const response = await fetch(`/api/admin/brands?${query}`);
      const data = await response.json();

      if (data.success) {
        setBrands(data.data);
        setTotalPages(data.pagination.pages);
        setTotal(data.pagination.total);
      } else {
        toast.error("Failed to fetch brands");
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Error loading brands. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      brandId: id,
      brandName: name,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      brandId: "",
      brandName: "",
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const toastId = toast.loading(`Deleting "${deleteModal.brandName}"...`);

      const response = await fetch(`/api/admin/brands/${deleteModal.brandId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBrands(brands.filter((b) => b._id !== deleteModal.brandId));
        toast.dismiss(toastId);
        toast.success(`"${deleteModal.brandName}" deleted successfully`);
        closeDeleteModal();
      } else {
        toast.dismiss(toastId);
        toast.error("Failed to delete brand");
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast.error("Error deleting brand. Please try again.");
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
              placeholder="Search brands..."
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
          href="/admin/brands/new"
          className="ml-4 bg-brand-pink text-white px-4 py-2 rounded-lg hover:scale-105 transaction-transform  flex items-center gap-2"
        >
          <Plus size={20} /> Add Brand
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-pink-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-pink-50 border-b border-brand-pink">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-pink-700">Image</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-pink-700">Brand</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-pink-700">Slug</th>
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
            ) : brands.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No brands found
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand._id} className="border-b border-brand-pink hover:bg-pink-50">
                  {/* Image Column */}
                  <td className=" py-4 text-sm">
                    <div className="flex justify-center">
                      <div className="max-w-24 w-full flex justify-center items-center">
                        <Image
                          src={brand.image || brand.imageUrl || "/placeholder.png"}
                          alt={brand.name || "Placeholder"}
                          width={96}
                          height={56}
                          className="object-contain "
                          unoptimized
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{brand.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{brand.slug}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${brand.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {brand.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(brand.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-2 text-sm space-x-6">
                    <button
                      onClick={() => router.push(`/admin/brands/${brand._id}`)}
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(brand._id, brand.name)}
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
          Showing 1-{Math.min(10, total)} of {total} brands
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
        title="Delete Brand"
        message="Are you sure you want to delete this brand?"
        itemName={deleteModal.brandName}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};

export default BrandsPage;