import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Coupon from "@/models/coupon";
import { verifyAdminAuth } from "@/app/api/admin/auth/route";

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
    ]);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: coupon },
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

    const coupon = await Coupon.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "applicableCategories", select: "name" },
      { path: "applicableBrands", select: "name" },
    ]);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Coupon updated successfully",
        data: coupon,
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