import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);

export async function POST(req: NextRequest) {
  try {
    if (!clientId) {
      return NextResponse.json({ error: "Google authentication is not configured" }, { status: 500 });
    }

    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ error: "Missing Google credential" }, { status: 400 });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 400 });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || "Google User";

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create user with a random dummy password since they authenticate via Google
      const dummyPasswordHash = await bcrypt.hash(Math.random().toString(36), 10);
      const totalUsers = await prisma.user.count();
      const role = totalUsers === 0 || email.includes("admin") ? "ADMIN" : "USER";

      user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash: dummyPasswordHash,
          role,
        },
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

    response.cookies.set("ordigit_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Google Auth Error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
