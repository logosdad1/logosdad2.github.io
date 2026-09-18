export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Allow up to 5 minutes on Vercel Pro/Enterprise

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { crawlWebsite } from "@/lib/crawler";
import { runMultiAgentAudit } from "@/lib/ai-engine";
import { calculateOverallScore } from "@/lib/scoring";
import { getSystemSettings } from "@/lib/config";

// This simulates a background worker queue processor (like BullMQ or Inngest)
// Since Next.js API routes usually timeout on Vercel after 10-60s depending on the plan,
// in a true production environment this would be offloaded to a dedicated worker.
export async function POST(req: NextRequest) {
  let auditId: string | undefined;

  try {
    const body = await req.json();
    auditId = body.auditId;

    if (!auditId) {
      return NextResponse.json({ error: "Missing auditId" }, { status: 400 });
    }

    // Check if Audit exists and is queued
    const audit = await prisma.audit.findUnique({ where: { id: auditId } });
    if (!audit || audit.status !== "QUEUED") {
      return NextResponse.json({ error: "Audit not in QUEUED state" }, { status: 400 });
    }

    // STATUS: DISCOVERING
    console.info(`[PIPELINE START] Audit ID: ${auditId} | Target: ${audit.url || audit.businessName}`);
    await prisma.audit.update({
      where: { id: auditId },
      data: { status: "DISCOVERING" }
    });

    // 1. Crawl website (if URL exists)
    console.info(`[DISCOVERY PHASE] Crawling: ${audit.url || 'No URL provided'}`);
    const crawl = await crawlWebsite(audit.url || "");

    // STATUS: ANALYZING
    console.info(`[AGENT PHASE] Running intelligence agents...`);
    await prisma.audit.update({
      where: { id: auditId },
      data: { status: "ANALYZING" }
    });

    // 2. Run multi-agent evaluators & heuristics (Phase 3 Discovery + Agents)
    const reportData = await runMultiAgentAudit(
      {
        name: audit.businessName,
        url: audit.url,
        industry: audit.industry || "Other",
        location: audit.location,
      },
      crawl
    );

    // STATUS: SCORING
    console.info(`[SCORING PHASE] Calculating final visibility score...`);
    await prisma.audit.update({
      where: { id: auditId },
      data: { status: "SCORING" }
    });

    // 3. Load dynamic score weights from config
    const settings = await getSystemSettings();
    const overallScore = calculateOverallScore(reportData.categories, settings.scoreWeights);

    // STATUS: COMPLETED
    // 4. Store audit, score, and structured report JSON
    await prisma.audit.update({
      where: { id: auditId },
      data: {
        url: crawl.finalUrl || audit.url, // Update with resolved URL if available
        overallScore,
        status: "COMPLETED",
        score: {
          create: {
            websiteClarity: reportData.categories.websiteClarity.score,
            aiVisibility: reportData.categories.aiVisibility.score,
            searchLocal: reportData.categories.searchLocal.score,
            contentAuthority: reportData.categories.contentAuthority.score,
            trustCredibility: reportData.categories.trustCredibility.score,
            conversionReadiness: reportData.categories.conversionReadiness.score,
          },
        },
        reportData: {
          create: {
            fullJson: JSON.stringify(reportData),
          },
        },
      },
    });

    console.info(`[PIPELINE SUCCESS] Audit ID: ${auditId} completed with score: ${overallScore}`);
    return NextResponse.json({ success: true, status: "COMPLETED" });
  } catch (error: any) {
    console.error(`[PIPELINE FAILED] Audit ID: ${auditId || 'Unknown'} - Error:`, error.message);
    console.error(error.stack);
    
    if (auditId) {
      await prisma.audit.update({
        where: { id: auditId },
        data: { 
          status: "FAILED",
          errorMessage: error.message || "Unknown error during intelligence processing."
        }
      });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
