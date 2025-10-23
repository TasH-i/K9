// app/api/today-deals/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/product";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Fetch exactly 10 products with isTodayDeal: true
    const products = await Product.find({
      isTodayDeal: true,
      isActive: true,
    })
      .populate("brand", "name image")  // ← FIXED: Added "image" to populate
      .populate("category", "name")
      .select(
        "name slug price oldPrice shortDescription  thumbnail brand category stock rating reviewCount"
      )
      .sort({ createdAt: -1 }) 
      .limit(10)
      .lean();

    if (!products || products.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          message: "No today's deals available",
        },
        { status: 200 }
      );
    }

    // Format products to match component expectations
    const formattedProducts = products.map((product: any, index: number) => {
      return {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        logo: product.brand?.image || "/products/logo-default.png", // Now gets the actual brand image
        image: product.thumbnail,
        subtitle: product.shortDescription || "No description available",
        price: `LKR ${product.price.toLocaleString("en-LK", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        stock: product.stock || 0,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: formattedProducts,
        count: formattedProducts.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching today's deals:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch today's deals" },
      { status: 500 }
    );
  }
}