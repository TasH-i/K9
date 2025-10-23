import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/product";
import Coupon from "@/models/coupon";
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
    const brand = searchParams.get("brand");
    const category = searchParams.get("category");

    const skip = (page - 1) * limit;

    let query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }
    if (brand) query.brand = brand;
    if (category) query.category = category;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("brand", "name")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get all active coupons with their applicable products, categories, and brands
    const now = new Date();
    const activeCoupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean();

    // Create sets for products, categories, and brands with active coupons
    const productIdsWithCoupons = new Set();
    const categoryIdsWithCoupons = new Set();
    const brandIdsWithCoupons = new Set();

    activeCoupons.forEach((coupon) => {
      // Add specific products
      if (coupon.applicableProducts && Array.isArray(coupon.applicableProducts)) {
        coupon.applicableProducts.forEach((productId) => {
          productIdsWithCoupons.add(productId.toString());
        });
      }

      // Add categories
      if (coupon.applicableCategories && Array.isArray(coupon.applicableCategories)) {
        coupon.applicableCategories.forEach((categoryId) => {
          categoryIdsWithCoupons.add(categoryId.toString());
        });
      }

      // Add brands
      if (coupon.applicableBrands && Array.isArray(coupon.applicableBrands)) {
        coupon.applicableBrands.forEach((brandId) => {
          brandIdsWithCoupons.add(brandId.toString());
        });
      }
    });

    // Map products and add coupon status based on active coupons
    const productsWithCouponStatus = products.map((product: any) => {
      const productIdStr = product._id.toString();
      const categoryIdStr = product.category?._id?.toString();
      const brandIdStr = product.brand?._id?.toString();

      // Check if product has coupon from:
      // 1. Direct product ID match
      // 2. Category match
      // 3. Brand match
      const hasCoupon =
        product.isCouponDeal ||
        productIdsWithCoupons.has(productIdStr) ||
        (categoryIdStr && categoryIdsWithCoupons.has(categoryIdStr)) ||
        (brandIdStr && brandIdsWithCoupons.has(brandIdStr));

      // Collect all applicable coupon codes for this product
      const applicableCoupons = activeCoupons
        .filter((coupon) => {
          // Check if product is in applicableProducts
          if (coupon.applicableProducts?.some((pid: any) => pid.toString() === productIdStr)) {
            return true;
          }
          // Check if product's category is in applicableCategories
          if (
            categoryIdStr &&
            coupon.applicableCategories?.some((cid: any) => cid.toString() === categoryIdStr)
          ) {
            return true;
          }
          // Check if product's brand is in applicableBrands
          if (
            brandIdStr &&
            coupon.applicableBrands?.some((bid: any) => bid.toString() === brandIdStr)
          ) {
            return true;
          }
          return false;
        })
        .map((c: any) => c.code);

      return {
        ...product,
        isCouponDeal: hasCoupon,
        applicableCoupons: applicableCoupons,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: productsWithCouponStatus,
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
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
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
      name,
      description,
      shortDescription,
      price,
      oldPrice,
      sku,
      stock,
      brand,
      category,
      thumbnail,
      images,
      attributes,
      options,
      isTodayDeal,
      isComingSoon,
    } = body;

    // Validation
    if (!name || !description || !price || !sku || !brand || !category) {
      return NextResponse.json(
        { error: "Missing required fields: name, description, price, sku, brand, category" },
        { status: 400 }
      );
    }

    if (!thumbnail) {
      return NextResponse.json(
        { error: "Thumbnail image is required" },
        { status: 400 }
      );
    }

    // Check duplicate SKU
    const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSku) {
      return NextResponse.json(
        { error: "Product with this SKU already exists" },
        { status: 400 }
      );
    }

    const product = new Product({
      name,
      description,
      shortDescription: shortDescription || "",
      price,
      oldPrice: oldPrice || 0,
      sku: sku.toUpperCase(),
      stock: stock || 0,
      brand,
      category,
      thumbnail,
      images: images || [],
      attributes: attributes || [],
      options: options || [],
      isTodayDeal: isTodayDeal || false,
      isComingSoon: isComingSoon || false,
      isCouponDeal: false,
    });

    await product.save();
    await product.populate([
      { path: "brand", select: "name" },
      { path: "category", select: "name" },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: product,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}