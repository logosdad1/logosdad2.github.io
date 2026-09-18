import { AgentContext, AgentCategoryScore } from "./types";

export async function runWebsiteAnalysisAgent(context: AgentContext): Promise<AgentCategoryScore> {
  const { crawl, hasWebsite } = context;
  
  if (!hasWebsite) {
    return {
      score: 0,
      weight: 20,
      status: "critical",
      explanation: "No website was provided. A dedicated website is the foundation of digital clarity.",
      findings: [{
        id: "WEB-001",
        type: "WEAKNESS",
        title: "DIGITAL FOUNDATION GAP",
        whatWeFound: "We found no dedicated website for your business.",
        whyItMatters: "A website is the central hub for your digital presence. Without it, customers and AI systems struggle to verify your identity and services.",
        businessImpact: "Significant loss of organic discovery and lower trust compared to competitors.",
        recommendedAction: "Build a professional website clearly explaining your services and service areas.",
        priority: "HIGH",
        source: "Input Analysis",
        confidence: "VERIFIED",
        relatedModules: ["GROWTH", "VISIBILITY", "CONTENT"],
        tierAccess: "FREE"
      }]
    };
  }

  let score = 40;
  const findings: AgentCategoryScore["findings"] = [];

  if (crawl.title && crawl.title.length >= 15) {
    score += 15;
    findings.push({
      id: "WEB-002",
      type: "STRENGTH",
      title: "CLEAR PAGE TITLE",
      whatWeFound: `Found page title: "${crawl.title}"`,
      whyItMatters: "A descriptive title tag helps search engines and AI models accurately categorize your business.",
      businessImpact: "Improves organic click-through rates and brand recognition.",
      recommendedAction: "Maintain clear title structure across all new pages.",
      priority: "LOW",
      source: "Website Analysis",
      confidence: "VERIFIED",
      relatedModules: ["SEARCH"],
      tierAccess: "FREE"
    });
  } else {
    findings.push({
      id: "WEB-003",
      type: "WEAKNESS",
      title: "GENERIC OR MISSING TITLE",
      whatWeFound: "The website homepage is missing a descriptive title tag.",
      whyItMatters: "Without a clear title tag, search engines struggle to present your business accurately in search results.",
      businessImpact: "Potential customers may scroll past your site if the offering isn't immediately obvious in search.",
      recommendedAction: "Update your homepage title to clearly state your business name and primary service.",
      priority: "MEDIUM",
      source: "Website Analysis",
      confidence: "VERIFIED",
      relatedModules: ["SEARCH", "GROWTH"],
      tierAccess: "FREE"
    });
  }

  if (crawl.headings.h1.length === 1) {
    score += 15;
    findings.push({
      id: "WEB-004",
      type: "STRENGTH",
      title: "CLEAR PRIMARY HEADING",
      whatWeFound: "Your homepage has a properly structured primary H1 heading.",
      whyItMatters: "Proper heading structure creates immediate clarity for both human readers and AI crawlers.",
      businessImpact: "Improves engagement by confirming the visitor is in the right place.",
      recommendedAction: "Ensure all core service pages also use a single descriptive H1.",
      priority: "LOW",
      source: "Website Analysis",
      confidence: "VERIFIED",
      relatedModules: ["CONTENT"],
      tierAccess: "ESSENTIAL"
    });
  } else if (crawl.headings.h1.length === 0) {
    findings.push({
      id: "WEB-005",
      type: "WEAKNESS",
      title: "MISSING CORE VALUE PROPOSITION",
      whatWeFound: "Your homepage lacks a primary H1 headline.",
      whyItMatters: "The H1 tag is the most important signal for visitors and search engines to understand what your page is about.",
      businessImpact: "Higher bounce rates as visitors struggle to immediately understand your offering.",
      recommendedAction: "Add a clear, single H1 headline stating exactly what problem you solve.",
      priority: "HIGH",
      source: "Website Analysis",
      confidence: "VERIFIED",
      relatedModules: ["GROWTH", "CONTENT", "VISIBILITY"],
      tierAccess: "FREE"
    });
  }

  if (crawl.metaDescription && crawl.metaDescription.length >= 50) {
    score += 15;
    findings.push({
      id: "WEB-006",
      type: "STRENGTH",
      title: "DESCRIPTIVE SUMMARY",
      whatWeFound: "Found a properly lengthy meta description.",
      whyItMatters: "Search engines often use this to display your business in search results.",
      businessImpact: "Improves organic search click-through rates.",
      recommendedAction: "Maintain descriptive summaries for all new pages.",
      priority: "LOW",
      source: "Website Analysis",
      confidence: "VERIFIED",
      relatedModules: ["SEARCH"],
      tierAccess: "FREE"
    });
  } else {
    findings.push({
      id: "WEB-007",
      type: "WEAKNESS",
      title: "MISSING SEARCH SUMMARY",
      whatWeFound: "Your homepage lacks a descriptive meta description.",
      whyItMatters: "Without this, Google may pick random text from your page to show in search results, which can look broken.",
      businessImpact: "Lower click-through rates in Google searches.",
      recommendedAction: "Write a clear, 150-character meta description.",
      priority: "MEDIUM",
      source: "Website Analysis",
      confidence: "VERIFIED",
      relatedModules: ["SEARCH"],
      tierAccess: "ESSENTIAL"
    });
  }

  if (crawl.navigationItems.length >= 3) {
    score += 15;
  } else {
    findings.push({
      id: "WEB-008",
      type: "OPPORTUNITY",
      title: "EXPAND NAVIGATION",
      whatWeFound: "Navigation menu appears minimal or hard to discover.",
      whyItMatters: "A clear navigation helps users quickly find services, pricing, and contact information.",
      businessImpact: "Reduces friction for users trying to explore your business.",
      recommendedAction: "Ensure core services and contact pages are explicitly linked in the main menu.",
      priority: "LOW",
      source: "Website Analysis",
      confidence: "INFERRED",
      relatedModules: ["CONTENT"],
      tierAccess: "ESSENTIAL"
    });
  }

  score = Math.min(100, Math.max(25, score));
  const status = score >= 80 ? "excellent" : score >= 65 ? "good" : score >= 45 ? "warning" : "critical";

  return {
    score, weight: 20, status,
    explanation: "Measures how instantly a human visitor and search bot can determine your primary offer and purpose.",
    findings
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
      findings: [{
        id: "AI-001",
        type: "WEAKNESS",
        title: "NO AI DATA FEED",
        whatWeFound: "No website available to act as a structured data source.",
        whyItMatters: "AI models cannot reliably recommend businesses that lack an owned, verifiable data source.",
        businessImpact: "Exclusion from generative search results (e.g. ChatGPT, Perplexity).",
        recommendedAction: "Launch a website with proper Organization and LocalBusiness schema.",
        priority: "HIGH",
        source: "AI Visibility Analysis",
        confidence: "VERIFIED",
        relatedModules: ["AI", "GROWTH", "VISIBILITY"],
        tierAccess: "FREE"
      }]
    };
  }

  let score = 30;
  const findings: AgentCategoryScore["findings"] = [];

  const mentionsIndustry = lowerText.includes(industry) || crawl.title.toLowerCase().includes(industry);
  const mentionsLocation = lowerText.includes(location) || crawl.title.toLowerCase().includes(location);

  if (crawl.hasSchema) {
    score += 25;
    findings.push({
      id: "AI-002",
      type: "STRENGTH",
      title: "AI ENTITY STRUCTURE DETECTED",
      whatWeFound: `Structured data detected: ${crawl.schemaTypes.join(", ")}`,
      whyItMatters: "Schema markup directly feeds your business entity data into AI models with high confidence.",
      businessImpact: "Higher likelihood of being cited accurately in AI-generated answers.",
      recommendedAction: "Regularly update schema if services or locations change.",
      priority: "LOW",
      source: "AI Visibility Analysis",
      confidence: "VERIFIED",
      relatedModules: ["AI"],
      tierAccess: "ESSENTIAL"
    });
  } else {
    findings.push({
      id: "AI-003",
      type: "WEAKNESS",
      title: "MISSING AI ENTITY STRUCTURE",
      whatWeFound: "Your website lacks JSON-LD schema markup.",
      whyItMatters: "AI models (like ChatGPT and Gemini) rely heavily on schema markup to categorize businesses with high confidence.",
      businessImpact: "Lower chance of being recommended by AI when users ask for services in your area.",
      recommendedAction: "Add LocalBusiness schema outlining your exact services and locations.",
      priority: "HIGH",
      source: "AI Visibility Analysis",
      confidence: "VERIFIED",
      relatedModules: ["AI", "GROWTH", "SEARCH"],
      tierAccess: "FREE"
    });
  }

  if (mentionsIndustry) score += 20;
  if (mentionsLocation) score += 15;
  
  if (!mentionsIndustry || !mentionsLocation) {
    findings.push({
      id: "AI-004",
      type: "OPPORTUNITY",
      title: "AI CONTEXT GAP",
      whatWeFound: "Core industry or location keywords are not prominently featured in the text.",
      whyItMatters: "LLMs look for dense, clear semantic relationships between your business name, what you do, and where you do it.",
      businessImpact: "AI engines may misunderstand your primary market or service area.",
      recommendedAction: "Ensure the homepage explicitly connects your core services to your target locations in natural language.",
      priority: "MEDIUM",
      source: "AI Context Analysis",
      confidence: "INFERRED",
      relatedModules: ["AI", "CONTENT"],
      tierAccess: "GROWTH"
    });
  }

  score = Math.min(100, Math.max(20, score));
  const status = score >= 80 ? "excellent" : score >= 65 ? "good" : score >= 45 ? "warning" : "critical";

  return {
    score, weight: 20, status,
    explanation: "Evaluates how clearly AI recommendation models and generative search engines can interpret your entity and services.",
    findings
  };
}

