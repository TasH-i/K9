// app/api/products/related/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/product";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("categoryId");
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: "categoryId is required" },
        { status: 400 }
      );
    }

    // Find products with the same category, excluding the current product
    const products = await Product.find({
      category: categoryId,
      _id: { $ne: productId }, // Exclude current product
      isActive: true,
    })
      .populate("brand", "name image")
      .populate("category", "name")
      .select(
        "name slug price oldPrice thumbnail category brand stock rating reviewCount createdAt"
      )
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    if (!products || products.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          message: "No related products found",
        },
        { status: 200 }
      );
    }

    // Format products
    const formattedProducts = products.map((product: any) => {
      return {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        image: product.thumbnail,
        price: `LKR ${product.price.toLocaleString("en-LK", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        oldPrice: product.oldPrice
          ? `LKR ${product.oldPrice.toLocaleString("en-LK", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : "",
        categoryName: product.category?.name || "General",
        brandName: product.brand?.name || "Unknown",
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
    console.error("Error fetching related products:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch related products" },
      { status: 500 }
    );
  }
}