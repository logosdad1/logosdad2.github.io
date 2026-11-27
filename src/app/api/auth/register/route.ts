import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { insforge } from "@/lib/insforge";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Sign up user via InsForge Auth
    const { data: insforgeData, error: insforgeError } = await insforge.auth.signUp({
      email: cleanEmail,
      password,
      name,
    });

    if (insforgeError) {
      // Check if user already exists
      const msg = insforgeError.message || "";
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("exist")) {
        return NextResponse.json({ error: "Email is already registered. Please sign in." }, { status: 400 });
      }
      return NextResponse.json({ error: msg || "Registration failed via InsForge Auth" }, { status: 400 });
    }

    // 2. Synchronize / prepare User record in InsForge database
    const totalUsers = await prisma.user.count();
    const role = totalUsers === 0 || cleanEmail.includes("admin") ? "ADMIN" : "USER";
    const passwordHash = await hashPassword(password);

    await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        name,
        role,
        passwordHash,
      },
      create: {
        email: cleanEmail,
        name,
        passwordHash,
        role,
        emailVerified: false,
      },
    });

    return NextResponse.json({
      success: true,
      requireEmailVerification: true,
      email: cleanEmail,
      message: "Registration successful! A 6-digit verification code has been sent to your email address.",
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: error.message || "Internal registration error" }, { status: 500 });
  }
}