export async function runLocalPresenceAgent(context: AgentContext): Promise<AgentCategoryScore> {
  const { crawl, hasWebsite, evidence } = context;
  
  let score = 35;
  const findings: AgentCategoryScore["findings"] = [];

  const localEvidence = evidence?.filter(e => e.sourceType === "LOCAL") || [];

  if (!hasWebsite && localEvidence.length === 0) {
    return {
      score: 0, weight: 15, status: "insufficient",
      explanation: "Assesses your local search footprint, NAP consistency, and geographic signals.",
      findings: [{
        id: "LOC-001",
        type: "WEAKNESS",
        title: "NO LOCAL FOOTPRINT",
        whatWeFound: "Could not identify a website or local business profile.",
        whyItMatters: "Local visibility is nonexistent without digital properties.",
        businessImpact: "You are entirely invisible to 'near me' searches.",
        recommendedAction: "Claim and verify a Google Business Profile.",
        priority: "HIGH",
        source: "Local Presence Analysis",
        confidence: "VERIFIED",
        relatedModules: ["LOCAL", "GROWTH", "SEARCH"],
        tierAccess: "FREE"
      }]
    };
  }

  // Phase 3: Evaluate Local Discovery Signals
  if (localEvidence.length > 0) {
    score += 25;
    findings.push({
      id: "LOC-002",
      type: "STRENGTH",
      title: "LOCAL PROFILE DETECTED",
      whatWeFound: `Found local profile: ${localEvidence[0].sourceName}`,
      whyItMatters: "A verified local profile is the foundation of local map pack rankings.",
      businessImpact: "Allows customers to find your address, reviews, and hours easily.",
      recommendedAction: "Keep local profile hours and services up to date.",
      priority: "LOW",
      source: "Local Presence Analysis",
      confidence: "VERIFIED",
      relatedModules: ["LOCAL", "SEARCH"],
      tierAccess: "FREE"
    });
    
    if (localEvidence.some(e => e.evidenceType === "NAME_CONSISTENCY" && e.confidence === "VERIFIED")) {
      score += 15;
      findings.push({
        id: "LOC-003",
        type: "STRENGTH",
        title: "CONSISTENT BRANDING",
        whatWeFound: "Business name matches across website and local properties.",
        whyItMatters: "Consistent NAP (Name, Address, Phone) data builds trust with search engines.",
        businessImpact: "Strengthens local ranking reliability.",
        recommendedAction: "Maintain exact name match when creating new profiles.",
        priority: "LOW",
        source: "Local Presence Analysis",
        confidence: "VERIFIED",
        relatedModules: ["LOCAL", "TRUST"],
        tierAccess: "ESSENTIAL"
      });
    } else if (localEvidence.some(e => e.evidenceType === "NAME_CONSISTENCY" && e.confidence === "OBSERVED")) {
      findings.push({
        id: "LOC-004",
        type: "WEAKNESS",
        title: "NAP INCONSISTENCY DETECTED",
        whatWeFound: "Your business name differs between your website and local directories.",
        whyItMatters: "Search engines and AI use Name, Address, and Phone (NAP) consistency as a primary trust signal.",
        businessImpact: "Lower local search rankings and confused AI recommendations.",
        recommendedAction: "Standardize your business name across all platforms.",
        priority: "HIGH",
        source: "Local Presence Analysis",
        confidence: "INFERRED",
        relatedModules: ["LOCAL", "TRUST", "GROWTH"],
        tierAccess: "FREE"
      });
    }
  } else {
    findings.push({
      id: "LOC-005",
      type: "WEAKNESS",
      title: "MISSING LOCAL PROFILE",
      whatWeFound: "Could not discover an authoritative local business profile.",
      whyItMatters: "Without a local profile, you cannot appear in Google Maps or local pack results.",
      businessImpact: "Massive loss of high-intent local traffic.",
      recommendedAction: "Register and verify a Google Business Profile.",
      priority: "HIGH",
      source: "Local Presence Analysis",
      confidence: "INFERRED",
      relatedModules: ["LOCAL", "SEARCH", "GROWTH"],
      tierAccess: "FREE"
    });
  }

  if (hasWebsite && crawl.contactInfo.hasPhysicalAddress) {
    score += 15;
  } else if (hasWebsite) {
    findings.push({
      id: "LOC-006",
      type: "OPPORTUNITY",
      title: "EMBED LOCAL SIGNALS",
      whatWeFound: "Your website lacks a clear physical address in the footer or contact page.",
      whyItMatters: "Search engines cross-reference your website address with local directories.",
      businessImpact: "Weaker geographic relevance in search.",
      recommendedAction: "Add your full business address to your website footer.",
      priority: "MEDIUM",
      source: "Local Presence Analysis",
      confidence: "VERIFIED",
      relatedModules: ["LOCAL", "CONTENT"],
      tierAccess: "GROWTH"
    });
  }

  score = Math.min(100, Math.max(15, score));
  const status = score >= 80 ? "excellent" : score >= 65 ? "good" : score >= 45 ? "warning" : "critical";

  return {
    score, weight: 15, status,
    explanation: "Assesses your local search footprint, NAP consistency, and geographic signals.",
    findings
  };
}

