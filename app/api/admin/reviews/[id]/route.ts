import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Review from "@/models/review";
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
    const review = await Review.findById(params.id).populate([
      { path: "author", select: "name email" },
      { path: "products", select: "name sku" },
    ]);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: review },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch review" },
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

    const review = await Review.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "author", select: "name email" },
      { path: "products", select: "name sku" },
    ]);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Review updated successfully",
        data: review,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update review" },
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
    const review = await Review.findByIdAndDelete(params.id);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Review deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete review" },
      { status: 500 }
    );
  }
}