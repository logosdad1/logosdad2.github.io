import { AgentContext, AgentCategoryScore } from "./types";
import { AuditReportDataPayload } from "../types";
import { evaluateDeterministicRules } from "../rule-engine";

export async function runIntelligenceSynthesisAgent(
  context: AgentContext,
  categories: {
    websiteClarity: AgentCategoryScore;
    aiVisibility: AgentCategoryScore;
    searchLocal: AgentCategoryScore;
    contentAuthority: AgentCategoryScore;
    trustCredibility: AgentCategoryScore;
    conversionReadiness: AgentCategoryScore;
  }
): Promise<AuditReportDataPayload> {
  const { input, crawl, hasWebsite } = context;

  // We reuse the existing deterministic rules to populate the remaining payload sections (for now)
  // such as queryCoverageAnalysis, strategicRoadmap, etc.
  const baseline = evaluateDeterministicRules(input, crawl);

  let executiveSummary = {
    currentVisibility: hasWebsite 
      ? `Your digital footprint currently has noticeable gaps that limit how clearly prospective customers and AI retrieval engines understand your business offerings.`
      : `You currently lack a foundational digital presence (like a website), making it extremely difficult for customers and AI systems to discover and trust your business.`,
    topStrengths: categories.websiteClarity.strengths
      .concat(categories.aiVisibility.strengths)
      .slice(0, 3),
    topProblems: categories.aiVisibility.weaknesses
      .concat(categories.websiteClarity.weaknesses)
      .concat(categories.conversionReadiness.weaknesses)
      .slice(0, 5),
    topOpportunities: categories.aiVisibility.recommendations
      .concat(categories.contentAuthority.recommendations)
      .concat(categories.trustCredibility.recommendations)
      .slice(0, 5),
    visibilityStatement: hasWebsite
      ? `Your digital presence has opportunities that may be limiting how clearly customers and AI systems understand your business.`
      : `Your business lacks a primary digital hub. Building a website is your most urgent priority.`,
  };

  if (!hasWebsite) {
    executiveSummary.topStrengths = [
      `Active business identified in ${input.location}`,
      `Industry verified: ${input.industry}`
    ];
  } else if (categories.websiteClarity.strengths.length === 0) {
    executiveSummary.topStrengths = [
      `Accessible website responding with HTTP ${crawl.statusCode}`,
      crawl.isSsl ? "Secure SSL encryption active" : "Domain address verified",
      `Active digital presence in ${input.location}`,
    ];
  }

  // We map the new AgentCategoryScore back to the expected CategoryScore type by stripping findings
  // or passing them through if the UI ever supports them (currently UI expects CategoryScore)
  const mappedCategories = {
    websiteClarity: categories.websiteClarity,
    aiVisibility: categories.aiVisibility,
    searchLocal: categories.searchLocal,
    contentAuthority: categories.contentAuthority,
    trustCredibility: categories.trustCredibility,
    conversionReadiness: categories.conversionReadiness,
  };

  const reportPayload: AuditReportDataPayload = {
    executiveSummary,
    categories: mappedCategories,
    aiReadinessDetails: baseline.aiReadinessDetails,
    actionPlan: baseline.actionPlan,
    competitorComparison: baseline.competitorComparison,
    customerIntentAnalysis: baseline.customerIntentAnalysis,
    thirtyDayPlan: baseline.thirtyDayPlan,
    queryCoverageAnalysis: baseline.queryCoverageAnalysis,
    strategicRoadmap: baseline.strategicRoadmap,
    generatedSchema: baseline.generatedSchema,
    lockedTeasers: {
      additionalIssuesCount: 8,
      biggestAiGap: `AI search engines cannot verify your service boundaries in ${input.location}`,
      competitorGapCount: 5,
    },
  };

  // PHASE 3G: Customer Intent Engine
  // Calculate coverage dynamically based on collected Evidence
  let discoveryScore = 0;
  let evaluationScore = 0;
  let comparisonScore = 0;
  let transactionScore = 0;
  let trustScore = 0;

  const { evidence } = context;
  
  if (evidence) {
    if (evidence.some(e => e.sourceType === "SEARCH" && e.confidence === "OBSERVED")) discoveryScore += 40;
    if (evidence.some(e => e.sourceType === "LOCAL" && e.evidenceType === "NAME_CONSISTENCY")) discoveryScore += 40;
    
    if (context.hasWebsite && context.crawl.headings.h1.length > 0) evaluationScore += 50;
    if (context.crawl.wordCount > 300) evaluationScore += 30;

    if (context.crawl.wordCount > 600) comparisonScore += 40; // Proxy for depth

    if (context.crawl.contactInfo.hasContactForm) transactionScore += 50;
    if (context.crawl.contactInfo.phones.length > 0) transactionScore += 30;

    if (context.crawl.trustSignals.hasTestimonials) trustScore += 50;
    if (evidence.some(e => e.sourceType === "SOCIAL")) trustScore += 20;
  }

  // Cap at 100
  discoveryScore = Math.min(100, Math.max(15, discoveryScore));
  evaluationScore = Math.min(100, Math.max(15, evaluationScore));
  comparisonScore = Math.min(100, Math.max(10, comparisonScore));
  transactionScore = Math.min(100, Math.max(10, transactionScore));
  trustScore = Math.min(100, Math.max(10, trustScore));

  reportPayload.customerIntentAnalysis = {
    overview: `Your digital ecosystem currently supports bottom-of-funnel transactions but lacks early-stage discovery and comparison coverage.`,
    stages: [
      {
        stage: "Discovery Intent",
        score: discoveryScore,
        description: "Customers searching for who offers your services.",
        gap: "Limited visibility in generic non-branded searches.",
        action: "Create dedicated service-area pages."
      },
      {
        stage: "Evaluation Intent",
        score: evaluationScore,
        description: "Customers verifying what you do.",
        gap: context.hasWebsite ? "Content lacks deep service specifications." : "No central hub to explain services.",
        action: "Expand service descriptions with specific outcomes."
      },
      {
        stage: "Comparison Intent",
        score: comparisonScore,
        description: "Customers deciding between you and competitors.",
        gap: "Missing pricing explanations or competitive differentiators.",
        action: "Add 'Why Choose Us' and 'Process' sections."
      },
      {
        stage: "Transaction Intent",
        score: transactionScore,
        description: "Customers ready to request a quote or buy.",
        gap: transactionScore < 60 ? "Contact options are hidden or involve friction." : "None major detected.",
        action: transactionScore < 60 ? "Add sticky prominent contact forms." : "Optimize form conversion rate."
      },
      {
        stage: "Trust Intent",
        score: trustScore,
        description: "Customers looking for social proof before committing.",
        gap: trustScore < 50 ? "Insufficient first-party reviews visible." : "None major detected.",
        action: trustScore < 50 ? "Embed verified client testimonials on the homepage." : "Gather video testimonials."
      }
    ]
  };

  // PHASE 3L: Service Opportunity Engine
  // Map high priority findings to actionable services
  const serviceOpportunities: any[] = [];
  
  // Rule 1: No website -> Digital Foundation & Website Design
  if (!context.hasWebsite) {
    serviceOpportunities.push({
      service: "DIGITAL_FOUNDATION",
      reason: "No official website identified.",
      priority: "HIGH",
      confidence: "HIGH"
    });
    serviceOpportunities.push({
      service: "WEBSITE_DESIGN",
      reason: "Business needs a conversion-focused website to establish a digital footprint.",
      priority: "HIGH",
      confidence: "HIGH"
    });
  } else {
    // Rule 2: Low conversion readiness -> Website Redesign or Conversion Optimization
    if (categories.conversionReadiness.score < 50) {
      serviceOpportunities.push({
        service: "CONVERSION_OPTIMIZATION",
        reason: "The current website has high conversion friction, preventing prospects from contacting you easily.",
        priority: "HIGH",
        confidence: "HIGH"
      });
    }

    // Rule 3: Low content depth -> Content Strategy
    if (categories.contentAuthority.score < 60) {
      serviceOpportunities.push({
        service: "CONTENT_STRATEGY",
        reason: "Search engines and AI models require deeper content to confidently recommend you as an expert.",
        priority: "MEDIUM",
        confidence: "HIGH"
      });
    }

    // Rule 4: No schema -> AI Visibility
    if (categories.aiVisibility.findings.some(f => f.title === "MISSING AI ENTITY STRUCTURE")) {
      serviceOpportunities.push({
        service: "AI_VISIBILITY",
        reason: "Missing structured data prevents generative AI from confidently recommending the business.",
        priority: "HIGH",
        confidence: "HIGH"
      });
    }
  }

  // Rule 5: Missing or inconsistent Local profile -> Local Visibility
  if (categories.searchLocal.findings.some(f => f.title.includes("NAP INCONSISTENCY") || f.title.includes("MISSING LOCAL"))) {
    serviceOpportunities.push({
      service: "LOCAL_VISIBILITY",
      reason: "Inconsistent or missing local directory profiles are hurting 'near me' search traffic.",
      priority: "HIGH",
      confidence: "HIGH"
    });
  }

  // Append to payload
  (reportPayload as any).serviceOpportunities = serviceOpportunities;

  return reportPayload;
}
