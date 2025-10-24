// app/api/reviews/route.ts - UPDATED VERSION (Using localStorage user data)
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Review, { IReview } from "@/models/review";
import Product from "@/models/product";
import User from "@/models/user";

// GET reviews for a product
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = parseInt(searchParams.get("skip") || "0", 10);

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get all approved reviews for the product
    const reviews = (await Review.find({
      product: productId,
      isApproved: true,
    })
      .populate("user", "name email profilePicture")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()) as unknown as IReview[];

    // Count total reviews
    const totalReviews = await Review.countDocuments({
      product: productId,
      isApproved: true,
    });

    // Calculate rating breakdown
    const allReviews = (await Review.find({
      product: productId,
      isApproved: true,
    }).lean()) as unknown as IReview[];

    const ratingBreakdown = [1, 2, 3, 4, 5].map((star) => {
      const count = allReviews.filter((r) => r.rating === star).length;
      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
      return {
        stars: star,
        percentage: Math.round(percentage),
        count,
      };
    });

    // Calculate average rating
    const averageRating =
      totalReviews > 0
        ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          reviews,
          totalReviews,
          averageRating: parseFloat(averageRating as string),
          ratingBreakdown,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST - Create a new review (UPDATED: Uses user data from request body)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      productId, 
      rating, 
      title, 
      reviewText, 
      productVariant,
      userEmail,
      userId,
      userName,
      userAvatar
    } = body;

    // ✅ Validate user data from client
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "You must be logged in to add a review" },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!productId || !rating || !reviewText) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Validate review text length
    if (reviewText.trim().length < 2 || reviewText.trim().length > 1000) {
      return NextResponse.json(
        { success: false, error: "Review must be between 2 and 1000 characters" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // ✅ Updated: Find user by email (case-insensitive)
    const userEmailLower = userEmail.toLowerCase().trim();
    let user = await User.findOne({ 
      email: { $regex: `^${userEmailLower}$`, $options: "i" }
    });

    if (!user) {
      console.error(`User not found for email: ${userEmailLower}`);
      return NextResponse.json(
        { success: false, error: "User profile not found. Please log out and log in again." },
        { status: 404 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: user._id,
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Create new review
    const newReview = new Review({
      product: productId,
      user: user._id,
      rating,
      title: title || "",
      reviewText: reviewText.trim(),
      userEmail: userEmail,
      userName: userName || user.name || "Anonymous",
      userAvatar: userAvatar || user.profilePicture || null,
      productName: product.name,
      productVariant: productVariant || null,
      isApproved: true, // Auto-approve for all logged users
    });

    const savedReview = (await newReview.save()) as IReview;

    // Update product's review count and average rating
    const updatedReviews = (await Review.find({
      product: productId,
      isApproved: true,
    }).lean()) as unknown as IReview[];

    const totalReviews = updatedReviews.length;
    const averageRating =
      totalReviews > 0
        ? updatedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    await Product.findByIdAndUpdate(productId, {
      reviewCount: totalReviews,
      rating: averageRating,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Review added successfully",
        data: savedReview,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}

// PUT - Update a review (user can only update their own)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      reviewId, 
      rating, 
      title, 
      reviewText, 
      productVariant,
      userEmail 
    } = body;

    // ✅ Validate user data from client
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "You must be logged in" },
        { status: 401 }
      );
    }

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "Review ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    // Check if user owns this review
    const userEmailLower = userEmail.toLowerCase().trim();
    const user = await User.findOne({ 
      email: { $regex: `^${userEmailLower}$`, $options: "i" }
    });

    if (!user || review.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: "You can only edit your own reviews" },
        { status: 403 }
      );
    }

    // Update review
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (reviewText) review.reviewText = reviewText.trim();
    if (productVariant) review.productVariant = productVariant;

    const updatedReview = await review.save();

    return NextResponse.json(
      {
        success: true,
        message: "Review updated successfully",
        data: updatedReview,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review (user can delete their own, admin can delete any)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, userEmail } = body;

    // ✅ Validate user data from client
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "You must be logged in" },
        { status: 401 }
      );
    }

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "Review ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    const userEmailLower = userEmail.toLowerCase().trim();
    const user = await User.findOne({ 
      email: { $regex: `^${userEmailLower}$`, $options: "i" }
    });

    const isAdmin = user?.role === "admin" || user?.role === "superadmin";

    // Check if user owns this review or is admin
    if (!user || (review.user.toString() !== user._id.toString() && !isAdmin)) {
      return NextResponse.json(
        { success: false, error: "You can only delete your own reviews" },
        { status: 403 }
      );
    }

    const productId = review.product;

    // Delete review
    await Review.findByIdAndDelete(reviewId);

    // Update product's review count and average rating
    const updatedReviews = (await Review.find({
      product: productId,
      isApproved: true,
    }).lean()) as unknown as IReview[];

    const totalReviews = updatedReviews.length;
    const averageRating =
      totalReviews > 0
        ? updatedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    await Product.findByIdAndUpdate(productId, {
      reviewCount: totalReviews,
      rating: averageRating,
    });

    return NextResponse.json(
      { success: true, message: "Review deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete review" },
      { status: 500 }
    );
  }
}