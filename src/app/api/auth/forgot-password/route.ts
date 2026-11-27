import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Trigger password reset code via InsForge
    const { data, error } = await insforge.auth.sendResetPasswordEmail({
      email: cleanEmail,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to send reset code. Please try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "If this email is registered, a 6-digit password reset code has been sent.",
    });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: error.message || "Password recovery failed" }, { status: 500 });
  }
}