export async function runContentAuthorityAgent(context: AgentContext): Promise<AgentCategoryScore> {
  const { crawl, hasWebsite } = context;
  
  if (!hasWebsite) {
    return {
      score: 0, weight: 15, status: "insufficient",
      explanation: "Measures depth of information, service breakdown, and topical relevance.",
      findings: [{
        id: "CON-001",
        type: "WEAKNESS",
        title: "NO CONTENT FOUNDATION",
        whatWeFound: "No website exists to evaluate topical authority.",
        whyItMatters: "Content is required for AI and Search engines to understand your expertise.",
        businessImpact: "You are not capturing educational or comparison-based intent.",
        recommendedAction: "Build a website with dedicated service and FAQ pages.",
        priority: "HIGH",
        source: "Content Analysis",
        confidence: "VERIFIED",
        relatedModules: ["CONTENT", "GROWTH"],
        tierAccess: "FREE"
      }]
    };
  }

  let score = 35;
  const findings: AgentCategoryScore["findings"] = [];

  if (crawl.wordCount > 400) {
    score += 25;
    findings.push({
      id: "CON-002",
      type: "STRENGTH",
      title: "STRONG CONTENT DEPTH",
      whatWeFound: `Substantial homepage depth (${crawl.wordCount} words).`,
      whyItMatters: "Search engines and AI reward detailed, comprehensive content.",
      businessImpact: "Increases topical authority and rankings.",
      recommendedAction: "Maintain deep content on all primary service pages.",
      priority: "LOW",
      source: "Content Analysis",
      confidence: "VERIFIED",
      relatedModules: ["CONTENT"],
      tierAccess: "FREE"
    });
  } else {
    findings.push({
      id: "CON-003",
      type: "WEAKNESS",
      title: "LOW TOPICAL AUTHORITY",
      whatWeFound: `We found only ${crawl.wordCount} words of readable text on your primary page.`,
      whyItMatters: "Search engines and AI models require deep, authoritative content to confidently recommend you as an expert.",
      businessImpact: "Difficulty ranking for competitive keywords and reduced AI discoverability.",
      recommendedAction: "Expand your core pages to at least 600 words detailing your expertise and process.",
      priority: "MEDIUM",
      source: "Content Analysis",
      confidence: "VERIFIED",
      relatedModules: ["CONTENT", "GROWTH"],
      tierAccess: "ESSENTIAL"
    });
  }

  if (crawl.headings.h2.length >= 3) score += 20;
  
  if (crawl.trustSignals.hasCaseStudies) {
    score += 20;
    findings.push({
      id: "CON-004",
      type: "STRENGTH",
      title: "PROOF OF EXPERTISE",
      whatWeFound: "Case studies or portfolios detected.",
      whyItMatters: "Case studies demonstrate real-world competence.",
      businessImpact: "Drives higher intent conversions.",
      recommendedAction: "Keep portfolios updated.",
      priority: "LOW",
      source: "Content Analysis",
      confidence: "VERIFIED",
      relatedModules: ["CONTENT", "TRUST"],
      tierAccess: "GROWTH"
    });
  } else {
    findings.push({
      id: "CON-005",
      type: "OPPORTUNITY",
      title: "MISSING CASE STUDIES",
      whatWeFound: "No identifiable case studies or detailed past projects found.",
      whyItMatters: "High-value clients look for deep proof of expertise.",
      businessImpact: "May lose bids to competitors who clearly showcase past work.",
      recommendedAction: "Add a 'Recent Projects' or 'Case Studies' section.",
      priority: "MEDIUM",
      source: "Content Analysis",
      confidence: "INFERRED",
      relatedModules: ["CONTENT", "TRUST", "GROWTH"],
      tierAccess: "GROWTH"
    });
  }

  score = Math.min(100, Math.max(20, score));
  const status = score >= 80 ? "excellent" : score >= 65 ? "good" : score >= 45 ? "warning" : "critical";

  return {
    score, weight: 15, status,
    explanation: "Measures depth of information, service breakdown, and topical relevance needed for domain authority.",
    findings
  };
}

