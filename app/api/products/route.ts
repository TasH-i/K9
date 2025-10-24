// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/product";
import Coupon from "@/models/coupon";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const categoryParam = searchParams.get("category") || "";
    const brandParam = searchParams.get("brand") || "";
    const sortBy = searchParams.get("sort") || "-createdAt";
    const minPrice = parseInt(searchParams.get("minPrice") || "0", 10);
    const maxPrice = parseInt(searchParams.get("maxPrice") || "999999999", 10);
    
    // Parse category filters (can be comma-separated)
    const categoryFilters = categoryParam
      .split(",")
      .map(c => c.trim())
      .filter(c => c);
    
    // Parse brand filters (can be comma-separated)
    const brandFilters = brandParam
      .split(",")
      .map(b => b.trim())
      .filter(b => b);
    
    // Parse availability filters (can be comma-separated or multiple params)
    const availabilityParam = searchParams.get("availability") || "";
    const availabilityFilters = availabilityParam
      .split(",")
      .map(a => a.trim().toLowerCase())
      .filter(a => a);

    // Build filter object
    let filter: any = {};

    // Search filter (searches in name and description)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter - handle multiple categories with $in
    if (categoryFilters.length > 0) {
      filter.category = { $in: categoryFilters };
    }

    // Brand filter - handle multiple brands with $in
    if (brandFilters.length > 0) {
      filter.brand = { $in: brandFilters };
    }

    // Price range filter
    filter.price = {
      $gte: minPrice,
      $lte: maxPrice,
    };

    // AVAILABILITY FILTERS - ENHANCED with Coupon Deal Support
    if (availabilityFilters.length > 0) {
      // Check if coupon deals filter is requested
      const hasCouponDealsFilter = availabilityFilters.includes("coupon deals");
      
      if (hasCouponDealsFilter) {
        // Get current date for checking active coupons
        const now = new Date();

        // Fetch all active coupons
        const activeCoupons = await Coupon.find({
          isActive: true,
          startDate: { $lte: now },
          endDate: { $gte: now },
        }).lean();

        // If no active coupons, return empty result for coupon deals filter
        if (!activeCoupons || activeCoupons.length === 0) {
          // If ONLY coupon deals is selected, return empty
          if (availabilityFilters.length === 1) {
            const skip = (page - 1) * limit;
            return NextResponse.json(
              {
                success: true,
                data: [],
                stats: {
                  page,
                  limit,
                  total: 0,
                  pages: 0,
                  hasNextPage: false,
                  hasPrevPage: false,
                },
                message: "No products with active coupons found",
              },
              { status: 200 }
            );
          }
          // Otherwise, just ignore the coupon filter and continue with other filters
        } else {
          // Collect all product IDs, category IDs, and brand IDs that have active coupons
          const productIdsWithCoupons = new Set<string>();
          const categoryIdsWithCoupons = new Set<string>();
          const brandIdsWithCoupons = new Set<string>();

          activeCoupons.forEach((coupon: any) => {
            // Add products from applicableProducts array
            if (coupon.applicableProducts && Array.isArray(coupon.applicableProducts)) {
              coupon.applicableProducts.forEach((productId: any) => {
                productIdsWithCoupons.add(productId.toString());
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

          // Build coupon filter conditions
          const couponQueryConditions: any[] = [];

          if (productIdsWithCoupons.size > 0) {
            couponQueryConditions.push({ _id: { $in: Array.from(productIdsWithCoupons) } });
          }

          if (categoryIdsWithCoupons.size > 0) {
            couponQueryConditions.push({ category: { $in: Array.from(categoryIdsWithCoupons) } });
          }

          if (brandIdsWithCoupons.size > 0) {
            couponQueryConditions.push({ brand: { $in: Array.from(brandIdsWithCoupons) } });
          }

          // Merge coupon filter with existing filter
          if (couponQueryConditions.length > 0) {
            if (filter.$or) {
              // If there's already an OR condition (from search), merge them
              filter = {
                $and: [
                  { $or: filter.$or },
                  { $or: couponQueryConditions },
                ],
              };
              delete filter.$or;
            } else {
              // Otherwise just use the coupon conditions
              filter.$or = couponQueryConditions;
            }
          }
        }
      }

      // Build availability conditions for other filters
      const availabilityConditions: any[] = [];

      if (availabilityFilters.includes("today's deals")) {
        availabilityConditions.push({ isTodayDeal: true });
      }

      if (availabilityFilters.includes("featured")) {
        availabilityConditions.push({ isFeatured: true });
      }

      if (availabilityFilters.includes("coming soon")) {
        availabilityConditions.push({ isComingSoon: true });
      }

      if (availabilityFilters.includes("in stock")) {
        availabilityConditions.push({ stock: { $gt: 0 } });
      }

      if (availabilityFilters.includes("out of stock")) {
        availabilityConditions.push({ stock: { $eq: 0 } });
      }

      // If "all products" is selected, don't filter by availability
      if (
        !availabilityFilters.includes("all products") &&
        availabilityConditions.length > 0 &&
        !hasCouponDealsFilter
      ) {
        // Only apply these if coupon deals wasn't already handled
        if (filter.$or) {
          filter = {
            $and: [
              { $or: filter.$or },
              { $or: availabilityConditions },
            ],
          };
          delete filter.$or;
        } else {
          filter.$or = availabilityConditions;
        }
      } else if (
        !availabilityFilters.includes("all products") &&
        availabilityConditions.length > 0 &&
        hasCouponDealsFilter
      ) {
        // Merge coupon deals with other availability filters
        if (filter.$or) {
          // Combine with existing $or
          filter.$or.push(...availabilityConditions);
        } else {
          filter.$or = availabilityConditions;
        }
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch products with population
    const products = await Product.find(filter)
      .populate("category", "name slug")
      .populate("brand", "name slug logo")
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Get active coupons for enriching product data
    const now = new Date();
    const activeCoupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean();

    // Create coupon maps for quick lookup
    const productCouponMap = new Map<string, any[]>();
    const categoryCouponMap = new Map<string, any[]>();
    const brandCouponMap = new Map<string, any[]>();

    activeCoupons.forEach((coupon: any) => {
      // Map products
      if (coupon.applicableProducts && Array.isArray(coupon.applicableProducts)) {
        coupon.applicableProducts.forEach((productId: any) => {
          const productIdStr = productId.toString();
          if (!productCouponMap.has(productIdStr)) {
            productCouponMap.set(productIdStr, []);
          }
          productCouponMap.get(productIdStr)?.push({
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
          });
        });
      }

      // Map categories
      if (coupon.applicableCategories && Array.isArray(coupon.applicableCategories)) {
        coupon.applicableCategories.forEach((categoryId: any) => {
          const categoryIdStr = categoryId.toString();
          if (!categoryCouponMap.has(categoryIdStr)) {
            categoryCouponMap.set(categoryIdStr, []);
          }
          categoryCouponMap.get(categoryIdStr)?.push({
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
          });
        });
      }

      // Map brands
      if (coupon.applicableBrands && Array.isArray(coupon.applicableBrands)) {
        coupon.applicableBrands.forEach((brandId: any) => {
          const brandIdStr = brandId.toString();
          if (!brandCouponMap.has(brandIdStr)) {
            brandCouponMap.set(brandIdStr, []);
          }
          brandCouponMap.get(brandIdStr)?.push({
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
          });
        });
      }
    });

    // Transform products for frontend
    const transformedProducts = products.map((product: any) => {
      const productIdStr = product._id.toString();
      const categoryIdStr = product.category?._id?.toString();
      const brandIdStr = product.brand?._id?.toString();

      // Collect all applicable coupons for this product
      const applicableCoupons: any[] = [];
      const couponCodeSet = new Set<string>();

      // From direct product coupons
      const productCoupons = productCouponMap.get(productIdStr) || [];
      productCoupons.forEach((coupon: any) => {
        if (!couponCodeSet.has(coupon.code)) {
          applicableCoupons.push(coupon);
          couponCodeSet.add(coupon.code);
        }
      });

      // From category coupons
      if (categoryIdStr) {
        const categoryCoupons = categoryCouponMap.get(categoryIdStr) || [];
        categoryCoupons.forEach((coupon: any) => {
          if (!couponCodeSet.has(coupon.code)) {
            applicableCoupons.push(coupon);
            couponCodeSet.add(coupon.code);
          }
        });
      }

      // From brand coupons
      if (brandIdStr) {
        const brandCoupons = brandCouponMap.get(brandIdStr) || [];
        brandCoupons.forEach((coupon: any) => {
          if (!couponCodeSet.has(coupon.code)) {
            applicableCoupons.push(coupon);
            couponCodeSet.add(coupon.code);
          }
        });
      }

      // Determine if product is a coupon deal
      const isCouponDeal = applicableCoupons.length > 0;

      return {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        image: product.image,
        thumbnail: product.thumbnail || product.image,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        category: product.category || { name: "Uncategorized" },
        brand: product.brand || { name: "Unknown" },
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        stock: product.stock || 0,
        inStock: (product.stock || 0) > 0,
        discount: product.discount || 0,
        tags: product.tags || [],
        specifications: product.specifications || [],
        galleryImages: product.galleryImages || [],
        // Include availability flags for frontend
        isCouponDeal: isCouponDeal,
        isTodayDeal: product.isTodayDeal || false,
        isFeatured: product.isFeatured || false,
        isComingSoon: product.isComingSoon || false,
        // Include coupons data
        applicableCoupons: applicableCoupons,
        bestCoupon: applicableCoupons.length > 0 ? applicableCoupons[0] : null,
      };
    });

    // Calculate stats
    const stats = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };

    return NextResponse.json(
      {
        success: true,
        data: transformedProducts,
        stats,
        message: "Products fetched successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching products:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}