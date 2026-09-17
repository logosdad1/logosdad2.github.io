export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSystemSettings } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";

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
    let rawReportData = audit.reportData ? JSON.parse(audit.reportData.fullJson) : null;

    // 2. Entitlement Check
    // Do not expose the complete paid report in HTML/JavaScript before authorization.
    if (rawReportData && !audit.isPaid) {
      // Strip everything except the executive summary and categories for the Teaser
      rawReportData = {
        executiveSummary: rawReportData.executiveSummary,
        categories: rawReportData.categories,
        lockedTeasers: rawReportData.lockedTeasers,
      };
    } else if (rawReportData && audit.isPaid) {
      // Depending on the tier, we might want to strip higher tier features.
      // E.g., ESSENTIAL doesn't get thirtyDayPlan, competitorComparison.
      // GROWTH doesn't get queryCoverageAnalysis, strategicRoadmap.
      if (audit.tier === "ESSENTIAL") {
        delete rawReportData.thirtyDayPlan;
        delete rawReportData.competitorComparison;
        delete rawReportData.customerIntentAnalysis;
        delete rawReportData.queryCoverageAnalysis;
        delete rawReportData.strategicRoadmap;
      } else if (audit.tier === "GROWTH") {
        delete rawReportData.queryCoverageAnalysis;
        delete rawReportData.strategicRoadmap;
      }
    }

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
      reportData: rawReportData,
      price: settings.paidReportPrice,
      tierPrices: settings.tierPrices,
    });
  } catch (error: any) {
    console.error("Audit API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
