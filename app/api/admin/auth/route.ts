import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

const ALLOWED_ADMINS = process.env.ALLOWED_ADMINS?.split(",") || [];

export async function verifyAdminAuth() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return {
      isValid: false,
      error: "Unauthorized: Please login",
    };
  }

  const isAdmin = ALLOWED_ADMINS.includes(session.user.email);

  if (!isAdmin) {
    return {
      isValid: false,
      error: "Forbidden: Admin access required",
    };
  }

  return {
    isValid: true,
    user: session.user,
  };
}