import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/user';
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function PUT(req: NextRequest) {
  try {
    let userId: string | null = null;

    // Try to get NextAuth session (OAuth users)
    const session = await getServerSession(authOptions);
    
    if (session?.user?.id) {
      // OAuth user
      userId = session.user.id;
    } else {
      // Traditional JWT user
      const token = req.cookies.get('auth-token')?.value || 
                    req.headers.get('authorization')?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      }

      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, bio, phone, address, profilePicture } = body;

    // Connect to database
    await connectDB();

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(profilePicture !== undefined && { profilePicture }),
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || '',
        bio: user.bio || '',
        phone: user.phone || '',
        address: user.address || '',
        authProvider: user.authProvider || 'local',
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}