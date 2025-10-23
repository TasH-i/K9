// app/api/admin/brands/[id]/route.ts
// FIXED for Next.js 15 - params must be awaited

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Brand from '@/models/brand'; // Your model
import  connectToDatabase  from '@/lib/db';

// GET single brand by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    //  AWAIT params (Next.js 15 requirement)
    const { id } = await params;
    
    const brand = await Brand.findById(id);

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand' },
      { status: 500 }
    );
  }
}

// PUT update brand by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !process.env.ALLOWED_ADMINS?.includes(session.user.email)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    //  AWAIT params
    const { id } = await params;
    
    const body = await request.json();

    const brand = await Brand.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Brand updated successfully',
      brand,
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json(
      { error: 'Failed to update brand' },
      { status: 500 }
    );
  }
}

// DELETE brand by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !process.env.ALLOWED_ADMINS?.includes(session.user.email)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    //  AWAIT params
    const { id } = await params;
    
    const brand = await Brand.findByIdAndDelete(id);

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Delete S3 image if filename exists
    if (brand.imageFilename) {
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/admin/upload`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: brand.imageFilename }),
        });
      } catch (uploadError) {
        console.error('Error deleting S3 file:', uploadError);
        // Don't fail if S3 delete fails
      }
    }

    return NextResponse.json({
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    );
  }
}