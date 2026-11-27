import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Request fresh verification code from InsForge Auth
    const { data, error } = await insforge.auth.resendVerificationEmail({
      email: cleanEmail,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to resend verification code. Please wait a moment and try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "A fresh 6-digit verification code has been dispatched to your email address.",
    });
  } catch (error: any) {
    console.error("Resend Code Error:", error);
    return NextResponse.json({ error: error.message || "Failed to resend code" }, { status: 500 });
  }
}
