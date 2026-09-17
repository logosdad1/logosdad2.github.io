"use client";

import { useState } from "react";
import ScoreGauge from "./ScoreGauge";
import IntelligenceDepthSlider from "./IntelligenceDepthSlider";
import { AuditReportDataPayload, IntelligenceTier } from "@/lib/types";
import {
  CheckCircle2, AlertTriangle, XCircle, ShieldCheck,
  Zap, Layers, Search, Users, TrendingUp, Lock, ArrowRight, Sparkles
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

  const handleUnlock = async (tier: IntelligenceTier) => {
    if (tier === "SNAPSHOT") return;
    setUnlocking(true);
    
    try {
      // 1. Check if user is authenticated
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      
      if (!authData.user) {
        // Redirect to create account / sign in before checkout
        window.location.href = `/register?auditId=${auditId}&tier=${tier}&action=checkout`;
        return;
      }

      // 2. User is authenticated, proceed to checkout
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId, tier }),
      });
      
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Unable to initiate checkout. Please try again.");
        setUnlocking(false);
      }
    } catch (error) {
      alert("Error processing your request.");
      setUnlocking(false);
    }
  };

  const [showLocked, setShowLocked] = useState(false);

  const { executiveSummary } = reportData;

  let statusLabel = "Needs improvement / Critical";
  let statusColor = "text-rose-400";
  if (overallScore >= 75) {
    statusLabel = "Good / Competitive";
    statusColor = "text-emerald-400";
  } else if (overallScore >= 50) {
    statusLabel = "Fair / Needs Attention";
    statusColor = "text-amber-400";
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="rounded-2xl border border-zinc-800 bg-[#121212]/90 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20">
              <span>Free Visibility Snapshot</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{businessName}</h1>
            <p className="text-xs text-zinc-400 font-mono truncate max-w-md">
              {url ? `${url} • ` : "No Website Provided • "}{industry} &bull; {location}
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-center p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[11px] font-mono text-zinc-400 mb-2">Business Visibility Score</span>
            <ScoreGauge score={overallScore} size={110} />
            <div className={`mt-3 text-xs font-semibold uppercase tracking-wider ${statusColor}`}>
              {statusLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 rounded-2xl border border-rose-900/30 bg-rose-950/10 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 text-sm font-bold uppercase tracking-wider">
            <AlertTriangle className="w-5 h-5" /><span>Top 5 Weaknesses</span>
          </div>
          <ul className="space-y-3">
            {executiveSummary.topProblems.length > 0 ? (
              executiveSummary.topProblems.map((problem, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                  <span className="text-rose-500 font-bold shrink-0 leading-none mt-0.5">&#10005;</span>
                  <span className="leading-relaxed">{problem}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-zinc-500">No major weaknesses detected.</li>
            )}
          </ul>
        </div>
        
        <div className="p-6 rounded-2xl border border-indigo-900/30 bg-indigo-950/10 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold uppercase tracking-wider">
            <Sparkles className="w-5 h-5" /><span>Top 5 Opportunities</span>
          </div>
          <ul className="space-y-3">
            {executiveSummary.topOpportunities.length > 0 ? (
              executiveSummary.topOpportunities.map((opportunity, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                  <span className="text-indigo-400 font-bold shrink-0 leading-none mt-0.5">&rarr;</span>
                  <span className="leading-relaxed">{opportunity}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-zinc-500">No immediate opportunities detected.</li>
            )}
          </ul>
        </div>
      </div>

      {!showLocked ? (
        <div className="pt-4 flex justify-center">
          <button
            onClick={() => setShowLocked(true)}
            className="py-3 px-8 rounded-full bg-teal-500 hover:bg-teal-400 text-zinc-950 text-sm font-semibold flex items-center gap-2 transition-all shadow-md group"
          >
            <span>See What Else We Found</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-[#121212]/80 space-y-4">
            <div className="flex items-center gap-2 text-teal-400 mb-4">
              <Lock className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-white">Deeper Opportunities Found</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Competitor visibility & benchmark matrix",
                "Customer intent & question gap analysis",
                "Generative query coverage (simulated LLM ranking)",
                "Full technical AI-readiness diagnostic",
                "30-day prioritized action plan & roadmap",
                "Structured schema code generator"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80 text-xs text-zinc-300">
                  <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <IntelligenceDepthSlider
              currentTier="SNAPSHOT"
              initialSelectedTier="GROWTH"
              onSelectTier={handleUnlock}
              showActionButton={true}
              actionButtonLabel={unlocking ? "Redirecting to checkout..." : "Unlock My Intelligence"}
            />
            <p className="text-center text-[11px] text-zinc-500">
              One-time payment &middot; Lifetime access &middot; Actionable roadmap included
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
