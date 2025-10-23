import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/models/category";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Fetch only active categories with images, sorted by creation date
    const categories = await Category.find({
      isActive: true,
      image: { $exists: true, $ne: "" } // Only categories with images
    })
      .select("_id name image slug description")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: categories,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}