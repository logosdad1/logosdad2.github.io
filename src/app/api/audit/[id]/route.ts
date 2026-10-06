export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSystemSettings } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { filterReportDataByTier } from "@/lib/entitlements";
import { AuditReportDataPayload } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const audit = await prisma.audit.findUnique({
      where: { id: params.id },
      include: {
        score: true,
        reportData: true,
      },
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    const user = await getCurrentUser();

    // 1. Ownership Check
    // If the audit is claimed by a user, only that user (or an Admin) can view it.
    if (audit.userId && (!user || (user.userId !== audit.userId && user.role !== "ADMIN"))) {
      return NextResponse.json({ error: "Unauthorized access to this report" }, { status: 403 });
    }

    const settings = await getSystemSettings();
    let rawReportData: AuditReportDataPayload | null = audit.reportData ? JSON.parse(audit.reportData.fullJson) : null;

    // 2. Entitlement Check
    // Enforce centralized tier capability filter so unauthorized users never receive paid intelligence in JSON
    const effectiveTier = (audit.tier as any) || (audit.isPaid ? "ESSENTIAL" : "SNAPSHOT");
    const sanitizedReportData = filterReportDataByTier(rawReportData, effectiveTier, audit.isPaid);

    return NextResponse.json({
      audit: {
        id: audit.id,
        businessName: audit.businessName,
        url: audit.url,
        industry: audit.industry,
        location: audit.location,
        overallScore: audit.overallScore,
        tier: audit.tier || (audit.isPaid ? "ESSENTIAL" : "SNAPSHOT"),
        tierPrice: audit.tierPrice || (audit.isPaid ? 10 : 0),
        isPaid: audit.isPaid,
        status: audit.status,
        createdAt: audit.createdAt,
      },
      score: audit.score,
      reportData: sanitizedReportData,
      price: settings.paidReportPrice,
      tierPrices: settings.tierPrices,
    });
  } catch (error: any) {
    console.error("Audit API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
