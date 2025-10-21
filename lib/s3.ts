import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a file to S3
 */
export async function uploadToS3(
  file: Buffer,
  fileName: string,
  mimeType: string
): Promise<UploadResult> {
  const key = `profiles/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: mimeType,
    // Make the file publicly readable
    // ACL: 'public-read', // Deprecated, use bucket policy instead
  });

  await s3Client.send(command);

  // Generate public URL
  const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { url, key };
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Extract S3 key from URL
 */
export function extractS3Key(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Extract key from URL path (remove leading /)
    return urlObj.pathname.substring(1);
  } catch {
    return null;
  }
}