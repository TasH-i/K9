// app/api/coupons/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Coupon from "@/models/coupon";
import Product from "@/models/product";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { couponCode, productId } = body;

    if (!couponCode || !productId) {
      return NextResponse.json(
        { success: false, error: "Coupon code and product ID are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get the current date/time
    const now = new Date();

    const coupon = (await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean()) as any;

    // Find the coupon
    // const coupon = await Coupon.findOne({
    //   code: couponCode.toUpperCase(),
    //   isActive: true,
    //   startDate: { $lte: now },
    //   endDate: { $gte: now },
    // }).lean();

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Invalid coupon code or coupon has expired" },
        { status: 400 }
      );
    }

    // Get the product details
    const product = (await Product.findById(productId).lean()) as any;

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if coupon is applicable to this product
    const isApplicable =
      // Direct product match
      (coupon.applicableProducts &&
        coupon.applicableProducts.some(
          (id: any) => id.toString() === productId
        )) ||
      // Category match
      (coupon.applicableCategories &&
        coupon.applicableCategories.some(
          (id: any) => id.toString() === product.category.toString()
        )) ||
      // Brand match
      (coupon.applicableBrands &&
        coupon.applicableBrands.some(
          (id: any) => id.toString() === product.brand.toString()
        ));

    if (!isApplicable) {
      return NextResponse.json(
        {
          success: false,
          error: "This coupon is not applicable to this product",
        },
        { status: 400 }
      );
    }

    // Coupon is valid and applicable
    return NextResponse.json(
      {
        success: true,
        data: {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountPercentageValue: coupon.discountPercentageValue,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to validate coupon" },
      { status: 500 }
    );
  }
}