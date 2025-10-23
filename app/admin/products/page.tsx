"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import Image from "next/image";
import DeleteConfirmModal from "@/components/Deleteconfirmmodal";
import { toast } from "sonner";

interface CouponInfo {
  code: string;
  description?: string;
  discountValue: number;
  discountType: "percentage" | "fixed";
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  brand: { name: string } | string;
  category: { name: string } | string;
  thumbnail?: string;
  isActive: boolean;
  isCouponDeal: boolean;
  isTodayDeal: boolean;
  isComingSoon: boolean;
  applicableCoupons?: string[];
  applicableCouponDetails?: CouponInfo[];
}

const ProductsPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [hoveredCouponProductId, setHoveredCouponProductId] = useState<string | null>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: "",
    productName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: search,
      });

      const response = await fetch(`/api/admin/products?${query}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
        setTotalPages(data.pagination.pages);
        setTotal(data.pagination.total);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error loading products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      productId: id,
      productName: name,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      productId: "",
      productName: "",
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const toastId = toast.loading(`Deleting "${deleteModal.productName}"...`);

      const response = await fetch(`/api/admin/products/${deleteModal.productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProducts(
          products.filter((p) => p._id !== deleteModal.productId)
        );
        toast.dismiss(toastId);
        toast.success(`"${deleteModal.productName}" deleted successfully`);
        closeDeleteModal();
      } else {
        toast.dismiss(toastId);
        toast.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error deleting product. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper function to safely get brand name
  const getBrandName = (brand: Product["brand"]): string => {
    if (!brand) return "N/A";
    if (typeof brand === "string") return brand;
    return brand.name || "N/A";
  };

  // Helper function to safely get category name
  const getCategoryName = (category: Product["category"]): string => {
    if (!category) return "N/A";
    if (typeof category === "string") return category;
    return category.name || "N/A";
  };

  // Helper to format discount display
  const formatDiscount = (coupon: CouponInfo): string => {
    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}% off`;
    }
    return `LKR ${coupon.discountValue} off`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink"
            />
          </div>
        </div>
        <Link
          href="/admin/products/new"
          className="ml-4 bg-brand-pink text-white px-4 py-2 rounded-lg hover:scale-105 transform transition-transform flex items-center gap-2"
        >
          <Plus size={20} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-pink-100 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-pink-50 border-b border-brand-pink">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-pink-700">
                Product
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-pink-700">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-pink-700">
                Brand
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-pink-700">
                Price
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-pink-700">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-pink-700">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-pink-700">
                Coupon Deal
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-pink-700">
                Today Deal
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-pink-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-pink"></div>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product._id}
                  className="border-b border-brand-pink hover:bg-pink-50 transition-colors"
                >
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      {product.thumbnail && (
                        <Image
                          src={product.thumbnail}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded object-cover"
                          unoptimized
                        />
                      )}
                      <span className="text-gray-900 font-medium">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {product.sku}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {getBrandName(product.brand)}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {process.env.NEXT_PUBLIC_CURRENCY || "LKR"} {product.price}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        product.stock > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm relative">
                    <div
                      onMouseEnter={() => setHoveredCouponProductId(product._id)}
                      onMouseLeave={() => setHoveredCouponProductId(null)}
                      className="relative inline-block"
                    >
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium cursor-help ${
                          product.isCouponDeal
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.isCouponDeal ? "Yes" : "No"}
                      </span>

                      {/* Enhanced Tooltip showing coupon details */}
                      {product.isCouponDeal &&
                        product.applicableCoupons &&
                        product.applicableCoupons.length > 0 &&
                        hoveredCouponProductId === product._id && (
                          <div className="absolute z-50 bottom-full left-0 mb-2 bg-gray-900 text-white text-xs rounded-lg py-3 px-4 shadow-xl border border-gray-700 max-w-md">
                            {/* Arrow */}
                            <div className="absolute bottom-0 left-2 transform translate-y-full">
                              <div className="border-4 border-transparent border-t-gray-900"></div>
                            </div>

                            <div className="font-semibold mb-2 text-blue-300">
                               Active Coupons:
                            </div>

                            <div className="space-y-2">
                              {product.applicableCoupons.map((code, idx) => (
                                <div key={idx} className="bg-gray-700 rounded p-2">
                                  <div className="font-medium text-white">
                                     {code}
                                  </div>
                                  {product.applicableCouponDetails &&
                                    product.applicableCouponDetails[idx] && (
                                      <div className="text-gray-300 text-xs mt-1">
                                        <div>
                                          Discount:{" "}
                                          <span className="text-green-400 font-semibold">
                                            {formatDiscount(
                                              product.applicableCouponDetails[idx]
                                            )}
                                          </span>
                                        </div>
                                        {product.applicableCouponDetails[idx]
                                          .description && (
                                          <div className="mt-1 italic">
                                            {product.applicableCouponDetails[
                                              idx
                                            ].description.substring(0, 50)}
                                            {product.applicableCouponDetails[idx]
                                              .description.length > 50
                                              ? "..."
                                              : ""}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isTodayDeal
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.isTodayDeal ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm space-x-2 text-center">
                    <button
                      onClick={() =>
                        router.push(`/admin/products/${product._id}`)
                      }
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() =>
                        openDeleteModal(product._id, product.name)
                      }
                      className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={16} />
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
          Showing 1-{Math.min(10, total)} of {total} products
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-sm text-gray-700">
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
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        itemName={deleteModal.productName}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};

export default ProductsPage;