export async function runTrustReputationAgent(context: AgentContext): Promise<AgentCategoryScore> {
  const { crawl, hasWebsite } = context;
  
  if (!hasWebsite) {
    return {
      score: 0, weight: 15, status: "insufficient",
      explanation: "Audits verifiable trust signals, customer reviews, and industry social proof.",
      findings: [{
        id: "TRU-001",
        type: "WEAKNESS",
        title: "NO DIGITAL TRUST SIGNALS",
        whatWeFound: "Cannot verify trust signals without a central digital property.",
        whyItMatters: "Trust must be established before a prospect will contact you.",
        businessImpact: "Low conversion rates from 'near me' discovery.",
        recommendedAction: "Establish a website that features real customer reviews and business credentials.",
        priority: "HIGH",
        source: "Trust Analysis",
        confidence: "VERIFIED",
        relatedModules: ["TRUST", "GROWTH"],
        tierAccess: "FREE"
      }]
    };
  }

  let score = 35;
  const findings: AgentCategoryScore["findings"] = [];

  if (crawl.trustSignals.hasTestimonials) {
    score += 25;
    findings.push({
      id: "TRU-002",
      type: "STRENGTH",
      title: "SOCIAL PROOF DETECTED",
      whatWeFound: "Client reviews or testimonials found on the website.",
      whyItMatters: "Social proof is the highest converter of cold traffic.",
      businessImpact: "Increases lead generation rates.",
      recommendedAction: "Continually update reviews with recent client success stories.",
      priority: "LOW",
      source: "Trust Analysis",
      confidence: "VERIFIED",
      relatedModules: ["TRUST", "CONVERSION"],
      tierAccess: "FREE"
    });
  } else {
    findings.push({
      id: "TRU-003",
      type: "WEAKNESS",
      title: "MISSING FIRST-PARTY SOCIAL PROOF",
      whatWeFound: "No customer testimonials were detected on your website.",
      whyItMatters: "Customers rely on peer reviews to make purchasing decisions. AI assistants frequently scrape reviews to determine reputation.",
      businessImpact: "Lower trust and reduced conversion rates.",
      recommendedAction: "Feature at least 3 genuine customer testimonials with names and project scopes.",
      priority: "HIGH",
      source: "Trust Analysis",
      confidence: "VERIFIED",
      relatedModules: ["TRUST", "GROWTH", "CONVERSION"],
      tierAccess: "ESSENTIAL"
    });
  }

  if (crawl.trustSignals.hasPrivacyPolicy) score += 15;
  
  if (Object.keys(crawl.socialLinks).length >= 2) {
    score += 15;
    findings.push({
      id: "TRU-004",
      type: "STRENGTH",
      title: "CONNECTED SOCIAL PRESENCE",
      whatWeFound: "Multiple social media profiles linked from website.",
      whyItMatters: "Shows active engagement and offers alternative contact methods.",
      businessImpact: "Provides secondary trust verification for researchers.",
      recommendedAction: "Ensure linked profiles are actively maintained.",
      priority: "LOW",
      source: "Trust Analysis",
      confidence: "VERIFIED",
      relatedModules: ["TRUST", "SOCIAL"],
      tierAccess: "GROWTH"
    });
  } else {
    findings.push({
      id: "TRU-005",
      type: "OPPORTUNITY",
      title: "EXPAND SOCIAL FOOTPRINT",
      whatWeFound: "Fewer than 2 social profiles linked.",
      whyItMatters: "Some prospects prefer researching via social media before reaching out.",
      businessImpact: "May lose touchpoints with younger demographics.",
      recommendedAction: "Link active social profiles (e.g. LinkedIn, Facebook) to the footer.",
      priority: "MEDIUM",
      source: "Trust Analysis",
      confidence: "OBSERVED",
      relatedModules: ["TRUST", "SOCIAL"],
      tierAccess: "GROWTH"
    });
  }
  
  if (crawl.trustSignals.hasCertifications) score += 10;

  score = Math.min(100, Math.max(20, score));
  const status = score >= 80 ? "excellent" : score >= 65 ? "good" : score >= 45 ? "warning" : "critical";

  return {
    score, weight: 15, status,
    explanation: "Audits verifiable trust signals, customer reviews, legal disclosures, and industry social proof.",
    findings
  };
}

