import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Brand from "@/models/brand";
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
    const brand = await Brand.findById(params.id);

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: brand }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch brand" },
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

    const brand = await Brand.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Brand updated successfully",
        data: brand,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update brand" },
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
    const brand = await Brand.findByIdAndDelete(params.id);

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Brand deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete brand" },
      { status: 500 }
    );
  }
}