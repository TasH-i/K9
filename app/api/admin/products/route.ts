import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/product";
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
    const brand = searchParams.get("brand");
    const category = searchParams.get("category");

    const skip = (page - 1) * limit;

    let query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }
    if (brand) query.brand = brand;
    if (category) query.category = category;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("brand", "name")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        success: true,
        data: products,
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
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
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
      name,
      description,
      shortDescription,
      price,
      comparePrice,
      cost,
      sku,
      stock,
      brand,
      category,
      images,
      thumbnail,
      attributes,
      weight,
      dimensions,
      seo,
    } = body;

    if (!name || !description || !price || !sku || !brand || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSku) {
      return NextResponse.json(
        { error: "Product with this SKU already exists" },
        { status: 400 }
      );
    }

    const product = new Product({
      name,
      description,
      shortDescription: shortDescription || "",
      price,
      comparePrice: comparePrice || 0,
      cost: cost || 0,
      sku: sku.toUpperCase(),
      stock: stock || 0,
      brand,
      category,
      images: images || [],
      thumbnail: thumbnail || "",
      attributes: attributes || [],
      weight: weight || 0,
      dimensions: dimensions || {},
      seo: seo || {},
    });

    await product.save();
    await product.populate([
      { path: "brand", select: "name" },
      { path: "category", select: "name" },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: product,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}