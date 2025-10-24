// app/api/cart/route.ts - NEW FILE for logged-in users
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';

// This is a placeholder for future implementation
// Currently, logged-in users can use the guest cart persisted in localStorage
// When you add user cart storage to MongoDB, use this endpoint

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Implement when you add CartItem schema to MongoDB
    // await dbConnect();
    // const cartItems = await CartItem.find({ userEmail: session.user.email });
    // return NextResponse.json({
    //   success: true,
    //   items: cartItems,
    // });

    // For now, return empty cart (guest cart is in localStorage)
    return NextResponse.json(
      {
        success: true,
        message: 'Use guest cart from localStorage for now',
        items: [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Implement when you add CartItem schema to MongoDB
    // const body = await request.json();
    // await dbConnect();
    // const cartItem = new CartItem({
    //   userEmail: session.user.email,
    //   productId: body.productId,
    //   quantity: body.quantity,
    //   selectedOption: body.selectedOption,
    // });
    // await cartItem.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Use Redux + localStorage for now',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error saving cart:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Implement when you add CartItem schema to MongoDB
    // await dbConnect();
    // await CartItem.deleteMany({ userEmail: session.user.email });

    return NextResponse.json(
      {
        success: true,
        message: 'Cart cleared',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to clear cart' },
      { status: 500 }
    );
  }
}