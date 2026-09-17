import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businesses = await prisma.business.findMany({
      where: { userId: user.userId },
      include: {
        audits: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formatted = businesses.map((b) => {
      const latestAudit = b.audits[0];
      const previousAudit = b.audits[1];
      const scoreChange =
        latestAudit && previousAudit
          ? latestAudit.overallScore - previousAudit.overallScore
          : 0;

      return {
        id: b.id,
        name: b.name,
        websiteUrl: b.websiteUrl,
        industry: b.industry,
        location: b.location,
        lastAuditDate: latestAudit ? latestAudit.createdAt : null,
        latestScore: latestAudit ? latestAudit.overallScore : null,
        scoreChange,
        latestAuditId: latestAudit ? latestAudit.id : null,
        isPaid: latestAudit ? latestAudit.isPaid : false,
      };
    });

    return NextResponse.json({ businesses: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
