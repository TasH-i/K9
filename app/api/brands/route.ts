// app/api/brands/route.ts - NEW PUBLIC ENDPOINT
// This endpoint is public (no auth required) and returns only active brands

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Brand from "@/models/brand";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Fetch only active brands with images
    const brands = await Brand.find({
      isActive: true,
      image: { $exists: true, $ne: "" } // Only brands with images
    })
      .select("_id name image")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: brands,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch brands" },
      { status: 500 }
    );
  }
}