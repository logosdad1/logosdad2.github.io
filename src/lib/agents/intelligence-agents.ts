import { AgentContext, AgentCategoryScore } from "./types";

export async function runWebsiteAnalysisAgent(context: AgentContext): Promise<AgentCategoryScore> {
  const { crawl, hasWebsite } = context;
  
  if (!hasWebsite) {
    return {
      score: 0,
      weight: 20,
      status: "critical",
      explanation: "No website was provided. A dedicated website is the foundation of digital clarity.",
      strengths: [],
      weaknesses: ["Missing a dedicated business website."],
      evidence: ["No URL provided during scan."],
      recommendations: ["Build a conversion-focused business website to serve as your digital foundation."],
      findings: [{
        title: "DIGITAL FOUNDATION GAP",
        whatWeFound: "We found no dedicated website for your business.",
        whyItMatters: "A website is the central hub for your digital presence. Without it, customers and AI systems struggle to verify your identity and services.",
        businessImpact: "Significant loss of organic discovery and lower trust compared to competitors.",
        recommendedAction: "Build a professional website clearly explaining your services and service areas.",
        priority: "HIGH",
        source: "Input Analysis",
        confidence: "VERIFIED"
      }]
    };
  }

  let score = 40;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const evidence: string[] = [];
  const recommendations: string[] = [];
  const findings: AgentCategoryScore["findings"] = [];

  if (crawl.title && crawl.title.length >= 15) {
    score += 15;
    strengths.push("Clear, identifiable page title.");
    evidence.push(`Found page title: "${crawl.title}"`);
  } else {
    weaknesses.push("Missing or overly generic website title tag.");
    recommendations.push("Update your homepage title.");
  }

  if (crawl.headings.h1.length === 1) {
    score += 15;
    strengths.push("Well-structured main headline (H1).");
  } else if (crawl.headings.h1.length === 0) {
    weaknesses.push("Missing primary H1 headline.");
    recommendations.push("Add a prominent headline stating exactly what problem you solve.");
    findings.push({
      title: "MISSING CORE VALUE PROPOSITION",
      whatWeFound: "Your homepage lacks a primary H1 headline.",
      whyItMatters: "The H1 tag is the most important signal for visitors and search engines to understand what your page is about.",
      businessImpact: "Higher bounce rates as visitors struggle to immediately understand your offering.",
      recommendedAction: "Add a clear, single H1 headline.",
      priority: "HIGH",
      source: "Website Analysis",
      confidence: "VERIFIED"
    });
  }

  if (crawl.metaDescription && crawl.metaDescription.length >= 50) {
    score += 15;
    strengths.push("Descriptive summary found in meta description.");
  } else {
    weaknesses.push("Lacks a clear meta summary.");
    recommendations.push("Write a 150-character meta description.");
  }

  if (crawl.navigationItems.length >= 3) {
    score += 15;
    strengths.push(`Intuitive navigation menu.`);
  } else {
    weaknesses.push("Navigation is minimal or hard to discover.");
  }

  score = Math.min(100, Math.max(25, score));
  const status = score >= 80 ? "excellent" : score >= 65 ? "good" : score >= 45 ? "warning" : "critical";

  return {
    score, weight: 20, status,
    explanation: "Measures how instantly a human visitor and search bot can determine your primary offer and purpose.",
    strengths, weaknesses, evidence, recommendations, findings
  };
}

export async function runAIVisibilityAgent(context: AgentContext): Promise<AgentCategoryScore> {
  const { input, crawl, hasWebsite } = context;
  const industry = input.industry.toLowerCase();
  const location = input.location.toLowerCase();
  const lowerText = crawl.cleanTextSample.toLowerCase();
  
  if (!hasWebsite) {
    return {
      score: 0, weight: 20, status: "insufficient",
      explanation: "Evaluates how clearly AI recommendation models and generative search engines can interpret your entity.",
      strengths: [],
      weaknesses: ["No website available to feed AI models structured data."],
      evidence: [], recommendations: ["Launch a website with proper Organization and LocalBusiness schema."],
      findings: []
    };
  }

  let score = 30;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const evidence: string[] = [];
  const recommendations: string[] = [];
  const findings: AgentCategoryScore["findings"] = [];

  const mentionsIndustry = lowerText.includes(industry) || crawl.title.toLowerCase().includes(industry);
  const mentionsLocation = lowerText.includes(location) || crawl.title.toLowerCase().includes(location);

  if (crawl.hasSchema) {
    score += 25;
    strengths.push(`Structured data detected: ${crawl.schemaTypes.join(", ")}`);
  } else {
    weaknesses.push("No JSON-LD structured data or schema.org markup found.");
    recommendations.push("Implement a verified LocalBusiness/Organization schema.");
    findings.push({
      title: "MISSING AI ENTITY STRUCTURE",
      whatWeFound: "Your website lacks JSON-LD schema markup.",
      whyItMatters: "AI models (like ChatGPT and Gemini) rely heavily on schema markup to categorize businesses with high confidence.",
      businessImpact: "Lower chance of being recommended by AI when users ask for services in your area.",
      recommendedAction: "Add LocalBusiness schema outlining your exact services and locations.",
      priority: "HIGH",
      source: "AI Visibility Analysis",
      confidence: "VERIFIED"
    });
  }

  if (mentionsIndustry) score += 20;
  if (mentionsLocation) score += 15;

  score = Math.min(100, Math.max(20, score));
  const status = score >= 80 ? "excellent" : score >= 65 ? "good" : score >= 45 ? "warning" : "critical";

  return {
    score, weight: 20, status,
    explanation: "Evaluates how clearly AI recommendation models and generative search engines can interpret your entity and services.",
    strengths, weaknesses, evidence, recommendations, findings
  };
}

