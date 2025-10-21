import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Review from "@/models/review";
import { verifyAdminAuth } from "@/app/api/admin/auth/route";

export async function GET(request: NextRequest) {
  try {
    const authCheck = await verifyAdminAuth();
    if (!authCheck.isValid) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const approved = searchParams.get("approved");

    const skip = (page - 1) * limit;

    let query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }
    if (approved !== null && approved !== undefined) {
      query.isApproved = approved === "true";
    }

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate("author", "name email")
      .populate("products", "name sku")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        success: true,
        data: reviews,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await verifyAdminAuth();
    if (!authCheck.isValid) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    const {
      title,
      content,
      rating,
      author,
      products,
      isVerifiedPurchase,
      isApproved,
    } = body;

    if (!title || !content || !rating || !author || !products) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const review = new Review({
      title,
      content,
      rating,
      author,
      products: Array.isArray(products) ? products : [products],
      isVerifiedPurchase: isVerifiedPurchase || false,
      isApproved: isApproved || false,
    });

    await review.save();
    await review.populate([
      { path: "author", select: "name email" },
      { path: "products", select: "name sku" },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Review created successfully",
        data: review,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}