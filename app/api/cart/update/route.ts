// app/api/cart/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import CartItem from "@/models/cartItem";
import Product from "@/models/product";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId || !quantity) {
      return NextResponse.json(
        { success: false, error: "Cart item ID and quantity are required" },
        { status: 400 }
      );
    }

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

    // Get cart item
    const cartItem = await CartItem.findById(cartItemId);

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: "Cart item not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (cartItem.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get product to check stock
    const product = await Product.findById(cartItem.productId);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Update quantity
    if (quantity <= 0) {
      // Delete if quantity is 0 or negative
      await CartItem.deleteOne({ _id: cartItemId });
      return NextResponse.json(
        { success: true, message: "Item removed from cart" },
        { status: 200 }
      );
    } else {
      // Cap at available stock
      let finalQuantity = quantity;
      if (product.stock && quantity > product.stock) {
        finalQuantity = product.stock;
      }

      cartItem.quantity = finalQuantity;
      await cartItem.save();

      return NextResponse.json(
        {
          success: true,
          message: "Cart item updated",
          data: cartItem,
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}