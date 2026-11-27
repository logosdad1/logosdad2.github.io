import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { insforge } from "@/lib/insforge";

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Email, 6-digit code, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();

    // 1. Exchange 6-digit code for reset token in InsForge
    const { data: exchangeData, error: exchangeError } = await insforge.auth.exchangeResetPasswordToken({
      email: cleanEmail,
      code: cleanCode,
    });

    if (exchangeError || !exchangeData?.token) {
      return NextResponse.json(
        { error: exchangeError?.message || "Invalid or expired reset code. Please request a new code." },
        { status: 400 }
      );
    }

    // 2. Perform password reset in InsForge
    const { error: resetError } = await insforge.auth.resetPassword({
      newPassword,
      otp: exchangeData.token,
    });

    if (resetError) {
      return NextResponse.json(
        { error: resetError.message || "Failed to update password with InsForge" },
        { status: 400 }
      );
    }

    // 3. Update passwordHash in Prisma
    const newHash = await hashPassword(newPassword);
    await prisma.user.updateMany({
      where: { email: cleanEmail },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now sign in with your new password.",
    });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: error.message || "Failed to reset password" }, { status: 500 });
  }
}