export async function runConversionAgent(context: AgentContext): Promise<AgentCategoryScore> {
  const { crawl, hasWebsite } = context;
  
  if (!hasWebsite) {
    return {
      score: 0, weight: 15, status: "insufficient",
      explanation: "Analyzes how easily a prospect can initiate contact or become a paying customer.",
      findings: [{
        id: "CNV-001",
        type: "WEAKNESS",
        title: "NO CONVERSION MECHANISM",
        whatWeFound: "Without a website, there is no direct digital way for a customer to convert.",
        whyItMatters: "Frictionless contact options are required to capture digital demand.",
        businessImpact: "Significant loss of potential leads.",
        recommendedAction: "Build a website with a direct quote/contact form.",
        priority: "HIGH",
        source: "Conversion Analysis",
        confidence: "VERIFIED",
        relatedModules: ["CONVERSION", "GROWTH"],
        tierAccess: "FREE"
      }]
    };
  }

  let score = 40;
  const findings: AgentCategoryScore["findings"] = [];

  if (crawl.contactInfo.hasContactForm) {
    score += 25;
    findings.push({
      id: "CNV-002",
      type: "STRENGTH",
      title: "LEAD CAPTURE FORM DETECTED",
      whatWeFound: "Direct lead capture form detected on the page.",
      whyItMatters: "Forms reduce friction for prospects who prefer not to call.",
      businessImpact: "Higher overall lead capture rate.",
      recommendedAction: "Ensure the form connects directly to your CRM or email.",
      priority: "LOW",
      source: "Conversion Analysis",
      confidence: "VERIFIED",
      relatedModules: ["CONVERSION"],
      tierAccess: "FREE"
    });
  } else {
    findings.push({
      id: "CNV-003",
      type: "WEAKNESS",
      title: "HIGH CONVERSION FRICTION",
      whatWeFound: "We could not find an easy-to-use contact form on your primary page.",
      whyItMatters: "Forcing customers to click email links or call manually adds friction, leading to lost leads.",
      businessImpact: "Lost leads and lower return on marketing investment.",
      recommendedAction: "Place an easy 3-field quote/consultation form prominently on the page.",
      priority: "HIGH",
      source: "Conversion Analysis",
      confidence: "VERIFIED",
      relatedModules: ["CONVERSION", "GROWTH"],
      tierAccess: "FREE"
    });
  }

  if (crawl.contactInfo.hasWhatsApp) score += 15;
  
  if (crawl.contactInfo.phones.length > 0 || crawl.contactInfo.emails.length > 0) {
    score += 15;
    findings.push({
      id: "CNV-004",
      type: "STRENGTH",
      title: "DIRECT CONTACT METHODS",
      whatWeFound: "Phone numbers or emails detected.",
      whyItMatters: "Provides immediate contact options for high-intent buyers.",
      businessImpact: "Captures ready-to-buy traffic.",
      recommendedAction: "Ensure phone numbers are clickable (tel links) on mobile.",
      priority: "LOW",
      source: "Conversion Analysis",
      confidence: "VERIFIED",
      relatedModules: ["CONVERSION"],
      tierAccess: "ESSENTIAL"
    });
  } else {
    findings.push({
      id: "CNV-005",
      type: "OPPORTUNITY",
      title: "MISSING DIRECT CONTACT INFO",
      whatWeFound: "No explicit phone numbers or emails found in the text.",
      whyItMatters: "Some users prefer direct communication over forms.",
      businessImpact: "May lose older or highly urgent demographics.",
      recommendedAction: "Add a clear phone number to the top right of your header.",
      priority: "MEDIUM",
      source: "Conversion Analysis",
      confidence: "VERIFIED",
      relatedModules: ["CONVERSION", "GROWTH"],
      tierAccess: "GROWTH"
    });
  }

  score = Math.min(100, Math.max(25, score));
  const status = score >= 80 ? "excellent" : score >= 65 ? "good" : score >= 45 ? "warning" : "critical";

  return {
    score, weight: 15, status,
    explanation: "Analyzes how easily a prospect can initiate contact, request a quote, or become a paying customer.",
    findings
  };
}
