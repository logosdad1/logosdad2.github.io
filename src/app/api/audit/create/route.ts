import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, websiteUrl, industry, location } = body;

    if (!businessName || !location) {
      return NextResponse.json(
        { error: "Business name and location are required." },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    let businessId: string | undefined;
    let validUserId: string | undefined;

    if (user?.userId) {
      // Verify user exists to prevent foreign key constraint violations
      const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
      
      if (dbUser) {
        validUserId = dbUser.id;
        const business = await prisma.business.create({
          data: {
            userId: validUserId,
            name: businessName,
            websiteUrl: websiteUrl || "",
            industry: industry || "Other",
            location,
          },
        });
        businessId = business.id;
      }
    }

    // 2. Create Audit shell in QUEUED state immediately (Asynchronous Architecture)
    const audit = await prisma.audit.create({
      data: {
        businessId,
        userId: validUserId,
        url: websiteUrl || "",
        businessName,
        industry: industry || "Other",
        location,
        overallScore: 0,
        status: "QUEUED",
      },
    });

    // 3. Client will kick off the background processing to avoid Vercel serverless freezing
    return NextResponse.json({
      success: true,
      auditId: audit.id,
      status: "QUEUED"
    });
  } catch (error: any) {
    console.error("Audit creation failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate scan." },
      { status: 500 }
    );
  }
}
