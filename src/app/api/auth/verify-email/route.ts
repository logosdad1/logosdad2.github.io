import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { insforge } from "@/lib/insforge";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and 6-digit verification code are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();

    // 1. Verify code via InsForge Auth
    const { data: insforgeData, error: insforgeError } = await insforge.auth.verifyEmail({
      email: cleanEmail,
      otp: cleanCode,
    });

    if (insforgeError) {
      return NextResponse.json(
        { error: insforgeError.message || "Invalid or expired verification code. Please check and try again." },
        { status: 400 }
      );
    }

    // 2. Mark verified in InsForge PostgreSQL database
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (user) {
      user = await prisma.user.update({
        where: { email: cleanEmail },
        data: { emailVerified: true },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: insforgeData?.user?.profile?.name || cleanEmail.split("@")[0],
          passwordHash: "",
          role: cleanEmail.includes("admin") ? "ADMIN" : "USER",
          emailVerified: true,
        },
      });
    }

    // 3. Issue session token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: true,
      },
    });

    response.cookies.set("ordigit_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    if (insforgeData?.accessToken) {
      response.cookies.set("insforge_token", insforgeData.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    return response;
  } catch (error: any) {
    console.error("Verify Email Error:", error);
    return NextResponse.json({ error: error.message || "Email verification failed" }, { status: 500 });
  }
}
