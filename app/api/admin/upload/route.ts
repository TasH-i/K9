import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/app/api/admin/auth/route";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(request: NextRequest) {
  try {
    const authCheck = await verifyAdminAuth();
    if (!authCheck.isValid) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "admin";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const filename = `${folder}/${uuidv4()}-${file.name}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || "",
      Key: filename,
      Body: Buffer.from(buffer),
      ContentType: file.type,
      ACL: "public-read",
    });

    await s3Client.send(command);

    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;

    return NextResponse.json(
      {
        success: true,
        message: "File uploaded successfully",
        data: {
          url: fileUrl,
          filename: filename,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await verifyAdminAuth();
    if (!authCheck.isValid) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    const body = await request.json();
    const { filename } = body;

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || "",
      Key: filename,
    });

    await s3Client.send(command);

    return NextResponse.json(
      { success: true, message: "File deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete file" },
      { status: 500 }
    );
  }
}