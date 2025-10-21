import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
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

    const skip = (page - 1) * limit;

    let query: any = {};
    if (search) {
      query.code = { $regex: search, $options: "i" };
    }

    const total = await Coupon.countDocuments(query);
    const coupons = await Coupon.find(query)
      .populate("applicableCategories", "name")
      .populate("applicableBrands", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        success: true,
        data: coupons,
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
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch coupons" },
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
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minPurchaseAmount,
      maxUsageCount,
      applicableCategories,
      applicableBrands,
      startDate,
      endDate,
    } = body;

    if (!code || !discountType || !discountValue || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon with this code already exists" },
        { status: 400 }
      );
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      description: description || "",
      discountType,
      discountValue,
      maxDiscount: maxDiscount || null,
      minPurchaseAmount: minPurchaseAmount || 0,
      maxUsageCount: maxUsageCount || null,
      applicableCategories: applicableCategories || [],
      applicableBrands: applicableBrands || [],
      startDate,
      endDate,
    });

    await coupon.save();
    await coupon.populate([
      { path: "applicableCategories", select: "name" },
      { path: "applicableBrands", select: "name" },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Coupon created successfully",
        data: coupon,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create coupon" },
      { status: 500 }
    );
  }
}