import { CrawlResult, CategoryScore, Finding } from "../types";
import { BusinessInput } from "../rule-engine";

export interface EvidenceSource {
  name: string;
  url: string;
  sourceType: "WEBSITE" | "SEARCH" | "LOCAL" | "SOCIAL" | "DIRECTORY" | "REVIEW" | "CONTENT" | "ENTITY";
  collectedAt: Date;
  confidence: "CONFIRMED" | "LIKELY" | "POSSIBLE" | "NOT_CONFIRMED";
}

export interface Evidence {
  id: string;
  businessId?: string;
  sourceType: EvidenceSource["sourceType"];
  sourceUrl: string;
  sourceName: string;
  evidenceType: string; // e.g. "NAME_CONSISTENCY", "PHONE_NUMBER", "RANKING"
  observedValue: string;
  confidence: "VERIFIED" | "OBSERVED" | "INFERRED" | "RECOMMENDED" | "NOT_CONFIRMED" | "INSUFFICIENT_DATA";
  collectedAt: Date;
}

export interface BusinessIdentity {
  id?: string;
  name: string;
  normalizedName: string;
  industry: string;
  location: string;
  country?: string;
  city?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  discoveredDomains: string[];
  discoveredSocialProfiles: string[];
  discoveredBusinessProfiles: string[];
  entityConfidence: "CONFIRMED" | "LIKELY" | "POSSIBLE" | "NOT_CONFIRMED";
}

export interface ServiceOpportunity {
  service: "WEBSITE_DESIGN" | "WEBSITE_REDESIGN" | "BRAND_IDENTITY" | "DIGITAL_MARKETING" | "LOCAL_VISIBILITY" | "AI_VISIBILITY" | "CONTENT_STRATEGY" | "SOCIAL_MEDIA_STRATEGY" | "CONVERSION_OPTIMIZATION" | "DIGITAL_FOUNDATION";
  reason: string;
  evidenceId?: string; // Optional link to specific evidence
  priority: "HIGH" | "MEDIUM" | "LOW";
  confidence: "HIGH" | "MEDIUM" | "LOW";
}



export interface AgentContext {
  input: BusinessInput;
  crawl: CrawlResult;
  hasWebsite: boolean;
  identity?: BusinessIdentity;
  evidence?: Evidence[];
}

export interface BaseAgentResult {
  score: number; // 0-100
  status: "critical" | "warning" | "good" | "excellent" | "insufficient";
  explanation: string;
  findings: Finding[];
}

// Ensure the new structure matches what scoring engine expects (CategoryScore but with findings)
export interface AgentCategoryScore extends CategoryScore {
  findings: Finding[];
}
