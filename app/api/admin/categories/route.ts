import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/models/category";
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

    const total = await Category.countDocuments(query);
    const categories = await Category.find(query)
      .populate("parentCategory", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        success: true,
        data: categories,
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
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch categories" },
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

    const { name, description, image, parentCategory } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const existingCategory = await Category.findOne({
      name: { $regex: name, $options: "i" },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    const category = new Category({
      name,
      description: description || "",
      image: image || "",
      parentCategory: parentCategory || null,
    });

    await category.save();
    await category.populate("parentCategory", "name slug");

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: category,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}