export async function runLocalPresenceAgent(context: AgentContext): Promise<AgentCategoryScore> {
  const { crawl, hasWebsite, evidence } = context;
  
  let score = 35;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const agentEvidence: string[] = [];
  const recommendations: string[] = [];
  const findings: AgentCategoryScore["findings"] = [];

  const localEvidence = evidence?.filter(e => e.sourceType === "LOCAL") || [];

  if (!hasWebsite && localEvidence.length === 0) {
    return {
      score: 0, weight: 15, status: "insufficient",
      explanation: "Assesses your local search footprint, NAP consistency, and geographic signals.",
      strengths: [], weaknesses: ["Missing owned digital properties for local SEO."],
      evidence: [], recommendations: [], findings: []
    };
  }

  // Phase 3: Evaluate Local Discovery Signals
  if (localEvidence.length > 0) {
    score += 25;
    strengths.push("Discovered public local business profile.");
    agentEvidence.push(`Found local profile: ${localEvidence[0].sourceName}`);
    
    if (localEvidence.some(e => e.evidenceType === "NAME_CONSISTENCY" && e.confidence === "VERIFIED")) {
      score += 15;
      strengths.push("Business name is consistent across local directories.");
    } else if (localEvidence.some(e => e.evidenceType === "NAME_CONSISTENCY" && e.confidence === "OBSERVED")) {
      weaknesses.push("Business name appears inconsistent in local search.");
      findings.push({
        title: "NAP INCONSISTENCY DETECTED",
        whatWeFound: "Your business name differs between your website and local directories.",
        whyItMatters: "Search engines and AI use Name, Address, and Phone (NAP) consistency as a primary trust signal.",
        businessImpact: "Lower local search rankings and confused AI recommendations.",
        recommendedAction: "Standardize your business name across all platforms.",
        priority: "HIGH",
        source: "Local Presence Analysis",
        confidence: "INFERRED"
      });
    }
  } else {
    weaknesses.push("Could not discover an authoritative local business profile.");
    findings.push({
      title: "MISSING LOCAL BUSINESS PROFILE",
      whatWeFound: "We could not verify an active Google Business Profile or equivalent local directory listing.",
      whyItMatters: "Local profiles are the #1 driver of 'near me' search traffic.",
      businessImpact: "Significant loss of local foot traffic and service inquiries.",
      recommendedAction: "Claim and optimize your Google Business Profile.",
      priority: "HIGH",
      source: "Local Presence Analysis",
      confidence: "OBSERVED"
    });
  }

  if (hasWebsite) {
    if (crawl.isSsl) score += 5;
    if (crawl.contactInfo.phones.length > 0) score += 5;
    if (crawl.contactInfo.hasPhysicalAddress) score += 10;
    if (crawl.schemaTypes.some((t) => t.includes("LocalBusiness") || t.includes("PostalAddress"))) {
      score += 15;
    } else {
      recommendations.push("Add LocalBusiness structured data to your website.");
    }
  }

  score = Math.min(100, Math.max(25, score));
  const status = score >= 80 ? "excellent" : score >= 65 ? "good" : score >= 45 ? "warning" : "critical";

  return {
    score, weight: 15, status,
    explanation: "Assesses your local search footprint, NAP consistency, and geographic signals.",
    strengths, weaknesses, evidence: agentEvidence, recommendations, findings
  };
}

