import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Brand from "@/models/brand";
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
      query.name = { $regex: search, $options: "i" };
    }

    const total = await Brand.countDocuments(query);
    const brands = await Brand.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        success: true,
        data: brands,
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
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch brands" },
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

    const { name, description, image } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }

    const existingBrand = await Brand.findOne({
      name: { $regex: name, $options: "i" },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: "Brand with this name already exists" },
        { status: 400 }
      );
    }

    const brand = new Brand({
      name,
      description: description || "",
      image: image || "",
    });

    await brand.save();

    return NextResponse.json(
      {
        success: true,
        message: "Brand created successfully",
        data: brand,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create brand" },
      { status: 500 }
    );
  }
}