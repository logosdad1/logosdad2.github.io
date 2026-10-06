import { AuditReportDataPayload, IntelligenceTier } from "./types";

export interface TierEntitlements {
  canAccessTechnicalClarity: boolean;
  canAccessAIVisibilityFindings: boolean;
  canAccessLocalSearchFindings: boolean;
  canAccessContentAuthorityFindings: boolean;
  canAccessTrustFindings: boolean;
  canAccessConversionFindings: boolean;
  canAccessActionPlan: boolean;
  canAccessSchemaCode: boolean;
  canAccessPDFExport: boolean;
  canAccessCompetitors: boolean;
  canAccessCustomerIntent: boolean;
  canAccessThirtyDayPlan: boolean;
  canAccessQueryCoverage: boolean;
  canAccessStrategicRoadmap: boolean;
}

export const TIER_PERMISSIONS: Record<IntelligenceTier, TierEntitlements> = {
  SNAPSHOT: {
    canAccessTechnicalClarity: false,
    canAccessAIVisibilityFindings: false,
    canAccessLocalSearchFindings: false,
    canAccessContentAuthorityFindings: false,
    canAccessTrustFindings: false,
    canAccessConversionFindings: false,
    canAccessActionPlan: false,
    canAccessSchemaCode: false,
    canAccessPDFExport: false,
    canAccessCompetitors: false,
    canAccessCustomerIntent: false,
    canAccessThirtyDayPlan: false,
    canAccessQueryCoverage: false,
    canAccessStrategicRoadmap: false,
  },
  ESSENTIAL: {
    canAccessTechnicalClarity: true,
    canAccessAIVisibilityFindings: true,
    canAccessLocalSearchFindings: true,
    canAccessContentAuthorityFindings: true,
    canAccessTrustFindings: true,
    canAccessConversionFindings: true,
    canAccessActionPlan: true,
    canAccessSchemaCode: true,
    canAccessPDFExport: true,
    canAccessCompetitors: false,
    canAccessCustomerIntent: false,
    canAccessThirtyDayPlan: false,
    canAccessQueryCoverage: false,
    canAccessStrategicRoadmap: false,
  },
  GROWTH: {
    canAccessTechnicalClarity: true,
    canAccessAIVisibilityFindings: true,
    canAccessLocalSearchFindings: true,
    canAccessContentAuthorityFindings: true,
    canAccessTrustFindings: true,
    canAccessConversionFindings: true,
    canAccessActionPlan: true,
    canAccessSchemaCode: true,
    canAccessPDFExport: true,
    canAccessCompetitors: true,
    canAccessCustomerIntent: true,
    canAccessThirtyDayPlan: true,
    canAccessQueryCoverage: false,
    canAccessStrategicRoadmap: false,
  },
  AUTHORITY: {
    canAccessTechnicalClarity: true,
    canAccessAIVisibilityFindings: true,
    canAccessLocalSearchFindings: true,
    canAccessContentAuthorityFindings: true,
    canAccessTrustFindings: true,
    canAccessConversionFindings: true,
    canAccessActionPlan: true,
    canAccessSchemaCode: true,
    canAccessPDFExport: true,
    canAccessCompetitors: true,
    canAccessCustomerIntent: true,
    canAccessThirtyDayPlan: true,
    canAccessQueryCoverage: true,
    canAccessStrategicRoadmap: true,
  },
};

/**
 * Filter report data according to tier entitlement rules.
 * Never exposes higher-tier intelligence payloads across API boundaries.
 */
export function filterReportDataByTier(
  data: AuditReportDataPayload | null,
  tier: IntelligenceTier,
  isPaid: boolean
): Partial<AuditReportDataPayload> | null {
  if (!data) return null;

  if (!isPaid || tier === "SNAPSHOT") {
    return {
      executiveSummary: data.executiveSummary,
      categories: {
        websiteClarity: { ...data.categories.websiteClarity, findings: [] },
        aiVisibility: { ...data.categories.aiVisibility, findings: [] },
        searchLocal: { ...data.categories.searchLocal, findings: [] },
        contentAuthority: { ...data.categories.contentAuthority, findings: [] },
        trustCredibility: { ...data.categories.trustCredibility, findings: [] },
        conversionReadiness: { ...data.categories.conversionReadiness, findings: [] },
      },
      lockedTeasers: data.lockedTeasers,
    };
  }

  const permissions = TIER_PERMISSIONS[tier] || TIER_PERMISSIONS.ESSENTIAL;
  const filtered: AuditReportDataPayload = { ...data };

  if (!permissions.canAccessCompetitors) {
    filtered.competitorComparison = [];
  }
  if (!permissions.canAccessCustomerIntent) {
    filtered.customerIntentAnalysis = [];
  }
  if (!permissions.canAccessThirtyDayPlan) {
    filtered.thirtyDayPlan = [];
  }
  if (!permissions.canAccessQueryCoverage) {
    filtered.queryCoverageAnalysis = [];
  }
  if (!permissions.canAccessStrategicRoadmap) {
    filtered.strategicRoadmap = null as any;
  }

  return filtered;
}
