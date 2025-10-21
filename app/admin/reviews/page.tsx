"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Search, CheckCircle, XCircle } from "lucide-react";

interface Review {
  _id: string;
  title: string;
  author: { name: string; email: string };
  rating: number;
  products: { name: string }[];
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

const ReviewsPage = () => {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [page, search, filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: search,
      });

      if (filter !== "all") {
        query.append("approved", filter === "approved" ? "true" : "false");
      }

      const response = await fetch(`/api/admin/reviews?${query}`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.data);
        setTotalPages(data.pagination.pages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });

      if (response.ok) {
        setReviews(
          reviews.map((r) =>
            r._id === id ? { ...r, isApproved: !currentStatus } : r
          )
        );
      }
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        const response = await fetch(`/api/admin/reviews/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setReviews(reviews.filter((r) => r._id !== id));
        }
      } catch (error) {
        console.error("Error deleting review:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Reviews</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Review</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Author</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Rating</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Product</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No reviews found
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {review.title}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">
                        {review.author.name}
                      </p>
                      <p className="text-gray-600">{review.author.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className="font-medium">{review.rating}/5</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {review.products.map((p) => p.name).join(", ")}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {review.isVerifiedPurchase && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Verified
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          review.isApproved
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {review.isApproved ? "Approved" : "Pending"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() =>
                        handleApprove(review._id, review.isApproved)
                      }
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        review.isApproved
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : "bg-green-100 text-green-600 hover:bg-green-200"
                      }`}
                    >
                      {review.isApproved ? (
                        <>
                          <XCircle size={14} /> Reject
                        </>
                      ) : (
                        <>
                          <CheckCircle size={14} /> Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Delete
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
    </div>
  );
};

export default ReviewsPage;