import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial data...");

  // 1. Create Default Admin User
  const passwordHash = await bcrypt.hash("AdminPassword2026!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@omnisight.ai" },
    update: {},
    create: {
      email: "admin@omnisight.ai",
      name: "Omnisight Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  // 2. Create System Configs
  await prisma.systemConfig.upsert({
    where: { key: "paidReportPrice" },
    update: {},
    create: { key: "paidReportPrice", value: "10" },
  });

  await prisma.systemConfig.upsert({
    where: { key: "scoreWeights" },
    update: {},
    create: {
      key: "scoreWeights",
      value: JSON.stringify({
        websiteClarity: 20,
        aiVisibility: 20,
        searchLocal: 15,
        contentAuthority: 15,
        trustCredibility: 15,
        conversionReadiness: 15,
      }),
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: "allowMockCheckout" },
    update: {},
    create: { key: "allowMockCheckout", value: "true" },
  });

  // 3. Create Sample Demo Business & Audit
  const demoBusiness = await prisma.business.create({
    data: {
      userId: admin.id,
      name: "Apex Roofing Specialists",
      websiteUrl: "https://apexroofing.example.com",
      industry: "Roofing",
      location: "Austin, TX",
    },
  });

  const demoAudit = await prisma.audit.create({
    data: {
      businessId: demoBusiness.id,
      userId: admin.id,
      url: "https://apexroofing.example.com",
      businessName: "Apex Roofing Specialists",
      industry: "Roofing",
      location: "Austin, TX",
      overallScore: 42,
      isPaid: false,
      status: "COMPLETED",
      score: {
        create: {
          websiteClarity: 61,
          aiVisibility: 29,
          searchLocal: 45,
          contentAuthority: 38,
          trustCredibility: 45,
          conversionReadiness: 51,
        },
      },
      reportData: {
        create: {
          fullJson: JSON.stringify({
            executiveSummary: {
              currentVisibility:
                "Your roofing website provides basic contact details, but lacks essential machine-readable schemas and hyper-local service pages required by AI models to recommend you.",
              topStrengths: [
                "Your core roofing services are clearly listed on the main page.",
                "Direct telephone number detected and easily clickable for callers.",
                "Valid SSL certificate active on domain.",
              ],
              topProblems: [
                "AI systems cannot determine your exact geographic coverage in Austin.",
                "No LocalBusiness structured data found in website code.",
                "No instant quote request or lead capture form above the fold.",
                "Lacks customer testimonials and review proof points.",
                "Thin content: Homepage contains under 350 words of descriptive text.",
              ],
              topOpportunities: [
                "Implement verified LocalBusiness schema to feed AI discovery models.",
                "Add a 3-field fast quote estimate form above the fold.",
                "Create dedicated neighborhood service pages for Austin metro.",
                "Embed genuine Google review stars and client quotes.",
                "Publish an FAQ section addressing common roofing insurance questions.",
              ],
              visibilityStatement:
                "Your digital presence has opportunities that may be limiting how clearly customers and AI systems understand your business.",
            },
            categories: {
              websiteClarity: {
                score: 61,
                weight: 20,
                status: "good",
                explanation: "Measures how instantly a visitor can understand your core offer.",
                strengths: ["Primary headline introduces commercial and residential roofing."],
                weaknesses: ["Lacks a prominent above-the-fold call to action button."],
                evidence: ["Found single H1 headline.", "Meta description is under 70 characters."],
                recommendations: ["Expand meta description to include primary service areas."],
              },
              aiVisibility: {
                score: 29,
                weight: 20,
                status: "critical",
                explanation: "Evaluates how clearly AI models can parse your services and location.",
                strengths: ["Domain name contains industry keyword."],
                weaknesses: ["AI cannot determine your service boundaries in Austin."],
                evidence: ["No JSON-LD schema detected."],
                recommendations: ["Add verified LocalBusiness JSON-LD markup."],
              },
              searchLocal: {
                score: 45,
                weight: 15,
                status: "warning",
                explanation: "Assesses local search signals, NAP consistency, and maps presence.",
                strengths: ["Phone number clearly visible."],
                weaknesses: ["No physical street address detected in footer."],
                evidence: ["Found 1 telephone number.", "No postal address schema found."],
                recommendations: ["Add complete physical dispatch address in footer."],
              },
              contentAuthority: {
                score: 38,
                weight: 15,
                status: "critical",
                explanation: "Measures depth of topical authority and service pages.",
                strengths: ["Mentions emergency roof repair."],
                weaknesses: ["Homepage word count is only 310 words."],
                evidence: ["Word count: 310 words."],
                recommendations: ["Expand content to at least 700 words with process steps."],
              },
              trustCredibility: {
                score: 45,
                weight: 15,
                status: "warning",
                explanation: "Audits social proof, customer reviews, and licensing.",
                strengths: ["Mentions 15 years of industry experience."],
                weaknesses: ["No third-party review widgets or testimonial quotes."],
                evidence: ["No review stars or client testimonials detected."],
                recommendations: ["Feature 3+ verified client testimonials with photos."],
              },
              conversionReadiness: {
                score: 51,
                weight: 15,
                status: "warning",
                explanation: "Analyzes friction in booking, calling, or requesting quotes.",
                strengths: ["Click-to-call tel link enabled."],
                weaknesses: ["No quote form on homepage."],
                evidence: ["No form tag detected."],
                recommendations: ["Add a 3-field quick estimate form above the fold."],
              },
            },
            aiReadinessDetails: {
              canUnderstandWhatYouDo: true,
              canUnderstandWhoYouServe: false,
              canUnderstandLocations: false,
              entityAmbiguityLevel: "HIGH",
              missingCrucialContext: [
                "Machine-readable JSON-LD entity definition",
                "Explicit geographic service bounds for Austin, TX",
                "Customer rating and review citations",
              ],
              observedEvidence: [
                "Crawled final URL: https://apexroofing.example.com",
                "SSL Encryption: Active",
                "Structured Schema: None detected",
                "Contact: Phone verified, address missing",
              ],
              readinessAssessment:
                "AI systems currently experience high ambiguity when interpreting your roofing business. Without structured data and explicit entity anchors, conversational search tools are likely to bypass your site for clearer competitors.",
            },
            actionPlan: [
              {
                id: "act-1",
                tier: "FIX_NOW",
                title: "Deploy LocalBusiness JSON-LD Schema",
                description:
                  "Insert the verified schema code snippet into your site header to immediately define your business name, phone, address, and roofing services to AI crawlers.",
                impact: "HIGH",
                effort: "EASY",
                category: "AI Visibility",
              },
              {
                id: "act-2",
                tier: "FIX_NOW",
                title: "Clarify Above-the-Fold Headline (H1)",
                description:
                  "Refine headline to: 'Premier Residential & Commercial Roofing in Austin, TX - Licensed & Insured'.",
                impact: "HIGH",
                effort: "EASY",
                category: "Website Clarity",
              },
              {
                id: "act-3",
                tier: "FIX_NOW",
                title: "Add 3-Field Quick Estimate Form",
                description: "Allow visitors to enter Name, Phone, and Roof Issue directly on the homepage.",
                impact: "HIGH",
                effort: "EASY",
                category: "Conversion",
              },
              {
                id: "act-4",
                tier: "FIX_NEXT",
                title: "Create Dedicated Pages for Key Roofing Services",
                description: "Separate Roof Replacement, Leak Repair, and Storm Damage into standalone pages.",
                impact: "HIGH",
                effort: "MEDIUM",
                category: "Content & Authority",
              },
              {
                id: "act-5",
                tier: "FIX_NEXT",
                title: "Embed Google Review Badges",
                description: "Display your 4.9-star rating and recent customer reviews prominently.",
                impact: "MEDIUM",
                effort: "EASY",
                category: "Trust & Credibility",
              },
              {
                id: "act-6",
                tier: "OPTIMIZE_LATER",
                title: "Build Suburb & Neighborhood Landing Pages",
                description: "Create targeted pages for Round Rock, Westlake, and Cedar Park.",
                impact: "MEDIUM",
                effort: "HARD",
                category: "Search & Local",
              },
            ],
            competitorComparison: [
              {
                area: "Structured AI Schema",
                yourStatus: "Missing",
                competitorBenchmark: "Top 20% competitors feature complete Organization & Service schemas",
                impact: "Crucial for AI discovery",
              },
              {
                area: "Website Clarity & Hero CTA",
                yourStatus: "Vague H1",
                competitorBenchmark: "Direct problem-solution statement with primary CTA in header",
                impact: "Reduces bounce rates by ~28%",
              },
              {
                area: "Topical Content Depth",
                yourStatus: "310 words",
                competitorBenchmark: "800 - 1,200 words per service category with proof points",
                impact: "Builds topical domain authority",
              },
              {
                area: "Verified Trust Signals",
                yourStatus: "Lacks visible testimonials",
                competitorBenchmark: "Google Review embed, client logos, and license badges visible above fold",
                impact: "Direct conversion driver",
              },
              {
                area: "Mobile & Fast Contact",
                yourStatus: "Phone only",
                competitorBenchmark: "1-tap click-to-call, WhatsApp deep-link, and simple 3-field form",
                impact: "Increases mobile lead volume by up to 40%",
              },
            ],
            generatedSchema: {
              type: "LocalBusiness",
              codeSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "RoofingContractor",
  "name": "Apex Roofing Specialists",
  "url": "https://apexroofing.example.com",
  "telephone": "+1-512-555-0199",
  "email": "contact@apexroofing.example.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "1200 S Congress Ave",
    "addressLocality": "Austin",
    "addressRegion": "TX",
    "postalCode": "78704",
    "addressCountry": "US"
  },
  "areaServed": "Austin Metropolitan Area",
  "priceRange": "$$"
}
</script>`,
              instructions:
                "Copy and paste this script directly into the `<head>` section of your website. It tells AI and search engines your exact business classification and location.",
            },
            lockedTeasers: {
              additionalIssuesCount: 8,
              biggestAiGap: "AI search engines cannot verify your service boundaries in Austin, TX",
              competitorGapCount: 5,
            },
          }),
        },
      },
    },
  });

  console.log("Seeding complete! Admin user and demo audit created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
