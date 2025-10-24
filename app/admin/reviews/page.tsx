// components/Admin/ReviewTable.tsx
"use client";

import { useState, useEffect } from "react";
import { Trash2, Eye, Star, Search, AlertCircle } from "lucide-react";

interface Review {
  _id: string;
  productName: string;
  userName: string;
  userEmail: string;
  rating: number;
  title?: string;
  reviewText: string;
  productVariant?: string;
  productThumbnail?: string;
  userAvatar?: string;
  createdAt: string;
  isApproved: boolean;
}

interface ApiResponse {
  success: boolean;
  data?: {
    reviews: Review[];
    totalReviews: number;
  };
  error?: string;
}

export default function ReviewTable() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReviews();
  }, [currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/reviews?page=${currentPage}&limit=${itemsPerPage}`
      );
      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setReviews(data.data.reviews);
        setTotalReviews(data.data.totalReviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const response = await fetch(`/api/reviews?id=${reviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setReviews(reviews.filter((r) => r._id !== reviewId));
        setTotalReviews(totalReviews - 1);
      } else {
        alert("Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Error deleting review");
    }
  };

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setShowPreview(true);
  };

  // Filter reviews based on search and rating
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating = filterRating === "all" || review.rating === filterRating;

    return matchesSearch && matchesRating;
  });

  const totalPages = Math.ceil(totalReviews / itemsPerPage);

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-pink-100">
        {/* Header with Filters */}
        <div className="p-6 sm:p-8 border-b-2 border-pink-100 bg-gradient-to-r from-pink-50 to-pink-50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-pink to-pink-600 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Reviews Management</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400" />
              <input
                type="text"
                placeholder="Search by product, user, or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all"
              />
            </div>

            {/* Rating Filter */}
            <select
              value={filterRating}
              onChange={(e) => {
                setFilterRating(e.target.value === "all" ? "all" : parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all font-medium"
            >
              <option value="all">All Ratings</option>
              <option value={5}>⭐ 5 Stars</option>
              <option value={4}>⭐ 4 Stars</option>
              <option value={3}>⭐ 3 Stars</option>
              <option value={2}>⭐ 2 Stars</option>
              <option value={1}>⭐ 1 Star</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              Showing <span className="text-brand-pink">{filteredReviews.length}</span> of{" "}
              <span className="text-brand-pink">{totalReviews}</span> reviews
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block">
                <div className="w-8 h-8 border-4 border-pink-200 border-t-brand-pink rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 mt-4 font-medium">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No reviews found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gradient-to-r from-brand-pink/10 to-pink-100/10 border-b-2 border-pink-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                    Review
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-100">
                {filteredReviews.map((review, index) => (
                  <tr
                    key={review._id}
                    className="hover:bg-gradient-to-r hover:from-pink-50 hover:to-pink-50/50 transition-all duration-200 border-b border-pink-100"
                  >
                    {/* Product Name */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center justify-center -px-6 gap-2">
                          <img
                            src={review.productThumbnail}
                            alt={review.productName}
                            className="w-16 h-16 object-cover rounded-md mb-2"
                          />
                          <span className="font-semibold text-sm text-gray-900 hover:text-brand-pink transition-colors">
                            {review.productName}
                          </span>
                        </div>
                        {review.productVariant && (
                          <span className="text-xs text-gray-500 mt-1 bg-gray-100 px-2 py-1 rounded w-fit">
                            {review.productVariant}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* User Name & Email */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center jusctify-center gap-2">
                          <img
                            src={review.userAvatar}
                            alt={review.userName}
                            className="w-8 h-8 object-cover rounded-full mb-2"
                          />
                          <span className="font-semibold text-sm text-gray-900">
                            {review.userName}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{review.userEmail}</span>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating
                                  ? "fill-brand-yellow text-brand-yellow"
                                  : "text-gray-300"
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-bold text-brand-pink bg-pink-50 px-2 py-1 rounded">
                          {review.rating}.0
                        </span>
                      </div>
                    </td>

                    {/* Review Text */}
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                          {review.title && (
                            <>
                              <span className="font-semibold text-gray-900">{review.title}</span>
                              <br />
                            </>
                          )}
                          {review.reviewText}
                        </p>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-600">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleViewReview(review)}
                          className="p-2 text-brand-pink hover:bg-pink-100 rounded-lg transition-all hover:scale-110 group relative"
                          title="View full review"
                        >
                          <Eye className="w-5 h-5" />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            View Review
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110 group relative"
                          title="Delete review"
                        >
                          <Trash2 className="w-5 h-5" />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Delete Review
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 sm:px-8 py-6 border-t-2 border-pink-100 bg-gradient-to-r from-pink-50 to-pink-50 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-700">
              Page <span className="text-brand-pink">{currentPage}</span> of{" "}
              <span className="text-brand-pink">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border-2 border-pink-200 text-gray-700 font-semibold rounded-lg hover:bg-pink-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border-2 border-pink-200 text-gray-700 font-semibold rounded-lg hover:bg-pink-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Preview Modal */}
      {showPreview && selectedReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-pink-100">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-brand-pink to-pink-600 border-b border-pink-200 p-6 flex justify-between items-start">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2">Review Preview</h3>
                <p className="text-pink-100 text-sm">{selectedReview.productName}</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* User Info */}
              <div className="bg-gradient-to-r from-pink-50 to-pink-50/50 border border-pink-200 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">User Name</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{selectedReview.userName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Email</p>
                    <p className="text-sm text-brand-pink font-medium mt-1">{selectedReview.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Rating</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < selectedReview.rating
                                ? "fill-brand-yellow text-brand-yellow"
                                : "text-gray-300"
                              }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-brand-pink">{selectedReview.rating}/5</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Date</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {new Date(selectedReview.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Variant Info */}
              {selectedReview.productVariant && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Product Variant</p>
                  <div className="bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{selectedReview.productVariant}</p>
                  </div>
                </div>
              )}

              {/* Title */}
              {selectedReview.title && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Review Title</p>
                  <p className="text-lg font-bold text-gray-900 text-brand-pink">
                    {selectedReview.title}
                  </p>
                </div>
              )}

              {/* Review Text */}
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase mb-3">Review</p>
                <div className="bg-gradient-to-br from-gray-50 to-gray-50 border border-gray-200 rounded-xl p-6">
                  <p className="text-gray-900 leading-relaxed text-base whitespace-pre-wrap">
                    {selectedReview.reviewText}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowPreview(false)}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-brand-pink to-pink-600 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}