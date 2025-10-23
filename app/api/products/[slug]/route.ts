// app/api/products/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/product";



interface ProductDocument {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  oldPrice: number;
  sku: string;
  stock: number;
  brand: {
    _id: string;
    name: string;
    image: string;
  };
  category: {
    _id: string;
    name: string;
  };
  thumbnail?: string;
  images?: string[];
  attributes?: any[];
  options?: any[];
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
  isFeatured: boolean;
  isTodayDeal: boolean;
  isComingSoon: boolean;
  isCouponDeal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {

    
  try {
    const { slug } = await params;

    await dbConnect();

    const product = await Product.findOne({ slug: slug.toLowerCase() })
      .populate("brand", "name image")
      .populate("category", "name")
      .lean() as unknown as ProductDocument;

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Format product data
    const formattedProduct = {
      _id: product._id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      oldPrice: product.oldPrice,
      sku: product.sku,
      stock: product.stock,
      brand: {
        _id: product.brand?._id,
        name: product.brand?.name,
        image: product.brand?.image,
      },
      category: {
        _id: product.category?._id,
        name: product.category?.name,
      },
      thumbnail: product.thumbnail,
      images: product.images || [],
      attributes: product.attributes || [],
      options: product.options || [],
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isTodayDeal: product.isTodayDeal,
      isComingSoon: product.isComingSoon,
      isCouponDeal: product.isCouponDeal,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedProduct,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}