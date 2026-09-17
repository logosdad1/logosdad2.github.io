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
  let totalWeight = 0;
  let weightedSum = 0;

  const processCategory = (cat: CategoryScore, weight: number) => {
    if (cat.status !== "insufficient") {
      totalWeight += weight;
      weightedSum += cat.score * weight;
    }
  };

  processCategory(categories.websiteClarity, weights.websiteClarity || 20);
  processCategory(categories.aiVisibility, weights.aiVisibility || 20);
  processCategory(categories.searchLocal, weights.searchLocal || 15);
  processCategory(categories.contentAuthority, weights.contentAuthority || 15);
  processCategory(categories.trustCredibility, weights.trustCredibility || 15);
  processCategory(categories.conversionReadiness, weights.conversionReadiness || 15);

  if (totalWeight === 0) return 0; // Fallback if everything is insufficient

  return Math.round(weightedSum / totalWeight);
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
