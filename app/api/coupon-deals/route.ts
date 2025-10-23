// app/api/coupon-deals/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/product";
import Coupon from "@/models/coupon";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "25");

    // Get current date for checking active coupons
    const now = new Date();

    // Get all active coupons
    const activeCoupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .select("code description discountType discountValue applicableProducts applicableCategories applicableBrands")
      .lean();

    if (!activeCoupons || activeCoupons.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          message: "No active coupons available",
        },
        { status: 200 }
      );
    }

    // Collect all product IDs, category IDs, and brand IDs that have active coupons
    const productIdsWithCoupons = new Set();
    const categoryIdsWithCoupons = new Set();
    const brandIdsWithCoupons = new Set();
    const couponMap = new Map(); // Maps product ID to coupons

    activeCoupons.forEach((coupon) => {
      // Add products from applicableProducts array
      if (coupon.applicableProducts && Array.isArray(coupon.applicableProducts)) {
        coupon.applicableProducts.forEach((productId: any) => {
          const productIdStr = productId.toString();
          productIdsWithCoupons.add(productIdStr);

          if (!couponMap.has(productIdStr)) {
            couponMap.set(productIdStr, []);
          }
          couponMap.get(productIdStr).push({
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
          });
        });
      }

      // Add categories from applicableCategories array
      if (coupon.applicableCategories && Array.isArray(coupon.applicableCategories)) {
        coupon.applicableCategories.forEach((categoryId: any) => {
          categoryIdsWithCoupons.add(categoryId.toString());
        });
      }

      // Add brands from applicableBrands array
      if (coupon.applicableBrands && Array.isArray(coupon.applicableBrands)) {
        coupon.applicableBrands.forEach((brandId: any) => {
          brandIdsWithCoupons.add(brandId.toString());
        });
      }
    });

    // Query for products
    let query: any = { isActive: true };

    // If we have specific product IDs, categories, or brands with coupons
    if (
      productIdsWithCoupons.size > 0 ||
      categoryIdsWithCoupons.size > 0 ||
      brandIdsWithCoupons.size > 0
    ) {
      const productIds = Array.from(productIdsWithCoupons);
      const categoryIds = Array.from(categoryIdsWithCoupons);
      const brandIds = Array.from(brandIdsWithCoupons);

      // Products matching ANY of:
      // 1. Directly in applicableProducts, OR
      // 2. Their category is in applicableCategories, OR
      // 3. Their brand is in applicableBrands
      query.$or = [];

      if (productIds.length > 0) {
        query.$or.push({ _id: { $in: productIds } });
      }
      if (categoryIds.length > 0) {
        query.$or.push({ category: { $in: categoryIds } });
      }
      if (brandIds.length > 0) {
        query.$or.push({ brand: { $in: brandIds } });
      }
    } else {
      return NextResponse.json(
        {
          success: true,
          data: [],
          message: "No products match active coupons",
        },
        { status: 200 }
      );
    }

    // Fetch products - SORT BY LATEST FIRST (descending by createdAt)
    const products = await Product.find(query)
      .populate("brand", "name")
      .populate("category", "name")
      .select(
        "name slug price oldPrice thumbnail images stock rating reviewCount category brand createdAt"
      )
      .sort({ createdAt: -1 }) // ← ADDED: Sort newest first
      .limit(limit)
      .lean();

    // For each product, get its applicable coupons
    const formattedProducts = products.map((product: any) => {
      const productIdStr = product._id.toString();
      const categoryIdStr = product.category?._id?.toString();
      const brandIdStr = product.brand?._id?.toString();

      // Get coupons from direct product mapping
      let applicableCoupons = couponMap.get(productIdStr) || [];

      // Also get coupons from category mapping
      activeCoupons.forEach((coupon) => {
        if (
          coupon.applicableCategories &&
          coupon.applicableCategories.some(
            (catId: any) => catId.toString() === categoryIdStr
          )
        ) {
          const alreadyExists = applicableCoupons.some(
            (c: any) => c.code === coupon.code
          );
          if (!alreadyExists) {
            applicableCoupons.push({
              code: coupon.code,
              description: coupon.description,
              discountType: coupon.discountType,
              discountValue: coupon.discountValue,
            });
          }
        }
      });

      // Also get coupons from brand mapping
      activeCoupons.forEach((coupon) => {
        if (
          coupon.applicableBrands &&
          coupon.applicableBrands.some(
            (brandId: any) => brandId.toString() === brandIdStr
          )
        ) {
          const alreadyExists = applicableCoupons.some(
            (c: any) => c.code === coupon.code
          );
          if (!alreadyExists) {
            applicableCoupons.push({
              code: coupon.code,
              description: coupon.description,
              discountType: coupon.discountType,
              discountValue: coupon.discountValue,
            });
          }
        }
      });

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
          : null,
        categoryName: product.category?.name || "General",
        stock: product.stock || 0,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        couponDeal: true,
        galleryImages: product.images || [product.thumbnail],
        coupons: applicableCoupons,
        bestCoupon: applicableCoupons.length > 0 ? applicableCoupons[0] : null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: formattedProducts,
        count: formattedProducts.length,
        totalAvailable:
          productIdsWithCoupons.size +
          categoryIdsWithCoupons.size +
          brandIdsWithCoupons.size,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching coupon deals:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch coupon deals" },
      { status: 500 }
    );
  }
}