export async function runContentAuthorityAgent(context: AgentContext): Promise<AgentCategoryScore> {
  const { crawl, hasWebsite } = context;
  
  if (!hasWebsite) {
    return {
      score: 0, weight: 15, status: "insufficient",
      explanation: "Measures depth of information, service breakdown, and topical relevance.",
      strengths: [], weaknesses: ["No content available for analysis."],
      evidence: [], recommendations: [], findings: []
    };
  }

  let score = 35;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const evidence: string[] = [];
  const recommendations: string[] = [];
  const findings: AgentCategoryScore["findings"] = [];

  if (crawl.wordCount > 400) {
    score += 25;
    strengths.push(`Substantial homepage depth (${crawl.wordCount} words).`);
  } else {
    weaknesses.push("Thin content: lacks enough descriptive text to establish authority.");
    findings.push({
      title: "LOW TOPICAL AUTHORITY",
      whatWeFound: `We found only ${crawl.wordCount} words of readable text on your primary page.`,
      whyItMatters: "Search engines and AI models require deep, authoritative content to confidently recommend you as an expert.",
      businessImpact: "Difficulty ranking for competitive keywords and reduced AI discoverability.",
      recommendedAction: "Expand your core pages to at least 600 words detailing your expertise and process.",
      priority: "MEDIUM",
      source: "Content Analysis",
      confidence: "VERIFIED"
    });
  }

  if (crawl.headings.h2.length >= 3) score += 20;
  if (crawl.trustSignals.hasCaseStudies) score += 20;

  score = Math.min(100, Math.max(20, score));
  const status = score >= 80 ? "excellent" : score >= 65 ? "good" : score >= 45 ? "warning" : "critical";

  return {
    score, weight: 15, status,
    explanation: "Measures depth of information, service breakdown, and topical relevance needed for domain authority.",
    strengths, weaknesses, evidence, recommendations, findings
  };
}

export async function runTrustReputationAgent(context: AgentContext): Promise<AgentCategoryScore> {
  const { crawl, hasWebsite } = context;
  
  if (!hasWebsite) {
    return {
      score: 0, weight: 15, status: "insufficient",
      explanation: "Audits verifiable trust signals, customer reviews, and industry social proof.",
      strengths: [], weaknesses: ["Cannot verify trust signals without a central digital property or integrated APIs."],
      evidence: [], recommendations: [], findings: []
    };
  }

  let score = 35;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const evidence: string[] = [];
  const recommendations: string[] = [];
  const findings: AgentCategoryScore["findings"] = [];

  if (crawl.trustSignals.hasTestimonials) {
    score += 25;
    strengths.push("Social proof detected: Client reviews or testimonials found.");
  } else {
    weaknesses.push("Missing visible customer testimonials or reviews.");
    findings.push({
      title: "MISSING FIRST-PARTY SOCIAL PROOF",
      whatWeFound: "No customer testimonials were detected on your website.",
      whyItMatters: "Customers rely on peer reviews to make purchasing decisions. AI assistants frequently scrape reviews to determine reputation.",
      businessImpact: "Lower trust and reduced conversion rates.",
      recommendedAction: "Feature at least 3 genuine customer testimonials with names and project scopes.",
      priority: "HIGH",
      source: "Trust Analysis",
      confidence: "VERIFIED"
    });
  }

  if (crawl.trustSignals.hasPrivacyPolicy) score += 15;
  if (Object.keys(crawl.socialLinks).length >= 2) score += 15;
  if (crawl.trustSignals.hasCertifications) score += 10;

  score = Math.min(100, Math.max(20, score));
  const status = score >= 80 ? "excellent" : score >= 65 ? "good" : score >= 45 ? "warning" : "critical";

  return {
    score, weight: 15, status,
    explanation: "Audits verifiable trust signals, customer reviews, legal disclosures, and industry social proof.",
    strengths, weaknesses, evidence, recommendations, findings
  };
}

export async function runConversionAgent(context: AgentContext): Promise<AgentCategoryScore> {
  const { crawl, hasWebsite } = context;
  
  if (!hasWebsite) {
    return {
      score: 0, weight: 15, status: "insufficient",
      explanation: "Analyzes how easily a prospect can initiate contact or become a paying customer.",
      strengths: [], weaknesses: ["No conversion mechanisms found without a website."],
      evidence: [], recommendations: [], findings: []
    };
  }

  let score = 40;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const evidence: string[] = [];
  const recommendations: string[] = [];
  const findings: AgentCategoryScore["findings"] = [];

  if (crawl.contactInfo.hasContactForm) {
    score += 25;
    strengths.push("Direct lead capture form detected.");
  } else {
    weaknesses.push("No direct lead form or quote request form discovered.");
    findings.push({
      title: "HIGH CONVERSION FRICTION",
      whatWeFound: "We could not find an easy-to-use contact form on your primary page.",
      whyItMatters: "Forcing customers to click email links or call manually adds friction, leading to lost leads.",
      businessImpact: "Lost leads and lower return on marketing investment.",
      recommendedAction: "Place an easy 3-field quote/consultation form prominently on the page.",
      priority: "HIGH",
      source: "Conversion Analysis",
      confidence: "VERIFIED"
    });
  }

  if (crawl.contactInfo.hasWhatsApp) score += 15;
  if (crawl.contactInfo.phones.length > 0 || crawl.contactInfo.emails.length > 0) score += 15;

  score = Math.min(100, Math.max(25, score));
  const status = score >= 80 ? "excellent" : score >= 65 ? "good" : score >= 45 ? "warning" : "critical";

  return {
    score, weight: 15, status,
    explanation: "Analyzes how easily a prospect can initiate contact, request a quote, or become a paying customer.",
    strengths, weaknesses, evidence, recommendations, findings
  };
}
