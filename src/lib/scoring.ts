import { SystemSettings, CategoryScore } from "./types";

export function calculateOverallScore(
  categories: {
    websiteClarity: CategoryScore;
    aiVisibility: CategoryScore;
    searchLocal: CategoryScore;
    contentAuthority: CategoryScore;
    trustCredibility: CategoryScore;
    conversionReadiness: CategoryScore;
  },
  weights: SystemSettings["scoreWeights"]
): number {
  const totalWeight =
    (weights.websiteClarity || 20) +
    (weights.aiVisibility || 20) +
    (weights.searchLocal || 15) +
    (weights.contentAuthority || 15) +
    (weights.trustCredibility || 15) +
    (weights.conversionReadiness || 15);

  const weightedSum =
    categories.websiteClarity.score * (weights.websiteClarity || 20) +
    categories.aiVisibility.score * (weights.aiVisibility || 20) +
    categories.searchLocal.score * (weights.searchLocal || 15) +
    categories.contentAuthority.score * (weights.contentAuthority || 15) +
    categories.trustCredibility.score * (weights.trustCredibility || 15) +
    categories.conversionReadiness.score * (weights.conversionReadiness || 15);

  return Math.round(weightedSum / (totalWeight || 100));
}

export function getScoreBadge(score: number): {
  label: string;
  color: string;
  bg: string;
  border: string;
} {
  if (score >= 85) {
    return {
      label: "Excellent AI & Web Footprint",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
    };
  }
  if (score >= 70) {
    return {
      label: "Good Foundation (Optimization Needed)",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
    };
  }
  if (score >= 45) {
    return {
      label: "Needs Attention (Significant Visibility Gaps)",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
    };
  }
  return {
    label: "Critical (Largely Invisible to AI & Search)",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
  };
}
