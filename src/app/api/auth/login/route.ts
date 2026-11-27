import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";
import { insforge } from "@/lib/insforge";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Attempt login with InsForge Auth
    const { data: insforgeData, error: insforgeError } = await insforge.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    // Check for email verification requirement
    if (insforgeError) {
      const errMsg = insforgeError.message || "";
      const errCode = (insforgeError as any).error || "";

      if (
        errCode === "EMAIL_NOT_VERIFIED" ||
        errMsg.toLowerCase().includes("verify") ||
        errMsg.toLowerCase().includes("verification")
      ) {
        // Automatically request code resend for user convenience
        await insforge.auth.resendVerificationEmail({ email: cleanEmail }).catch(() => {});
        return NextResponse.json(
          {
            error: "Your email has not been verified yet. We have sent a 6-digit code to your inbox.",
            requireEmailVerification: true,
            email: cleanEmail,
          },
          { status: 403 }
        );
      }

      // Strictly restricted to development mode: fallback for local seed accounts
      if (process.env.NODE_ENV === "development") {
        const localUser = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (localUser && localUser.passwordHash) {
          const isValid = await verifyPassword(password, localUser.passwordHash);
          if (isValid) {
            const token = signToken({
              userId: localUser.id,
              email: localUser.email,
              role: localUser.role,
              name: localUser.name,
            });

            const response = NextResponse.json({
              success: true,
              token,
              user: {
                id: localUser.id,
                email: localUser.email,
                name: localUser.name,
                role: localUser.role,
                emailVerified: localUser.emailVerified,
              },
            });

            response.cookies.set("ordigit_token", token, {
              httpOnly: true,
              secure: false,
              sameSite: "lax",
              maxAge: 60 * 60 * 24 * 30,
              path: "/",
            });

            return response;
          }
        }
      }

      return NextResponse.json(
        { error: errMsg || "Invalid email or password" },
        { status: 401 }
      );
    }

    // 2. InsForge Auth authenticated successfully!
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      const totalUsers = await prisma.user.count();
      const role = totalUsers === 0 || cleanEmail.includes("admin") ? "ADMIN" : "USER";
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: insforgeData?.user?.profile?.name || cleanEmail.split("@")[0],
          passwordHash: "",
          role,
          emailVerified: true,
        },
      });
    } else if (!user.emailVerified) {
      user = await prisma.user.update({
        where: { email: cleanEmail },
        data: { emailVerified: true },
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
      token,
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
    console.error("Login Error:", error);
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 });
  }
}
