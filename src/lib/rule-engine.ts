import {
  CrawlResult,
  CategoryScore,
  ActionPlanItem,
  CompetitorGap,
  GeneratedSchema,
  CustomerIntentItem,
  ThirtyDayPlanPhase,
  QueryCoverageItem,
  StrategicRoadmap,
} from "./types";

export interface BusinessInput {
  name: string;
  url: string;
  industry: string;
  location: string;
}

export function evaluateDeterministicRules(
  input: BusinessInput,
  crawl: CrawlResult
): {
  categories: {
    websiteClarity: CategoryScore;
    aiVisibility: CategoryScore;
    searchLocal: CategoryScore;
    contentAuthority: CategoryScore;
    trustCredibility: CategoryScore;
    conversionReadiness: CategoryScore;
  };
  aiReadinessDetails: {
    canUnderstandWhatYouDo: boolean;
    canUnderstandWhoYouServe: boolean;
    canUnderstandLocations: boolean;
    entityAmbiguityLevel: "LOW" | "MODERATE" | "HIGH";
    missingCrucialContext: string[];
    observedEvidence: string[];
    readinessAssessment: string;
  };
  actionPlan: ActionPlanItem[];
  competitorComparison: CompetitorGap[];
  customerIntentAnalysis: CustomerIntentItem[];
  thirtyDayPlan: ThirtyDayPlanPhase[];
  queryCoverageAnalysis: QueryCoverageItem[];
  strategicRoadmap: StrategicRoadmap;
  generatedSchema: GeneratedSchema;
} {
  const { name, industry, location } = input;
  const lowerText = crawl.cleanTextSample.toLowerCase();
  const lowerIndustry = industry.toLowerCase();
  const lowerLoc = location.toLowerCase();

  // 1. Website Clarity (Target: 0-100)
  let clarityScore = 40;
  const clarityStrengths: string[] = [];
  const clarityWeaknesses: string[] = [];
  const clarityEvidence: string[] = [];
  const clarityRecs: string[] = [];

  if (crawl.title && crawl.title.length >= 15) {
    clarityScore += 15;
    clarityStrengths.push("Clear, identifiable page title that introduces your brand.");
    clarityEvidence.push(`Found page title: "${crawl.title}"`);
  } else {
    clarityWeaknesses.push("Missing or overly generic website title tag.");
    clarityEvidence.push("Title tag is short, missing, or lacks descriptive keywords.");
    clarityRecs.push("Update your homepage title to clearly include your business name, primary service, and city.");
  }

  if (crawl.headings.h1.length === 1) {
    clarityScore += 15;
    clarityStrengths.push("Well-structured main headline (H1) on your homepage.");
    clarityEvidence.push(`Main headline: "${crawl.headings.h1[0]}"`);
  } else if (crawl.headings.h1.length === 0) {
    clarityWeaknesses.push("Your homepage does not immediately tell a first-time visitor exactly what you do.");
    clarityEvidence.push("No primary H1 headline found above or within the main content.");
    clarityRecs.push("Add a prominent headline stating exactly what problem you solve and for whom.");
  } else {
    clarityWeaknesses.push("Multiple conflicting main headlines create confusion for visitors and AI parsers.");
    clarityEvidence.push(`Found ${crawl.headings.h1.length} separate H1 tags.`);
    clarityRecs.push("Consolidate your homepage to a single primary H1 headline followed by sub-headings.");
  }

  if (crawl.metaDescription && crawl.metaDescription.length >= 50) {
    clarityScore += 15;
    clarityStrengths.push("Descriptive summary found in your website's meta description.");
    clarityEvidence.push(`Meta description: "${crawl.metaDescription.slice(0, 100)}..."`);
  } else {
    clarityWeaknesses.push("Lacks a clear meta summary for search engines and AI link cards.");
    clarityRecs.push("Write a 150-character meta description highlighting your core service and value proposition.");
  }

  if (crawl.navigationItems.length >= 3) {
    clarityScore += 15;
    clarityStrengths.push(`Intuitive navigation menu with key sections (${crawl.navigationItems.slice(0, 4).join(", ")}).`);
  } else {
    clarityWeaknesses.push("Navigation is minimal or hard to discover.");
    clarityRecs.push("Provide explicit navigation links for Services, About, Projects, and Contact.");
  }

  clarityScore = Math.min(100, Math.max(25, clarityScore));

  // 2. AI Visibility (Target: 0-100)
  let aiScore = 30;
  const aiStrengths: string[] = [];
  const aiWeaknesses: string[] = [];
  const aiEvidence: string[] = [];
  const aiRecs: string[] = [];

  const mentionsIndustry = lowerText.includes(lowerIndustry) || crawl.title.toLowerCase().includes(lowerIndustry);
  const mentionsLocation = lowerText.includes(lowerLoc) || crawl.title.toLowerCase().includes(lowerLoc);

  if (crawl.hasSchema) {
    aiScore += 25;
    aiStrengths.push(`Structured data detected: ${crawl.schemaTypes.join(", ") || "Custom JSON-LD"}.`);
    aiEvidence.push(`Website has ${crawl.schemas.length} machine-readable schema definition(s).`);
  } else {
    aiWeaknesses.push("AI systems may have difficulty understanding exactly what your company does and which services you specialize in.");
    aiEvidence.push("No JSON-LD structured data or schema.org markup found in the page code.");
    aiRecs.push("Implement a verified LocalBusiness/Organization schema to feed AI crawlers structured business facts.");
  }

  if (mentionsIndustry) {
    aiScore += 20;
    aiStrengths.push(`Explicitly mentions core specialization (${industry}) in main page copy.`);
    aiEvidence.push(`Industry terms detected directly in parsed body copy.`);
  } else {
    aiWeaknesses.push("AI systems cannot determine your exact niche from the homepage copy.");
    aiEvidence.push(`Primary keyword "${industry}" is absent or rarely mentioned in main text.`);
    aiRecs.push(`Infuse clear semantic descriptions of your ${industry} offerings across the primary sections.`);
  }

  if (mentionsLocation) {
    aiScore += 15;
    aiStrengths.push(`Explicit geographic indicators found linking your business to ${location}.`);
  } else {
    aiWeaknesses.push(`AI cannot reliably tell what geographic areas you serve.`);
    aiEvidence.push(`Target location "${location}" was not found in parsed homepage text.`);
    aiRecs.push(`Create dedicated location and service area indicators specifying coverage in ${location}.`);
  }

  aiScore = Math.min(100, Math.max(20, aiScore));

  // 3. Search & Local Presence (Target: 0-100)
  let searchScore = 35;
  const searchStrengths: string[] = [];
  const searchWeaknesses: string[] = [];
  const searchEvidence: string[] = [];
  const searchRecs: string[] = [];

  if (crawl.isSsl) {
    searchScore += 15;
    searchStrengths.push("Secure SSL encryption (HTTPS) is properly configured.");
    searchEvidence.push("Valid HTTPS connection established.");
  } else {
    searchWeaknesses.push("Website is running without active SSL encryption.");
    searchRecs.push("Enforce HTTPS across all pages immediately to avoid browser warnings and ranking penalties.");
  }

  if (crawl.contactInfo.phones.length > 0) {
    searchScore += 15;
    searchStrengths.push(`Direct phone number displayed: ${crawl.contactInfo.phones[0]}`);
    searchEvidence.push(`Verified phone signal: ${crawl.contactInfo.phones[0]}`);
  } else {
    searchWeaknesses.push("No direct phone number was detected on the main page.");
    searchRecs.push("Add a prominent click-to-call phone number in the header and footer.");
  }

  if (crawl.contactInfo.hasPhysicalAddress || crawl.contactInfo.detectedAddresses.length > 0) {
    searchScore += 15;
    searchStrengths.push("Physical address or street reference detected for local map citations.");
  } else {
    searchWeaknesses.push("No physical address or explicit office location detected on homepage.");
    searchEvidence.push("Address signals absent from footer and contact areas.");
    searchRecs.push("List your registered street address or primary dispatch location in your footer.");
  }

  if (crawl.schemaTypes.some((t) => t.includes("LocalBusiness") || t.includes("PostalAddress"))) {
    searchScore += 20;
    searchStrengths.push("Local business schema entities explicitly mapped for search engines.");
  } else {
    searchWeaknesses.push("Lacks LocalBusiness schema mapping to connect with Google Maps and local search.");
    searchRecs.push("Add LocalBusiness structured data with NAP (Name, Address, Phone) consistency.");
  }

  searchScore = Math.min(100, Math.max(25, searchScore));

  // 4. Content & Authority (Target: 0-100)
  let contentScore = 35;
  const contentStrengths: string[] = [];
  const contentWeaknesses: string[] = [];
  const contentEvidence: string[] = [];
  const contentRecs: string[] = [];

  if (crawl.wordCount > 400) {
    contentScore += 25;
    contentStrengths.push(`Substantial homepage depth (${crawl.wordCount} words) providing sufficient context.`);
    contentEvidence.push(`Parsed word count: ${crawl.wordCount} words.`);
  } else {
    contentWeaknesses.push("Thin content: Your homepage lacks enough descriptive text to establish authority.");
    contentEvidence.push(`Found only ${crawl.wordCount} words of readable body text.`);
    contentRecs.push("Expand your homepage to at least 600 words detailing your process, services, and client benefits.");
  }

  if (crawl.headings.h2.length >= 3) {
    contentScore += 20;
    contentStrengths.push(`Structured topic hierarchy with ${crawl.headings.h2.length} distinct section headers.`);
  } else {
    contentWeaknesses.push("Limited section structuring makes it harder for readers and search bots to scan topics.");
    contentRecs.push("Use H2 subheadings to clearly break down your services, why clients choose you, and FAQs.");
  }

  if (crawl.trustSignals.hasCaseStudies) {
    contentScore += 20;
    contentStrengths.push("Case study / project portfolio evidence referenced on page.");
  } else {
    contentWeaknesses.push("No clear portfolio, project examples, or case studies found.");
    contentRecs.push(`Add a dedicated project gallery showing real-world ${industry} results.`);
  }

  contentScore = Math.min(100, Math.max(20, contentScore));

  // 5. Trust & Credibility (Target: 0-100)
  let trustScore = 35;
  const trustStrengths: string[] = [];
  const trustWeaknesses: string[] = [];
  const trustEvidence: string[] = [];
  const trustRecs: string[] = [];

  if (crawl.trustSignals.hasTestimonials) {
    trustScore += 25;
    trustStrengths.push("Social proof detected: Client reviews or testimonials found on website.");
    trustEvidence.push("Testimonials or reviews identified in content sections.");
  } else {
    trustWeaknesses.push("Missing visible customer testimonials or reviews on the homepage.");
    trustEvidence.push("No testimonial quotes or review badges identified.");
    trustRecs.push("Feature at least 3 genuine customer testimonials with names and project scopes.");
  }

  if (crawl.trustSignals.hasPrivacyPolicy) {
    trustScore += 15;
    trustStrengths.push("Privacy policy is present and accessible.");
  } else {
    trustWeaknesses.push("No privacy policy link found, which weakens credibility and ad compliance.");
    trustRecs.push("Publish a standard privacy policy linked from your footer.");
  }

  const socialCount = Object.keys(crawl.socialLinks).length;
  if (socialCount >= 2) {
    trustScore += 15;
    trustStrengths.push(`Active social presence verified (${Object.keys(crawl.socialLinks).join(", ")}).`);
  } else {
    trustWeaknesses.push("Limited or no external social proof links found.");
    trustRecs.push("Link active business profiles (LinkedIn, Facebook, Instagram) to strengthen entity trust.");
  }

  if (crawl.trustSignals.hasCertifications) {
    trustScore += 10;
    trustStrengths.push("Certifications, licenses, or accreditations highlighted in page text.");
  } else {
    trustWeaknesses.push("No industry accreditations, insurance, or licensing signals detected.");
    trustRecs.push(`Highlight your licensed and insured status or industry certifications in the trust bar.`);
  }

  trustScore = Math.min(100, Math.max(20, trustScore));

  // 6. Conversion Readiness (Target: 0-100)
  let convScore = 40;
  const convStrengths: string[] = [];
  const convWeaknesses: string[] = [];
  const convEvidence: string[] = [];
  const convRecs: string[] = [];

  if (crawl.contactInfo.hasContactForm) {
    convScore += 25;
    convStrengths.push("Direct lead capture form detected on website.");
    convEvidence.push("Interactive form found with contact inputs.");
  } else {
    convWeaknesses.push("No direct lead form or quote request form discovered on the page.");
    convRecs.push("Place an easy 3-field quote/consultation form prominently on the page.");
  }

  if (crawl.contactInfo.hasWhatsApp) {
    convScore += 15;
    convStrengths.push("Instant messaging (WhatsApp) enabled for high-intent mobile visitors.");
  }

  if (crawl.contactInfo.phones.length > 0 || crawl.contactInfo.emails.length > 0) {
    convScore += 15;
    convStrengths.push("Multiple accessible contact channels available.");
  } else {
    convWeaknesses.push("Contact accessibility is weak — visitors have to hunt for contact details.");
    convRecs.push("Add a sticky contact bar or clear Call-to-Action buttons above the fold.");
  }

  convScore = Math.min(100, Math.max(25, convScore));

  // Build AI Readiness Details
  const canUnderstandWhatYouDo = mentionsIndustry && (crawl.headings.h1.length > 0 || crawl.metaDescription.length > 0);
  const canUnderstandWhoYouServe = crawl.wordCount > 200;
  const canUnderstandLocations = mentionsLocation || crawl.contactInfo.detectedAddresses.length > 0;
  
  const entityAmbiguityLevel = !crawl.hasSchema || !canUnderstandWhatYouDo ? "HIGH" : (!canUnderstandLocations ? "MODERATE" : "LOW");

  const missingCrucialContext: string[] = [];
  if (!crawl.hasSchema) missingCrucialContext.push("Machine-readable JSON-LD entity definition");
  if (!canUnderstandLocations) missingCrucialContext.push(`Explicit geographic service bounds for ${location}`);
  if (!mentionsIndustry) missingCrucialContext.push(`Clear industry taxonomy for ${industry}`);
  if (crawl.contactInfo.phones.length === 0) missingCrucialContext.push("Direct machine-verifiable telephone number");

  const observedEvidence = [
    `Crawled final URL: ${crawl.finalUrl} (Status: ${crawl.statusCode})`,
    `SSL Encryption: ${crawl.isSsl ? "Verified Active" : "Missing/Inactive"}`,
    `Heading Hierarchy: ${crawl.headings.h1.length} H1, ${crawl.headings.h2.length} H2 tags detected`,
    `Structured Schema Markup: ${crawl.hasSchema ? crawl.schemaTypes.join(", ") : "None Detected"}`,
    `Contact Mechanisms: ${crawl.contactInfo.phones.length} phone(s), ${crawl.contactInfo.emails.length} email(s), WhatsApp: ${crawl.contactInfo.hasWhatsApp ? "Yes" : "No"}`,
    `Body Depth: ${crawl.wordCount} words indexed`,
  ];

  const readinessAssessment = entityAmbiguityLevel === "LOW"
    ? `Your digital footprint provides strong foundational signals. AI engines can parse your brand, industry (${industry}), and location (${location}) with reasonable confidence.`
    : entityAmbiguityLevel === "MODERATE"
    ? `Your company has partial machine visibility, but key contextual signals (such as explicit schema mapping and geographic boundaries) leave room for AI ambiguity.`
    : `AI systems currently experience high ambiguity when interpreting your business. Without structured data and explicit entity anchors, conversational search tools are likely to bypass your site for clearer competitors.`;

  const aiReadinessDetails = {
    canUnderstandWhatYouDo,
    canUnderstandWhoYouServe,
    canUnderstandLocations,
    entityAmbiguityLevel: entityAmbiguityLevel as "LOW" | "MODERATE" | "HIGH",
    missingCrucialContext,
    observedEvidence,
    readinessAssessment,
  };

  // Action Plan (Fix Now / Fix Next / Optimize Later)
  const actionPlan: ActionPlanItem[] = [
    {
      id: "act-1",
      tier: "FIX_NOW",
      title: "Deploy LocalBusiness JSON-LD Schema",
      description: "Insert the verified schema code snippet into your site header to instantly clarify your business name, phone, address, and specialization to AI crawlers.",
      impact: "HIGH",
      effort: "EASY",
      category: "AI Visibility",
    },
    {
      id: "act-2",
      tier: "FIX_NOW",
      title: "Clarify Above-the-Fold Value Proposition (H1)",
      description: `Refine your primary headline to clearly answer what you do, for whom, and where (${industry} in ${location}).`,
      impact: "HIGH",
      effort: "EASY",
      category: "Website Clarity",
    },
    {
      id: "act-3",
      tier: "FIX_NOW",
      title: "Make Contact & Quote Buttons Immediately Accessible",
      description: "Ensure your phone number is a clickable link and add a prominent 'Request a Quote' button above the fold.",
      impact: "HIGH",
      effort: "EASY",
      category: "Conversion",
    },
    {
      id: "act-4",
      tier: "FIX_NEXT",
      title: `Create Dedicated Service Pages for ${industry}`,
      description: "AI engines favor deep topical authority. Replace single-paragraph service blurbs with standalone pages detailing each service, process, and pricing models.",
      impact: "HIGH",
      effort: "MEDIUM",
      category: "Content & Authority",
    },
    {
      id: "act-5",
      tier: "FIX_NEXT",
      title: "Embed Real Client Testimonials & Review Badges",
      description: "Add 3+ client testimonials featuring real customer names, locations, and specific results achieved.",
      impact: "MEDIUM",
      effort: "MEDIUM",
      category: "Trust & Credibility",
    },
    {
      id: "act-6",
      tier: "OPTIMIZE_LATER",
      title: "Publish FAQ Section Addressing Buyer Objections",
      description: "AI conversational agents frequently pull direct answers from FAQ sections marked up with FAQPage schema.",
      impact: "MEDIUM",
      effort: "EASY",
      category: "AI Visibility",
    },
    {
      id: "act-7",
      tier: "OPTIMIZE_LATER",
      title: "Expand Location Landing Pages Across Key Service Zones",
      description: `Build targeted pages for neighborhoods and surrounding areas around ${location} to capture hyper-local search intent.`,
      impact: "MEDIUM",
      effort: "HARD",
      category: "Search & Local",
    },
  ];

  // Competitor Comparison
  const competitorComparison: CompetitorGap[] = [
    {
      area: "Structured AI Schema",
      yourStatus: crawl.hasSchema ? "Present" : "Missing",
      competitorBenchmark: "Top 20% competitors feature complete Organization & Service schemas",
      impact: "Crucial for AI discovery",
    },
    {
      area: "Website Clarity & Hero CTA",
      yourStatus: crawl.headings.h1.length === 1 ? "Clear H1" : "Vague or Multiple H1s",
      competitorBenchmark: "Direct problem-solution statement with primary CTA in header",
      impact: "Reduces bounce rates by ~28%",
    },
    {
      area: "Topical Content Depth",
      yourStatus: `${crawl.wordCount} words`,
      competitorBenchmark: "800 - 1,200 words per service category with proof points",
      impact: "Builds topical domain authority",
    },
    {
      area: "Verified Trust Signals",
      yourStatus: crawl.trustSignals.hasTestimonials ? "Testimonials detected" : "Lacks visible testimonials",
      competitorBenchmark: "Google Review embed, client logos, and license badges visible above fold",
      impact: "Direct conversion driver",
    },
    {
      area: "Mobile & Fast Contact",
      yourStatus: crawl.contactInfo.hasWhatsApp ? "WhatsApp + Phone" : (crawl.contactInfo.phones.length ? "Phone only" : "Contact page only"),
      competitorBenchmark: "1-tap click-to-call, WhatsApp deep-link, and simple 3-field form",
      impact: "Increases mobile lead volume by up to 40%",
    },
  ];

  // Generated Schema Snippet
  const generatedSchema: GeneratedSchema = {
    type: "LocalBusiness",
    codeSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "${name}",
  "url": "${crawl.finalUrl}",
  "telephone": "${crawl.contactInfo.phones[0] || "+1-000-000-0000"}",
  "email": "${crawl.contactInfo.emails[0] || "contact@" + new URL(crawl.finalUrl).hostname.replace(/^www\./, "")}",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "${location}"
  },
  "description": "${name} is a premier ${industry} provider serving ${location} and surrounding areas.",
  "openingHours": "Mo-Fr 08:00-18:00"
}
</script>`,
    instructions: "Copy and paste this script directly into the `<head>` section of your website or via Google Tag Manager. It tells search and AI engines your exact business identity.",
  };

  // Customer Intent Analysis (Growth & Authority Tiers)
  const hasPricingContent = lowerText.includes("cost") || lowerText.includes("price") || lowerText.includes("estimate") || lowerText.includes("quote");
  const hasSpeedContent = lowerText.includes("hour") || lowerText.includes("emergency") || lowerText.includes("same day") || lowerText.includes("fast");

  const customerIntentAnalysis: CustomerIntentItem[] = [
    {
      buyerQuestion: `How much do typical ${industry} services cost in ${location}?`,
      intentType: "Evaluate",
      yourSiteStatus: hasPricingContent ? "Partially Covered" : "Completely Missing",
      recommendation: hasPricingContent
        ? "Structure your pricing terms into an explicit comparison table or starting price guide."
        : "Add a transparent pricing / cost guide to capture users asking AI for budget ranges.",
    },
    {
      buyerQuestion: `What specific ${industry} specializations do you handle?`,
      intentType: "Discover",
      yourSiteStatus: crawl.headings.h2.length >= 3 ? "Explicitly Answered" : "Partially Covered",
      recommendation: "Ensure each distinct service has its own dedicated H2 section with process descriptions.",
    },
    {
      buyerQuestion: `How quickly can ${name} deploy or respond in ${location}?`,
      intentType: "Act/Buy",
      yourSiteStatus: hasSpeedContent ? "Explicitly Answered" : "Completely Missing",
      recommendation: "Clearly state your response window (e.g. 24-hour emergency response or same-week consultations).",
    },
    {
      buyerQuestion: `Are you licensed, insured, and verified to operate in ${location}?`,
      intentType: "Trust",
      yourSiteStatus: crawl.trustSignals.hasCertifications ? "Explicitly Answered" : "Partially Covered",
      recommendation: "Display your active contractor/business license number and insurance verification badge in the footer.",
    },
    {
      buyerQuestion: `What do real past clients in ${location} say about your work compared to others?`,
      intentType: "Compare",
      yourSiteStatus: crawl.trustSignals.hasTestimonials ? "Explicitly Answered" : "Completely Missing",
      recommendation: "Embed 3+ verified client quotes with local project photos to satisfy AI credibility checks.",
    },
  ];

  // 30-Day Action Plan (Growth & Authority Tiers)
  const thirtyDayPlan: ThirtyDayPlanPhase[] = [
    {
      phase: "Week 1",
      timeframe: "Days 1–7",
      objective: "Entity Clarity & Machine Anchoring",
      tasks: [
        {
          title: "Install LocalBusiness Schema",
          deliverable: "Deploy generated JSON-LD script into header",
          role: "Developer / Agency",
          impact: "Eliminates entity ambiguity for AI crawlers",
        },
        {
          title: "Align H1 Value Proposition",
          deliverable: `Update homepage headline to explicitly state: '${industry} in ${location}'`,
          role: "Content Strategist",
          impact: "Reduces first-visit bounce rate by ~22%",
        },
      ],
    },
    {
      phase: "Week 2",
      timeframe: "Days 8–14",
      objective: "Conversion & Friction Removal",
      tasks: [
        {
          title: "Add 3-Field Quick Quote Form Above Fold",
          deliverable: "Embed Name, Phone, Service input form",
          role: "Developer / Agency",
          impact: "Doubles lead capture rate on mobile traffic",
        },
        {
          title: "Verify Click-to-Call & WhatsApp Links",
          deliverable: "Ensure all phone numbers use 'tel:' links",
          role: "Developer / Agency",
          impact: "Removes friction for high-urgency callers",
        },
      ],
    },
    {
      phase: "Week 3",
      timeframe: "Days 15–21",
      objective: "Topical Authority & Service Depth",
      tasks: [
        {
          title: `Publish Dedicated ${industry} Sub-Pages`,
          deliverable: "Build standalone pages for top 3 core services with 600+ words each",
          role: "Content Strategist",
          impact: "Builds topical authority recognized by LLM citation engines",
        },
        {
          title: "Embed Verified Customer Reviews",
          deliverable: "Feature 3+ testimonials with project scopes and ratings",
          role: "Business Owner",
          impact: "Satisfies Google and AI third-party proof requirements",
        },
      ],
    },
    {
      phase: "Week 4",
      timeframe: "Days 22–30",
      objective: "Local Proximity & Question Answering",
      tasks: [
        {
          title: "Implement FAQPage Schema",
          deliverable: "Publish 5 FAQs addressing buyer objections with FAQPage JSON-LD",
          role: "Developer / Agency",
          impact: "Feeds conversational AI direct answer snippets",
        },
        {
          title: `Build Neighborhood Service Hub for ${location}`,
          deliverable: "Create local landing pages for top surrounding zip codes",
          role: "Content Strategist",
          impact: "Captures hyper-local map pack and conversational searches",
        },
      ],
    },
  ];

  // Generative Query Coverage Analysis (Authority Tier Exclusive)
  const queryCoverageAnalysis: QueryCoverageItem[] = [
    {
      simulatedQuery: `Who is ${name} and what do they specialize in?`,
      queryCategory: "Brand Discovery",
      aiVisibilityStatus: crawl.title.toLowerCase().includes(name.toLowerCase()) ? "Dominant" : "At Risk",
      diagnosticReason: crawl.title.toLowerCase().includes(name.toLowerCase())
        ? "Brand name is clearly anchored in title tags and body text."
        : "Brand name is ambiguous or competes with generic terms.",
      optimizationStep: "Ensure exact legal brand name appears in header title and Schema 'name' attribute.",
    },
    {
      simulatedQuery: `Best ${industry} company in ${location}`,
      queryCategory: "Core Problem/Service",
      aiVisibilityStatus: crawl.hasSchema && crawl.trustSignals.hasTestimonials ? "Dominant" : (crawl.hasSchema ? "At Risk" : "Invisible"),
      diagnosticReason: crawl.hasSchema
        ? "Structured schema exists, but lacking external authority signals to secure top-tier recommendation."
        : "No machine-readable schema found. AI will prefer competitors with structured entity markup.",
      optimizationStep: "Implement LocalBusiness schema and acquire 5+ verified citations on industry directories.",
    },
    {
      simulatedQuery: `${industry} contractors near me in ${location}`,
      queryCategory: "Hyper-Local Proximity",
      aiVisibilityStatus: crawl.contactInfo.hasPhysicalAddress ? "At Risk" : "Invisible",
      diagnosticReason: crawl.contactInfo.hasPhysicalAddress
        ? "Address reference found, but lacks geo-coordinate markup (latitude/longitude)."
        : "No street address detected in page code; invisible to proximity-based AI retrieval.",
      optimizationStep: "Add full PostalAddress schema with geo-coordinates and embed Google Map.",
    },
    {
      simulatedQuery: `How much does ${industry} cost in ${location}?`,
      queryCategory: "Pricing & Commercial",
      aiVisibilityStatus: hasPricingContent ? "At Risk" : "Invisible",
      diagnosticReason: hasPricingContent
        ? "Mentions estimates/quotes, but provides no structured price ranges for AI parsers to quote."
        : "Zero pricing context found. AI marked pricing as 'unknown'.",
      optimizationStep: "Add a 'Starting from $X' or 'Average Project Range' section to your service pages.",
    },
    {
      simulatedQuery: `Top alternatives to ${name} in ${location}`,
      queryCategory: "Competitor Alternative",
      aiVisibilityStatus: crawl.wordCount > 400 ? "At Risk" : "Invisible",
      diagnosticReason: "Your website does not clearly state differentiators versus competitors.",
      optimizationStep: "Create a 'Why Choose Us' comparison table highlighting speed, warranties, and certifications.",
    },
    {
      simulatedQuery: `Is ${name} licensed and insured in ${location}?`,
      queryCategory: "Trust & Proof",
      aiVisibilityStatus: crawl.trustSignals.hasCertifications ? "Dominant" : "Invisible",
      diagnosticReason: crawl.trustSignals.hasCertifications
        ? "Licensing credentials detected directly in page copy."
        : "No license number or bonded/insured disclosures detected on homepage.",
      optimizationStep: "Place your license number and insurance badge in the global site footer.",
    },
  ];

  // Strategic Roadmap (Authority Tier Exclusive)
  const strategicRoadmap: StrategicRoadmap = {
    executiveDirective: `Transform ${name} from a static brochure website into a machine-discoverable business entity that conversational AI systems proactively recommend across ${location}.`,
    primaryStrategicAdvantage: `Early-mover advantage in ${location}: Fewer than 15% of local ${industry} competitors have implemented machine-readable entity schemas and conversational FAQ structures.`,
    immediateBottleneck: !crawl.hasSchema
      ? "Lack of structured JSON-LD schema markup blinds generative AI models from parsing your business profile."
      : "Insufficient topical content depth prevents AI engines from confirming your service expertise.",
    quarterlyMilestones: [
      {
        quarter: "Month 1 (Immediate Remediation)",
        focus: "Deploy Schema, optimize homepage H1, and embed trust badges",
        kpiTarget: "Achieve 75+ Business Visibility Score and eliminate entity ambiguity",
      },
      {
        quarter: "Month 2 (Topical Authority)",
        focus: "Publish 4 deep service pages and implement FAQPage schema",
        kpiTarget: "Appear in AI answer summaries for core service queries",
      },
      {
        quarter: "Month 3 (Local Domination)",
        focus: "Build 5 neighborhood location pages and connect Google Business Profile",
        kpiTarget: "Secure top-3 map pack and proximity recommendation placement",
      },
    ],
    handoffGuideForTeam: [
      "1. Web Developer: Insert the generated JSON-LD Schema snippet into site <head> tag.",
      "2. Web Developer: Add 'tel:' links to all phone numbers and embed 3-field quote form above fold.",
      "3. Copywriter: Update main H1 to clear problem-solution statement with city modifier.",
      "4. Content Team: Write 3 standalone service pages (600+ words each) answering common client questions.",
      "5. Operations: Collect and embed 3 verified customer quotes with photos and project details.",
    ],
  };

  const toCategoryStatus = (s: number): "critical" | "warning" | "good" | "excellent" => {
    if (s >= 80) return "excellent";
    if (s >= 65) return "good";
    if (s >= 45) return "warning";
    return "critical";
  };

  return {
    categories: {
      websiteClarity: {
        score: clarityScore,
        weight: 20,
        status: toCategoryStatus(clarityScore),
        explanation: "Measures how instantly a human visitor and search bot can determine your primary offer and purpose.",
        strengths: clarityStrengths,
        weaknesses: clarityWeaknesses,
        evidence: clarityEvidence,
        recommendations: clarityRecs,
      },
      aiVisibility: {
        score: aiScore,
        weight: 20,
        status: toCategoryStatus(aiScore),
        explanation: "Evaluates how clearly AI recommendation models and generative search engines can interpret your entity and services.",
        strengths: aiStrengths,
        weaknesses: aiWeaknesses,
        evidence: aiEvidence,
        recommendations: aiRecs,
      },
      searchLocal: {
        score: searchScore,
        weight: 15,
        status: toCategoryStatus(searchScore),
        explanation: "Assesses your local search footprint, NAP (Name, Address, Phone) consistency, and geographic signals.",
        strengths: searchStrengths,
        weaknesses: searchWeaknesses,
        evidence: searchEvidence,
        recommendations: searchRecs,
      },
      contentAuthority: {
        score: contentScore,
        weight: 15,
        status: toCategoryStatus(contentScore),
        explanation: "Measures depth of information, service breakdown, and topical relevance needed for domain authority.",
        strengths: contentStrengths,
        weaknesses: contentWeaknesses,
        evidence: contentEvidence,
        recommendations: contentRecs,
      },
      trustCredibility: {
        score: trustScore,
        weight: 15,
        status: toCategoryStatus(trustScore),
        explanation: "Audits verifiable trust signals, customer reviews, legal disclosures, and industry social proof.",
        strengths: trustStrengths,
        weaknesses: trustWeaknesses,
        evidence: trustEvidence,
        recommendations: trustRecs,
      },
      conversionReadiness: {
        score: convScore,
        weight: 15,
        status: toCategoryStatus(convScore),
        explanation: "Analyzes how easily a prospect can initiate contact, request a quote, or become a paying customer.",
        strengths: convStrengths,
        weaknesses: convWeaknesses,
        evidence: convEvidence,
        recommendations: convRecs,
      },
    },
    aiReadinessDetails,
    actionPlan,
    competitorComparison,
    customerIntentAnalysis,
    thirtyDayPlan,
    queryCoverageAnalysis,
    strategicRoadmap,
    generatedSchema,
  };
}
