const fs = require('fs');

// =========================================================
// TeaserReport.tsx
// =========================================================
const teaser = `"use client";

import { useState } from "react";
import ScoreGauge from "./ScoreGauge";
import IntelligenceDepthSlider from "./IntelligenceDepthSlider";
import { AuditReportDataPayload, IntelligenceTier } from "@/lib/types";
import {
  CheckCircle2, AlertTriangle, XCircle, ShieldCheck,
  Zap, Layers, Search, Users, TrendingUp,
} from "lucide-react";

interface TeaserReportProps {
  auditId: string;
  businessName: string;
  url: string;
  industry: string;
  location: string;
  overallScore: number;
  reportData: AuditReportDataPayload;
  tierPrices?: { essential: number; growth: number; authority: number };
}

export default function TeaserReport({
  auditId,
  businessName,
  url,
  industry,
  location,
  overallScore,
  reportData,
  tierPrices = { essential: 10, growth: 25, authority: 50 },
}: TeaserReportProps) {
  const [unlocking, setUnlocking] = useState(false);

  const handleUnlock = (tier: IntelligenceTier) => {
    if (tier === "SNAPSHOT") return;
    setUnlocking(true);
    fetch("/api/checkout/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auditId, tier }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          alert("Unable to initiate checkout. Please try again.");
          setUnlocking(false);
        }
      })
      .catch(() => {
        alert("Error starting checkout.");
        setUnlocking(false);
      });
  };

  const { categories, executiveSummary } = reportData;

  const categoryList = [
    { key: "websiteClarity", label: "Website Clarity", icon: Layers, data: categories.websiteClarity },
    { key: "aiVisibility", label: "AI Visibility & Discoverability", icon: Zap, data: categories.aiVisibility },
    { key: "searchLocal", label: "Search & Local Presence", icon: Search, data: categories.searchLocal },
    { key: "contentAuthority", label: "Content & Authority", icon: TrendingUp, data: categories.contentAuthority },
    { key: "trustCredibility", label: "Trust & Credibility", icon: ShieldCheck, data: categories.trustCredibility },
    { key: "conversionReadiness", label: "Conversion Readiness", icon: Users, data: categories.conversionReadiness },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="rounded-2xl border border-slate-800 bg-[#0c111d]/90 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
              <span>Free Visibility Snapshot</span>
              <span>&bull;</span>
              <span className="text-slate-400">{industry} in {location}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{businessName}</h1>
            <p className="text-xs text-slate-400 font-mono truncate max-w-md">{url}</p>
            <p className="text-sm text-slate-300 pt-1 leading-relaxed max-w-xl">
              &ldquo;{executiveSummary.visibilityStatement}&rdquo;
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-center p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 mb-1">Business Visibility Score</span>
            <ScoreGauge score={overallScore} size={130} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0c111d]/80 p-6">
        <h2 className="text-base font-semibold text-white mb-4">Visibility Dimensions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {categoryList.map((cat) => {
            const Icon = cat.icon;
            const score = cat.data.score;
            let sc = "text-rose-400 bg-rose-500/10 border-rose-500/20";
            if (score >= 75) sc = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            else if (score >= 50) sc = "text-amber-400 bg-amber-500/10 border-amber-500/20";
            return (
              <div key={cat.key} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-slate-300"><Icon className="w-4 h-4" /></div>
                  <div>
                    <div className="text-xs font-medium text-slate-200">{cat.label}</div>
                    <div className="text-[11px] text-slate-500">Weight: {cat.data.weight}%</div>
                  </div>
                </div>
                <div className={\`px-2.5 py-1 rounded-md text-xs font-mono font-bold border \${sc}\`}>{score}/100</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-emerald-900/30 bg-emerald-950/10 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /><span>You&apos;re Doing Well</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {executiveSummary.topStrengths[0] || "Core business information and domain connectivity verified."}
          </p>
        </div>
        <div className="p-5 rounded-xl border border-amber-900/30 bg-amber-950/10 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" /><span>Needs Attention</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {executiveSummary.topProblems[0] || "AI models cannot clearly determine your geographic coverage."}
          </p>
        </div>
        <div className="p-5 rounded-xl border border-rose-900/30 bg-rose-950/10 space-y-2.5">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <XCircle className="w-4 h-4" /><span>Biggest Opportunity</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {executiveSummary.topOpportunities[0] || "Structured entity schema and dedicated service pages will immediately elevate ranking."}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-center">
          <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500">
            Choose your intelligence depth to unlock the full report
          </p>
        </div>
        <IntelligenceDepthSlider
          currentTier="SNAPSHOT"
          initialSelectedTier="GROWTH"
          onSelectTier={handleUnlock}
          showActionButton={true}
          actionButtonLabel={unlocking ? "Redirecting to checkout..." : undefined}
        />
        <p className="text-center text-[11px] text-slate-500">
          One-time payment &middot; Lifetime access &middot; PDF export included
        </p>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/TeaserReport.tsx', teaser, 'utf8');
console.log('TeaserReport.tsx written:', teaser.length, 'bytes');
