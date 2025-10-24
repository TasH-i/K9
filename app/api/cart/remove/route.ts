// app/api/cart/remove/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import CartItem from "@/models/cartItem";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartItemId } = body;

    if (!cartItemId) {
      return NextResponse.json(
        { success: false, error: "Cart item ID is required" },
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

    // Delete cart item
    await CartItem.deleteOne({ _id: cartItemId });

    return NextResponse.json(
      { success: true, message: "Item removed from cart" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error removing cart item:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}