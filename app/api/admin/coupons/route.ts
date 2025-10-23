import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Coupon from "@/models/coupon";
import { verifyAdminAuth } from "@/app/api/admin/auth/route";

// Helper function to compute isActive status
function computeIsActive(startDate: Date | string, endDate: Date | string): boolean {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  return now >= start && now <= end;
}

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
      .populate("applicableProducts", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Add computed isActive status to each coupon
    const couponsWithStatus = coupons.map((coupon: any) => {
      const couponObj = coupon.toObject ? coupon.toObject() : coupon;
      return {
        ...couponObj,
        isActive: computeIsActive(couponObj.startDate, couponObj.endDate),
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: couponsWithStatus,
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
      discountPercentageValue,
      applicableCategories,
      applicableBrands,
      applicableProducts,
      startDate,
      endDate,
    } = body;

    // Validation
    if (!code || !discountType || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (
      discountType === "fixed" &&
      (discountValue === undefined || discountValue === null || discountValue <= 0)
    ) {
      return NextResponse.json(
        { error: "Discount value is required for fixed discount type" },
        { status: 400 }
      );
    }

    if (
      discountType === "percentage" &&
      (discountPercentageValue === undefined ||
        discountPercentageValue === null ||
        discountPercentageValue <= 0)
    ) {
      return NextResponse.json(
        { error: "Discount percentage is required for percentage discount type" },
        { status: 400 }
      );
    }

    // Validate end date is after start date
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    if (endDateTime <= startDateTime) {
      return NextResponse.json(
        { error: "End date must be after start date" },
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
      discountValue: discountType === "fixed" ? discountValue : 0,
      discountPercentageValue:
        discountType === "percentage" ? discountPercentageValue : 0,
      applicableCategories: applicableCategories || [],
      applicableBrands: applicableBrands || [],
      applicableProducts: applicableProducts || [],
      startDate,
      endDate,
    });

    await coupon.save();
    await coupon.populate([
      { path: "applicableCategories", select: "name" },
      { path: "applicableBrands", select: "name" },
      { path: "applicableProducts", select: "name" },
    ]);

    // Add computed isActive status
    const couponObject = coupon.toObject();
    couponObject.isActive = computeIsActive(coupon.startDate, coupon.endDate);

    return NextResponse.json(
      {
        success: true,
        message: "Coupon created successfully",
        data: couponObject,
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