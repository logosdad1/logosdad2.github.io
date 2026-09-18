export type IntelligenceTier = "SNAPSHOT" | "ESSENTIAL" | "GROWTH" | "AUTHORITY";

export interface CrawlResult {
  url: string;
  finalUrl: string;
  statusCode: number;
  isSsl: boolean;
  title: string;
  metaDescription: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  wordCount: number;
  hasSchema: boolean;
  schemas: any[];
  schemaTypes: string[];
  contactInfo: {
    emails: string[];
    phones: string[];
    hasWhatsApp: boolean;
    hasContactForm: boolean;
    hasPhysicalAddress: boolean;
    detectedAddresses: string[];
  };
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  trustSignals: {
    hasPrivacyPolicy: boolean;
    hasTerms: boolean;
    hasTestimonials: boolean;
    hasCertifications: boolean;
    hasCaseStudies: boolean;
    imageCount: number;
    imagesMissingAlt: number;
  };
  cleanTextSample: string;
  navigationItems: string[];
  footerLinks: string[];
}

export interface Finding {
  id: string; // Unique identifier for cross-referencing
  type: "STRENGTH" | "WEAKNESS" | "OPPORTUNITY" | "INSIGHT";
  title: string;
  whatWeFound: string; // The observed evidence
  whyItMatters: string; // The contextual finding
  businessImpact: string; // The impact on the business
  recommendedAction: string; // The resulting recommendation
  priority: "HIGH" | "MEDIUM" | "LOW";
  source: string;
  confidence: "VERIFIED" | "OBSERVED" | "INFERRED" | "RECOMMENDED" | "NOT_CONFIRMED" | "INSUFFICIENT_DATA";
  relatedModules: string[]; // e.g. ["GROWTH", "LOCAL", "SEARCH"]
  tierAccess: "FREE" | "ESSENTIAL" | "GROWTH" | "AUTHORITY";
}

export interface CategoryScore {
  score: number; // 0 - 100
  weight: number; // percentage (e.g. 20)
  status: "critical" | "warning" | "good" | "excellent" | "insufficient";
  explanation: string;
  findings: Finding[];
}

export interface ActionPlanItem {
  id: string;
  tier: "FIX_NOW" | "FIX_NEXT" | "OPTIMIZE_LATER";
  title: string;
  description: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  effort: "EASY" | "MEDIUM" | "HARD";
  category: string;
}

export interface CompetitorGap {
  area: string;
  yourStatus: string;
  competitorBenchmark: string;
  impact: string;
}

export interface CustomerIntentItem {
  buyerQuestion: string;
  intentType: "Discover" | "Evaluate" | "Compare" | "Trust" | "Act/Buy";
  yourSiteStatus: "Explicitly Answered" | "Partially Covered" | "Completely Missing";
  recommendation: string;
}

export interface ThirtyDayPlanPhase {
  phase: string;
  timeframe: string;
  objective: string;
  tasks: {
    title: string;
    deliverable: string;
    role: "Developer / Agency" | "Business Owner" | "Content Strategist";
    impact: string;
  }[];
}

export interface QueryCoverageItem {
  simulatedQuery: string;
  queryCategory: "Brand Discovery" | "Core Problem/Service" | "Hyper-Local Proximity" | "Pricing & Commercial" | "Competitor Alternative" | "Trust & Proof";
  aiVisibilityStatus: "Dominant" | "At Risk" | "Invisible";
  diagnosticReason: string;
  optimizationStep: string;
}

export interface StrategicRoadmap {
  executiveDirective: string;
  primaryStrategicAdvantage: string;
  immediateBottleneck: string;
  quarterlyMilestones: {
    quarter: string;
    focus: string;
    kpiTarget: string;
  }[];
  handoffGuideForTeam: string[];
}

export interface GeneratedSchema {
  type: string;
  codeSnippet: string;
  instructions: string;
}

export interface AuditReportDataPayload {
  executiveSummary: {
    currentVisibility: string;
    visibilityStatement: string;
    keyFindings: Finding[]; // Canonical list of top insights across categories
  };
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
  lockedTeasers: {
    additionalIssuesCount: number;
    biggestAiGap: string;
    competitorGapCount: number;
  };
  serviceOpportunities?: {
    service: string;
    reason: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    confidence: "HIGH" | "MEDIUM" | "LOW";
  }[];
}

export interface SystemSettings {
  paidReportPrice: number; // default $10
  tierPrices: {
    essential: number; // $10
    growth: number; // $25
    authority: number; // $50
  };
  scoreWeights: {
    websiteClarity: number;
    aiVisibility: number;
    searchLocal: number;
    contentAuthority: number;
    trustCredibility: number;
    conversionReadiness: number;
  };
  aiProvider: "gemini" | "openai" | "heuristic";
  allowMockCheckout: boolean;
  freeReportLimitsPerIp: number;
  leadCaptureEmail: string;
}
