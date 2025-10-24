// app/api/cart/add/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import CartItem from "@/models/cartItem";
import Product from "@/models/product";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity = 1, selectedOption } = body;

    // Validate input
    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      // For guest users, return the data without saving (will be handled by client)
      return NextResponse.json(
        {
          success: true,
          message: "For guest users, save cart to localStorage",
          isGuest: true,
        },
        { status: 200 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get user ID from session
    const User = require("@/models/user").default;
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // ✨ NEW: Check if item already exists in cart
    const existingItem = await CartItem.findOne({
      userId: user._id,
      productId,
      selectedOption: selectedOption || "",
    });

    if (existingItem) {
      // ✨ NEW: Return response indicating item already exists
      return NextResponse.json(
        {
          success: false,
          error: "You already added that item to cart",
          isDuplicate: true,
          data: existingItem,
        },
        { status: 409 } // 409 Conflict status code for duplicates
      );
    }

    // Item doesn't exist, create new cart item
    const newCartItem = new CartItem({
      userId: user._id,
      productId,
      quantity: Math.max(1, quantity),
      selectedOption: selectedOption || "",
    });

    await newCartItem.save();

    return NextResponse.json(
      {
        success: true,
        message: "Item added to cart",
        data: newCartItem,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}