"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import DeleteConfirmModal from "@/components/Deleteconfirmmodal";

interface Review {
  _id: string;
  productName: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  reviewText: string;
  productVariant?: string;
  createdAt: string;
  isApproved: boolean;
  productThumbnail?: string;
  userAvatar?: string;
}

const ReviewsPage = () => {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Filter states
  const [filterProduct, setFilterProduct] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterRating, setFilterRating] = useState<number | "">("");

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    reviewId: "",
    reviewTitle: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [page, search, filterProduct, filterUser, filterRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: search,
        ...(filterProduct && { product: filterProduct }),
        ...(filterUser && { user: filterUser }),
        ...(filterRating && { rating: filterRating.toString() }),
      });

      const response = await fetch(`/api/admin/reviews?${query}`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.data.reviews);
        setTotalPages(data.data.totalPages);
        setTotal(data.data.totalReviews);
      } else {
        toast.error("Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Error loading reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveToggle = async (reviewId: string, currentStatus: boolean) => {
    try {
      setIsUpdating(reviewId);
      const toastId = toast.loading(
        currentStatus ? "Unapproving review..." : "Approving review..."
      );

      const response = await fetch(`/api/admin/reviews`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId,
          isApproved: !currentStatus,
        }),
      });

      if (response.ok) {
        setReviews(
          reviews.map((review) =>
            review._id === reviewId
              ? { ...review, isApproved: !currentStatus }
              : review
          )
        );
        toast.dismiss(toastId);
        toast.success(
          currentStatus ? "Review unapproved successfully" : "Review approved successfully"
        );
      } else {
        toast.dismiss(toastId);
        toast.error("Failed to update review status");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Error updating review. Please try again.");
    } finally {
      setIsUpdating(null);
    }
  };

  const openDeleteModal = (id: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      reviewId: id,
      reviewTitle: title,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      reviewId: "",
      reviewTitle: "",
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const toastId = toast.loading(`Deleting review...`);

      const response = await fetch(`/api/admin/reviews/${deleteModal.reviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setReviews(reviews.filter((r) => r._id !== deleteModal.reviewId));
        toast.dismiss(toastId);
        toast.success(`Review deleted successfully`);
        closeDeleteModal();
      } else {
        toast.dismiss(toastId);
        toast.error("Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Error deleting review. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 mb-20">
      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Product Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Product
          </label>
          <input
            type="text"
            placeholder="Product name..."
            value={filterProduct}
            onChange={(e) => {
              setFilterProduct(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* User Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by User
          </label>
          <input
            type="text"
            placeholder="User name..."
            value={filterUser}
            onChange={(e) => {
              setFilterUser(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Rating
          </label>
          <select
            value={filterRating}
            onChange={(e) => {
              setFilterRating(e.target.value === "" ? "" : parseInt(e.target.value));
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
            <option value="4">4 Stars ⭐⭐⭐⭐</option>
            <option value="3">3 Stars ⭐⭐⭐</option>
            <option value="2">2 Stars ⭐⭐</option>
            <option value="1">1 Star ⭐</option>
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {(filterProduct || filterUser || filterRating) && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              setFilterProduct("");
              setFilterUser("");
              setFilterRating("");
              setPage(1);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-md border border-pink-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-pink-50 border-b border-brand-pink">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-pink-700">Product</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-pink-700">User</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-pink-700">Rating</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-pink-700">Title</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-pink-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-pink-700">Created</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-pink-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                  </div>
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No reviews found
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review._id} className="border-b border-brand-pink hover:bg-pink-50">
                  {/* Product */}
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      {review.productThumbnail ? (
                        <Image
                          src={review.productThumbnail}
                          alt={review.productName}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">N/A</span>
                        </div>
                      )}
                      <span className="font-medium text-gray-900">
                        {review.productName}
                      </span>
                    </div>
                  </td>

                  {/* User */}
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {review.userAvatar ? (
                        <Image
                          src={review.userAvatar}
                          alt={review.userName}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-white">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="font-medium text-gray-900 truncate">
                          {review.userName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {review.userEmail}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-yellow-600">
                        {review.rating}
                      </span>
                      <span className="text-yellow-400">★</span>
                    </div>
                  </td>

                  {/* Title */}
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {review.title}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        review.isApproved
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {review.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>

                  {/* Created Date */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-sm space-x-3">
                    {!review.isApproved && (
                      <button
                        onClick={() =>
                          handleApproveToggle(review._id, review.isApproved)
                        }
                        disabled={isUpdating === review._id}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                      >
                        {isUpdating === review._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          <>
                            <CheckCircle2 size={16} /> Approve
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => openDeleteModal(review._id, review.title)}
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
          Showing 1-{Math.min(10, total)} of {total} reviews
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
        title="Delete Review"
        message="Are you sure you want to delete this review?"
        itemName={deleteModal.reviewTitle}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};

export default ReviewsPage;