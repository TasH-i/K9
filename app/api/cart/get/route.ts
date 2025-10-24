// app/api/cart/get/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import CartItem from "@/models/cartItem";
import Product from "@/models/product";

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get user
    const User = require("@/models/user").default;
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get all cart items for user
    const cartItems = await CartItem.find({ userId: user._id }).lean();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { success: true, data: [] },
        { status: 200 }
      );
    }

    // Fetch all product data for these cart items
    const productIds = cartItems.map((item: any) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } })
      .populate("brand", "name image")
      .populate("category", "name")
      .lean();

    // Create a map of products by ID for quick lookup
    const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));

    // Merge cart items with product data
    const cartWithProducts = cartItems.map((item: any) => {
      const product = productMap.get(item.productId.toString());

      return {
        _id: item._id,
        productId: item.productId,
        userId: item.userId,
        quantity: item.quantity,
        selectedOption: item.selectedOption,
        addedAt: item.addedAt,
        // Product data
        name: product?.name || "Unknown Product",
        price: product?.price || 0,
        thumbnail: product?.thumbnail || "",
        brand: product?.brand || { name: "Unknown" },
        category: product?.category || { name: "Unknown" },
        stock: product?.stock || 0,
      };
    });

    return NextResponse.json(
      { success: true, data: cartWithProducts },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}