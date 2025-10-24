// app/api/admin/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Review, { IReview } from "@/models/review";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOptions";
import User from "@/models/user";

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const filterProduct = searchParams.get("product") || "";
    const filterUser = searchParams.get("user") || "";
    const filterRating = searchParams.get("rating") || "";
    const skip = (page - 1) * limit;

    // Build search query
    let query: any = {};
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
      ];
    }

    // Add product filter
    if (filterProduct) {
      query.productName = { $regex: filterProduct, $options: "i" };
    }

    // Add user filter
    if (filterUser) {
      query.userName = { $regex: filterUser, $options: "i" };
    }

    // Add rating filter
    if (filterRating) {
      query.rating = parseInt(filterRating);
    }

    // Get all reviews (including unapproved)
    const reviews = await Review.find(query)
      .populate("user", "name email profilePicture")
      .populate("product", "name thumbnail")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const totalReviews = await Review.countDocuments(query);

    // Format response to show product and user details
    const formattedReviews = reviews.map((review) => ({
      _id: review._id,
      productName: review.productName,
      userName: review.userName,
      userEmail: review.userEmail,
      rating: review.rating,
      title: review.title,
      reviewText: review.reviewText,
      productVariant: review.productVariant,
      createdAt: review.createdAt,
      isApproved: review.isApproved,
      productThumbnail: review.product?.thumbnail || review.productThumbnail,
      userAvatar: review.user?.profilePicture || review.userAvatar,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          reviews: formattedReviews,
          totalReviews,
          page,
          limit,
          totalPages: Math.ceil(totalReviews / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching admin reviews:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// PATCH - Approve/Unapprove a review
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { reviewId, isApproved } = body;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "Review ID is required" },
        { status: 400 }
      );
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isApproved },
      { new: true }
    );

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Review updated successfully", data: review },
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