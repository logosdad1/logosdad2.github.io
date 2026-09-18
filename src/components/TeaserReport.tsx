"use client";

import { useState, useEffect } from "react";
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
  const [showLocked, setShowLocked] = useState(false);
  const [revealStage, setRevealStage] = useState(0);

  // Progressive Reveal Effect
  useEffect(() => {
    const timer1 = setTimeout(() => setRevealStage(1), 1000); // Intro -> Score
    const timer2 = setTimeout(() => setRevealStage(2), 2500); // Score -> Details
    const timer3 = setTimeout(() => setRevealStage(3), 3500); // Details -> Findings
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleUnlock = async (tier: IntelligenceTier) => {
    if (tier === "SNAPSHOT") return;
    setUnlocking(true);
    
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      
      if (!authData.user) {
        window.location.href = `/register?auditId=${auditId}&tier=${tier}&action=checkout`;
        return;
      }

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

  // Stage 0: Initial "INVESTIGATION COMPLETE" Reveal
  if (revealStage === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-700">
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
            <span>INVESTIGATION COMPLETE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            We connected the available public signals <br className="hidden sm:block"/>surrounding your business.
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Stage 1 & 2: Score Reveal */}
      <div className="rounded-3xl border border-zinc-800 bg-[#121212]/90 p-8 sm:p-10 backdrop-blur-sm shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Background glow tied to score */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] pointer-events-none opacity-20 ${
          overallScore >= 75 ? "bg-emerald-500" : overallScore >= 50 ? "bg-amber-500" : "bg-rose-500"
        }`} />

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono tracking-widest text-teal-400 bg-teal-500/10 border border-teal-500/20 uppercase font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ordigit Visibility Snapshot</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">{businessName}</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-zinc-400 font-mono tracking-wide">
              {url && <span>{url} <span className="text-zinc-700 mx-1">•</span></span>}
              <span>{industry}</span> <span className="text-zinc-700 mx-1">•</span> <span>{location}</span>
            </div>
          </div>
          
          <div className="shrink-0 flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl min-w-[200px]">
            <span className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-4">Visibility Score</span>
            <ScoreGauge score={overallScore} size={140} />
            {revealStage >= 2 && (
              <div className={`mt-4 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-500 ${statusColor}`}>
                {statusLabel}
              </div>
            )}
          </div>
        </div>
      </div>

      {revealStage >= 3 && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
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
      )}
    </div>
  );
}
