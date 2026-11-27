import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tokenUser = await getCurrentUser();
  if (!tokenUser) {
    return NextResponse.json({ user: null });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
      },
    });

    if (dbUser) {
      return NextResponse.json({ user: dbUser });
    }
  } catch (error) {
    console.error("Error fetching db user in /api/auth/me:", error);
  }

  return NextResponse.json({
    user: {
      ...tokenUser,
      id: tokenUser.userId,
      emailVerified: true,
    },
  });
}
