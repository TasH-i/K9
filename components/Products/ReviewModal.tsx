// components/Products/ReviewModal.tsx
"use client";

import { useState, Dispatch, SetStateAction } from "react";
import { Star, X, AlertCircle, Heart } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onReviewAdded?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  onReviewAdded,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [productVariant, setProductVariant] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check authentication on client side only
  useState(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      setIsAuthenticated(!!userData);
      setMounted(true);
    }
  });

  // If not authenticated, show login message
  if (mounted && !isAuthenticated) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-pink-100">
              {/* Header with icon */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-pink to-pink-600 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white fill-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-pink-50 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Login message */}
              <div className="flex gap-4 items-start p-5 bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-xl mb-6">
                <AlertCircle className="w-5 h-5 text-brand-pink flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-brand-pink mb-1">Login Required</p>
                  <p className="text-sm text-pink-700">
                    Sign in to share your experience and help other customers!
                  </p>
                </div>
              </div>

              {/* Action button */}
              <Link  href="/login">
              <button
                
                className="w-full px-4 py-3 bg-gradient-to-r from-brand-pink to-pink-600 text-white rounded-lg font-semibold hover:from-pink-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
              >
                Login
              </button>
              </Link>
            </div>
          </div>
        )}
      </>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (reviewText.trim().length < 2) {
        toast.error("Review must be at least 2 characters long");
        setLoading(false);
        return;
      }

      // Get user data from localStorage
      const userDataString = localStorage.getItem("user");
      if (!userDataString) {
        toast.error("User data not found. Please log in again.");
        setLoading(false);
        return;
      }

      const userData = JSON.parse(userDataString);

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          rating,
          title,
          reviewText: reviewText.trim(),
          productVariant: productVariant || undefined,
          userEmail: userData.email,
          userId: userData.id || userData._id,
          userName: userData.name,
          userAvatar: userData.profilePicture || userData.image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to add review");
        setLoading(false);
        return;
      }
      toast.success("Review added successfully!");
      setSuccess(true);
      // Reset form
      setRating(5);
      setTitle("");
      setReviewText("");
      setProductVariant("");

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        onReviewAdded?.();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-pink-100">
        {/* Header with gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-brand-pink/95 to-pink-600/95 border-b border-pink-200 flex justify-between items-start p-6 sm:p-8">
          <div className="text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Share Your Review</h2>
            <p className="text-pink-100 text-sm sm:text-base flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Help others discover great products
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Product name banner */}
        <div className="bg-gradient-to-r from-pink-50 to-pink-50 border-b border-pink-200 px-6 sm:px-8 py-4">
          <p className="text-sm text-gray-600">Reviewing:</p>
          <p className="text-lg font-semibold text-gray-900 text-brand-pink">{productName}</p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* Rating Section */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide">
              How would you rate this product?
            </label>
            <div className="flex gap-3 bg-gradient-to-r from-pink-50 to-pink-50 p-6 rounded-xl border border-pink-200">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-all transform hover:scale-125"
                >
                  <Star
                    className={`w-10 h-10 sm:w-12 sm:h-12 ${
                      star <= (hoverRating || rating)
                        ? "fill-brand-yellow text-brand-yellow drop-shadow-md"
                        : "text-gray-300 hover:text-pink-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-brand-pink">
                {rating === 1
                  ? "😞 Poor"
                  : rating === 2
                  ? "😕 Fair"
                  : rating === 3
                  ? "😊 Good"
                  : rating === 4
                  ? "😄 Very Good"
                  : "😍 Excellent"}
              </p>
              <span className="text-xs text-gray-500">{rating}/5 stars</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-pink-100"></div>

          {/* Title */}
          <div className="space-y-3">
            <label htmlFor="title" className="block text-sm font-bold text-gray-900">
              Review Title <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Amazing quality and fast shipping!"
                maxLength={100}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 text-sm transition-all"
              />
              <p className="text-xs text-gray-500 mt-2 text-right">{title.length}/100</p>
            </div>
          </div>

          {/* Product Variant */}
          <div className="space-y-3">
            <label htmlFor="variant" className="block text-sm font-bold text-gray-900">
              Product Variant <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                id="variant"
                type="text"
                value={productVariant}
                onChange={(e) => setProductVariant(e.target.value)}
                placeholder="e.g., 128GB Black, Size M, etc."
                maxLength={50}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 text-sm transition-all"
              />
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-3">
            <label htmlFor="review" className="block text-sm font-bold text-gray-900">
              Your Review <span className="text-brand-pink font-normal">*</span>
            </label>
            <div className="relative">
              <textarea
                id="review"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your honest experience... What did you love? Any concerns?"
                maxLength={1000}
                minLength={2}
                rows={6}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 text-sm resize-none transition-all"
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-gray-500">
                  {reviewText.length < 2 && reviewText.length > 0 ? (
                    <span className="text-red-500 font-semibold">
                      ⚠️ Minimum 2 characters ({2 - reviewText.length} more needed)
                    </span>
                  ) : (
                    <span className="text-gray-500">{reviewText.length}/1000 characters</span>
                  )}
                </p>
                <span className={`text-xs font-semibold ${reviewText.length >= 50 ? "text-green-600" : "text-gray-400"}`}>
                  {reviewText.length >= 50 ? "✓ Good length" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-pink-100"></div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border-2 border-pink-200 text-gray-700 font-semibold rounded-lg hover:bg-pink-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || reviewText.trim().length < 2}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-pink to-pink-600 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-pink-700 transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>

          {/* Info message */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
            <p className="text-xs text-gray-700 leading-relaxed">
              💡 <span className="font-semibold">Tip:</span> Be specific about what you liked or disliked. Helpful reviews help others make better decisions!
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}