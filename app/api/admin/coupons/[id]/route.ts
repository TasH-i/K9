import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Coupon from "@/models/coupon";
import { verifyAdminAuth } from "@/app/api/admin/auth/route";

function computeIsActive(startDate: Date | string, endDate: Date | string): boolean {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  return now >= start && now <= end;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await verifyAdminAuth();
    if (!authCheck.isValid) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    await dbConnect();

    const coupon = await Coupon.findById(params.id).populate([
      { path: "applicableCategories", select: "name" },
      { path: "applicableBrands", select: "name" },
      { path: "applicableProducts", select: "name" },
    ]);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // Add computed isActive status
    const couponObject = coupon.toObject();
    couponObject.isActive = computeIsActive(coupon.startDate, coupon.endDate);

    return NextResponse.json(
      { success: true, data: couponObject },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await verifyAdminAuth();
    if (!authCheck.isValid) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    // Prevent code modification
    const { code, ...updateData } = body;

    // Validate date range if dates are being updated
    if (updateData.startDate && updateData.endDate) {
      const startDateTime = new Date(updateData.startDate);
      const endDateTime = new Date(updateData.endDate);
      if (endDateTime <= startDateTime) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        );
      }
    }

    // Validation for discount values based on type
    if (updateData.discountType === "fixed" && updateData.discountValue <= 0) {
      return NextResponse.json(
        { error: "Discount value must be greater than 0 for fixed discount type" },
        { status: 400 }
      );
    }

    if (
      updateData.discountType === "percentage" &&
      (updateData.discountPercentageValue <= 0 ||
        updateData.discountPercentageValue > 100)
    ) {
      return NextResponse.json(
        { error: "Discount percentage must be between 1 and 100" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "applicableCategories", select: "name" },
      { path: "applicableBrands", select: "name" },
      { path: "applicableProducts", select: "name" },
    ]);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // Add computed isActive status
    const couponObject = coupon.toObject();
    couponObject.isActive = computeIsActive(coupon.startDate, coupon.endDate);

    return NextResponse.json(
      {
        success: true,
        message: "Coupon updated successfully",
        data: couponObject,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update coupon" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await verifyAdminAuth();
    if (!authCheck.isValid) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    await dbConnect();

    const coupon = await Coupon.findByIdAndDelete(params.id);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Coupon deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete coupon" },
      { status: 500 }
    );
  }
}