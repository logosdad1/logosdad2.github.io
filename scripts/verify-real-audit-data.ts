import { prisma } from "../src/lib/prisma";

async function verifyAudits() {
  const audits = await prisma.audit.findMany({
    where: { isPaid: true, status: "COMPLETED" },
    include: {
      reportData: true,
      score: true,
    },
    take: 10,
  });

  console.log(`Found ${audits.length} completed paid audits in database:`);
  for (const a of audits) {
    const hasData = !!a.reportData?.fullJson;
    const len = a.reportData?.fullJson.length || 0;
    let parsed: any = null;
    if (hasData) {
      try {
        parsed = JSON.parse(a.reportData!.fullJson);
      } catch (e: any) {
        parsed = `JSON parse error: ${e.message}`;
      }
    }
    console.log(`\nAudit: ${a.id} | Tier: ${a.tier} | User: ${a.userId || "anonymous"} | Biz: ${a.businessName}`);
    console.log(`  ReportData present: ${hasData} (Length: ${len})`);
    if (parsed && typeof parsed === "object") {
      console.log(`  Sections in JSON:`, Object.keys(parsed));
      console.log(`  competitorComparison count:`, parsed.competitorComparison?.length);
      console.log(`  customerIntentAnalysis count:`, parsed.customerIntentAnalysis?.length);
      console.log(`  thirtyDayPlan count:`, parsed.thirtyDayPlan?.length);
      console.log(`  queryCoverageAnalysis count:`, parsed.queryCoverageAnalysis?.length);
      console.log(`  strategicRoadmap present:`, !!parsed.strategicRoadmap);
      console.log(`  generatedSchema present:`, !!parsed.generatedSchema?.codeSnippet);
    }
  }
}

verifyAudits().catch(console.error).finally(() => prisma.$disconnect());
