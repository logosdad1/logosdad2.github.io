import puppeteer from "puppeteer-core";
import { prisma } from "../src/lib/prisma";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";

async function runComprehensiveQA() {
  console.log("==================================================================");
  console.log("  ORDIGIT — CUSTOMER-FACING REPORT INSPECTION (ALL 4 TIERS)       ");
  console.log("==================================================================\n");

  // Step 1: Base audit from database
  const sourceAudit = await prisma.audit.findUnique({
    where: { id: "cmuefdplo000ycn42z8ghk7x4" },
    include: { reportData: true, score: true },
  });

  if (!sourceAudit || !sourceAudit.reportData) {
    throw new Error("Source audit cmuefdplo000ycn42z8ghk7x4 not found");
  }

  console.log(`Source Audit: ${sourceAudit.id} (${sourceAudit.businessName})`);
  console.log(`Payload length: ${sourceAudit.reportData.fullJson.length} bytes\n`);

  // Helper to clone audit with a specific tier
  async function prepareTierAudit(tier: string, isPaid: boolean, price: number) {
    const existing = await prisma.audit.findFirst({
      where: { businessName: `QA-Audit-${tier}`, status: "COMPLETED" },
      include: { reportData: true },
    });
    if (existing) {
      if (!existing.reportData) {
        await prisma.auditReportData.create({
          data: { auditId: existing.id, fullJson: sourceAudit!.reportData!.fullJson },
        });
      }
      return existing.id;
    }

    const created = await prisma.audit.create({
      data: {
        businessName: `QA-Audit-${tier}`,
        url: sourceAudit!.url,
        industry: sourceAudit!.industry,
        location: sourceAudit!.location,
        tier,
        tierPrice: price,
        isPaid,
        paidAt: isPaid ? new Date() : null,
        status: "COMPLETED",
        overallScore: sourceAudit!.overallScore,
        userId: null, // Public anonymous for customer-facing inspection
      },
    });

    await prisma.auditReportData.create({
      data: {
        auditId: created.id,
        fullJson: sourceAudit!.reportData!.fullJson,
      },
    });

    return created.id;
  }

  const freeId = await prepareTierAudit("SNAPSHOT", false, 0);
  const essentialId = await prepareTierAudit("ESSENTIAL", true, 10);
  const growthId = await prepareTierAudit("GROWTH", true, 25);
  const authorityId = await prepareTierAudit("AUTHORITY", true, 50);

  console.log(`Test Audits ready:`);
  console.log(`  FREE:      ${freeId}`);
  console.log(`  ESSENTIAL: ${essentialId}`);
  console.log(`  GROWTH:    ${growthId}`);
  console.log(`  AUTHORITY: ${authorityId}\n`);

  // Launch Chrome
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleLogs: string[] = [];
  const networkErrors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleLogs.push(`[Console Error] ${msg.text()}`);
    }
  });

  page.on("response", (res) => {
    if (res.status() >= 400 && !res.url().includes("favicon")) {
      networkErrors.push(`[HTTP ${res.status()}] ${res.url()}`);
    }
  });

  const tierTests = [
    { tier: "FREE", id: freeId },
    { tier: "ESSENTIAL", id: essentialId },
    { tier: "GROWTH", id: growthId },
    { tier: "AUTHORITY", id: authorityId },
  ];

  const results: any[] = [];

  for (const t of tierTests) {
    console.log(`\n==================================================================`);
    console.log(`  INSPECTING TIER: ${t.tier} (Audit: ${t.id})`);
    console.log(`==================================================================`);

    consoleLogs.length = 0;
    networkErrors.length = 0;

    await page.goto(`${BASE_URL}/audit/${t.id}`, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 800));

    if (t.tier === "FREE") {
      const freeSnapshot = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
          hasScore: text.includes("/100") || text.includes("Score"),
          hasTeaserLocks: text.includes("Essential Intelligence") || text.includes("Growth Intelligence") || text.includes("Choose Your Intelligence Plan"),
          hasFindingsSummary: text.includes("Executive Summary") || text.includes("raincoat"),
          actionPlanExposed: text.includes("Priority Action Plan"),
          schemaExposed: text.includes("application/ld+json"),
        };
      });

      console.log(`  Free Teaser Verification:`, freeSnapshot);
      results.push({ tier: t.tier, freeSnapshot, consoleErrors: [...consoleLogs], networkErrors: [...networkErrors] });
      continue;
    }

    // For ESSENTIAL, GROWTH, AUTHORITY
    const tabsToTest = [
      { id: "executive", name: "Executive Summary" },
      { id: "action_plan", name: "Priority Action Plan" },
      { id: "ai_visibility", name: "AI Visibility" },
      { id: "website_clarity", name: "Business & Website Clarity" },
      { id: "search_local", name: "Search & Local" },
      { id: "content_authority", name: "Content & Authority" },
      { id: "trust", name: "Trust & Credibility" },
      { id: "conversion", name: "Conversion Readiness" },
      { id: "schema", name: "Schema Code" },
      { id: "competitors", name: "Competitive Context" },
      { id: "customer_intent", name: "Customer Intent" },
      { id: "thirty_day_plan", name: "30-Day Plan" },
      { id: "query_coverage", name: "Query Coverage" },
      { id: "strategic_roadmap", name: "Strategic Roadmap" },
    ];

    const tabDetails: any[] = [];

    for (const tab of tabsToTest) {
      // Click tab by finding button with text
      const clicked = await page.evaluate((label) => {
        const btns = Array.from(document.querySelectorAll("button"));
        const target = btns.find((b) => b.innerText.trim().toLowerCase().includes(label.toLowerCase()));
        if (target) {
          target.click();
          return true;
        }
        return false;
      }, tab.name);

      await new Promise((r) => setTimeout(r, 400));

      const inspection = await page.evaluate((currentTabId) => {
        const text = document.body.innerText;
        const h2 = document.querySelector("h2")?.innerText || "";
        const table = document.querySelector("table") !== null;
        const pre = document.querySelector("pre") !== null;
        const hasCopy = Array.from(document.querySelectorAll("button")).some((b) => b.innerText.includes("Copy Code"));
        const upgradeBanner = text.includes("What You Can Understand Now") || text.includes("What ordigit Discovered");
        const lockedText = text.includes("requires the") || text.includes("included with") || text.includes("exclusive to");

        let specificSummary = "";

        if (currentTabId === "schema") {
          const jsonLd = document.querySelector("pre")?.innerText || "";
          specificSummary = `JSON-LD code length: ${jsonLd.length} chars, Copy button: ${hasCopy}`;
        } else if (currentTabId === "competitors") {
          const rows = document.querySelectorAll("tbody tr").length;
          specificSummary = `Table rows: ${rows}, Upgrade banner: ${upgradeBanner}, Locked text: ${lockedText}`;
        } else if (currentTabId === "customer_intent") {
          const rows = document.querySelectorAll("tbody tr").length;
          const stages = ["Discover", "Evaluate", "Compare", "Trust", "Act"].filter((s) => text.includes(s));
          specificSummary = `Intent rows: ${rows}, Stages found: ${stages.join(", ")}, Upgrade banner: ${upgradeBanner}`;
        } else if (currentTabId === "thirty_day_plan") {
          const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"].filter((w) => text.includes(w));
          specificSummary = `Phased weeks found: ${weeks.join(", ")}, Upgrade banner: ${upgradeBanner}`;
        } else if (currentTabId === "query_coverage") {
          const queries = text.includes("Simulated") || text.includes("Dominant") || text.includes("At Risk");
          specificSummary = `Query cards visible: ${queries}, Upgrade banner: ${upgradeBanner}, Locked: ${lockedText}`;
        } else if (currentTabId === "strategic_roadmap") {
          const directives = text.includes("Executive Directive") || text.includes("Primary Strategic Advantage");
          specificSummary = `Directives visible: ${directives}, Milestones: ${text.includes("Quarterly Milestones")}`;
        } else if (currentTabId === "trust" || currentTabId === "conversion") {
          const findings = Array.from(document.querySelectorAll("h4")).map((h) => h.innerText);
          specificSummary = `Findings count: ${findings.length} (${findings.slice(0, 2).join("; ")})`;
        } else {
          specificSummary = `Header: "${h2}"`;
        }

        return {
          clicked: true,
          h2,
          specificSummary,
          hasErrors: text.includes("TypeError") || text.includes("Cannot read properties of undefined"),
        };
      }, tab.id);

      // If schema tab, test clicking the copy code button!
      if (tab.id === "schema") {
        const copyClicked = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll("button"));
          const btn = btns.find((b) => b.innerText.includes("Copy Code"));
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        });
        await new Promise((r) => setTimeout(r, 200));
        const copiedSuccess = await page.evaluate(() => {
          return Array.from(document.querySelectorAll("button")).some((b) => b.innerText.includes("Copied!"));
        });
        inspection.specificSummary += ` | Copy Button Click: ${copyClicked} -> UI State: ${copiedSuccess ? "Copied!" : "Default"}`;
      }

      console.log(`    [Tab: ${tab.name.padEnd(28)}] -> ${inspection.specificSummary}`);
      tabDetails.push({ tab: tab.name, ...inspection });
    }

    results.push({
      tier: t.tier,
      auditId: t.id,
      tabDetails,
      consoleErrors: [...consoleLogs],
      networkErrors: [...networkErrors],
    });
  }

  await browser.close();

  console.log(`\n==================================================================`);
  console.log(`  QA SUMMARY & HEALTH CHECK                                       `);
  console.log(`==================================================================\n`);

  for (const r of results) {
    console.log(`Tier: ${r.tier.padEnd(10)} | Console Errors: ${r.consoleErrors.length} | Network Errors: ${r.networkErrors.length}`);
    if (r.consoleErrors.length > 0) {
      console.log(`  Console errors:`, r.consoleErrors);
    }
    if (r.networkErrors.length > 0) {
      console.log(`  Network errors:`, r.networkErrors);
    }
  }

  console.log("\nQA execution complete.");
}

runComprehensiveQA().catch(console.error).finally(() => prisma.$disconnect());
