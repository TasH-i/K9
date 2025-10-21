import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/user';
import jwt from 'jsonwebtoken';
import { uploadToS3, deleteFromS3, extractS3Key } from '@/lib/s3';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Get form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${decoded.userId}_${Date.now()}.${fileExtension}`;

    // Connect to database to get old profile picture
    await connectDB();
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete old profile picture from S3 if exists
    if (user.profilePicture) {
      const oldKey = extractS3Key(user.profilePicture);
      if (oldKey) {
        try {
          await deleteFromS3(oldKey);
        } catch (error) {
          console.error('Error deleting old profile picture:', error);
          // Continue even if delete fails
        }
      }
    }

    // Upload to S3
    const { url } = await uploadToS3(buffer, fileName, file.type);

    // Update user profile picture in database
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { profilePicture: url },
      { new: true }
    ).select('-password');

    return NextResponse.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: url,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload profile picture' },
      { status: 500 }
    );
  }
}

// Note: bodyParser is handled automatically in App Router
export const config = {
  api: {
    bodyParser: false,
  },
};