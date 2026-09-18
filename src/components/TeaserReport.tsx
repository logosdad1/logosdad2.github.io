"use client";

import { useState, useEffect } from "react";
import ScoreGauge from "./ScoreGauge";
import IntelligenceDepthSlider from "./IntelligenceDepthSlider";
import { AuditReportDataPayload, IntelligenceTier } from "@/lib/types";
import {
  CheckCircle2, AlertTriangle, TrendingUp, Lock, ArrowRight, Sparkles
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

  let statusLabel = "LIMITED VISIBILITY";
  let statusColor = "text-rose-400";
  if (overallScore >= 75) {
    statusLabel = "STRONG VISIBILITY";
    statusColor = "text-emerald-400";
  } else if (overallScore >= 50) {
    statusLabel = "MODERATE VISIBILITY";
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
      <div className="rounded-3xl border border-zinc-800 bg-[#121212]/90 p-8 sm:p-10 backdrop-blur-sm shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Background glow tied to score (subtle) */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-10 ${
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

      {revealStage >= 2 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {[
            { label: "Website Clarity", score: reportData.categories.websiteClarity?.score || 0 },
            { label: "Search & Local", score: reportData.categories.searchLocal?.score || 0 },
            { label: "AI Visibility", score: reportData.categories.aiVisibility?.score || 0 },
            { label: "Trust Signals", score: reportData.categories.trustCredibility?.score || 0 },
            { label: "Content Auth", score: reportData.categories.contentAuthority?.score || 0 },
            { label: "Conversion", score: reportData.categories.conversionReadiness?.score || 0 },
          ].map((cat, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#121212]/90 border border-zinc-800/80 backdrop-blur-sm shadow-sm">
              <span className="text-[11px] font-mono font-semibold tracking-wider text-zinc-400 uppercase">{cat.label}</span>
              <span className={`text-sm font-bold ${
                cat.score >= 75 ? "text-emerald-400" : cat.score >= 50 ? "text-amber-400" : "text-rose-400"
              }`}>{cat.score}</span>
            </div>
          ))}
        </div>
      )}

      {revealStage >= 3 && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 mt-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight px-2">WHAT WE FOUND</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {/* KEY STRENGTHS */}
            <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /><span>Key Strengths</span>
                </div>
                {executiveSummary.keyFindings.filter(f => f.type === "STRENGTH").length > 0 && (
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">{executiveSummary.keyFindings.filter(f => f.type === "STRENGTH").length} Identified</span>
                )}
              </div>
              <ul className="space-y-4">
                {executiveSummary.keyFindings.filter(f => f.type === "STRENGTH").length > 0 ? (
                  executiveSummary.keyFindings.filter(f => f.type === "STRENGTH").slice(0, 3).map((finding, idx) => (
                    <li key={idx} className="flex flex-col gap-1.5 p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-emerald-500 font-bold shrink-0 leading-none text-xs">✓</span>
                        <span className="text-xs font-bold text-white tracking-wider">{finding.title}</span>
                      </div>
                      <p className="text-xs text-zinc-400"><strong className="text-zinc-300">Evidence:</strong> {finding.whatWeFound}</p>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-zinc-500 font-mono py-2">NO SIGNIFICANT STRENGTHS DETECTED</li>
                )}
              </ul>
            </div>

            {/* KEY WEAKNESSES */}
            <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-rose-400 text-sm font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" /><span>Key Weaknesses</span>
                </div>
                {executiveSummary.keyFindings.filter(f => f.type === "WEAKNESS").length > 0 && (
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">{executiveSummary.keyFindings.filter(f => f.type === "WEAKNESS").length} Identified</span>
                )}
              </div>
              <ul className="space-y-4">
                {executiveSummary.keyFindings.filter(f => f.type === "WEAKNESS").length > 0 ? (
                  executiveSummary.keyFindings.filter(f => f.type === "WEAKNESS").slice(0, 3).map((finding, idx) => (
                    <li key={idx} className="flex flex-col gap-1.5 p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-rose-500 font-bold shrink-0 leading-none text-xs">&#10005;</span>
                        <span className="text-xs font-bold text-white tracking-wider">{finding.title}</span>
                      </div>
                      <p className="text-xs text-zinc-400"><strong className="text-zinc-300">Evidence:</strong> {finding.whatWeFound}</p>
                      <p className="text-xs text-zinc-400"><strong className="text-zinc-300">Impact:</strong> {finding.businessImpact}</p>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-zinc-500 font-mono py-2">NO SIGNIFICANT WEAKNESSES DETECTED</li>
                )}
              </ul>
            </div>
            
            {/* KEY OPPORTUNITIES */}
            <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4" /><span>Key Opportunities</span>
                </div>
                {executiveSummary.keyFindings.filter(f => f.type === "OPPORTUNITY").length > 0 && (
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">{executiveSummary.keyFindings.filter(f => f.type === "OPPORTUNITY").length} Identified</span>
                )}
              </div>
              <ul className="space-y-4">
                {executiveSummary.keyFindings.filter(f => f.type === "OPPORTUNITY").length > 0 ? (
                  executiveSummary.keyFindings.filter(f => f.type === "OPPORTUNITY").slice(0, 3).map((finding, idx) => (
                    <li key={idx} className="flex flex-col gap-1.5 p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-indigo-400 font-bold shrink-0 leading-none text-xs">&rarr;</span>
                        <span className="text-xs font-bold text-white tracking-wider">{finding.title}</span>
                      </div>
                      <p className="text-xs text-zinc-400"><strong className="text-zinc-300">Evidence:</strong> {finding.whatWeFound}</p>
                      <p className="text-xs text-teal-400/90"><strong className="text-teal-400">Action:</strong> {finding.recommendedAction}</p>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-zinc-500 font-mono py-2">NO IMMEDIATE OPPORTUNITIES DETECTED</li>
                )}
              </ul>
            </div>
          </div>
          </div>

      {!showLocked ? (
        <div className="pt-4 flex justify-center">
          <button
            onClick={() => setShowLocked(true)}
            className="py-3 px-8 rounded-full bg-teal-500 hover:bg-teal-400 text-zinc-950 text-sm font-semibold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] group"
          >
            <span>See Deeper Intelligence</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-10">
          <div className="p-8 rounded-2xl border border-zinc-800 bg-[#121212]/90 space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400"><Lock className="w-5 h-5" /></div>
              <h3 className="text-xl font-bold text-white tracking-tight">DEEPER INTELLIGENCE AVAILABLE</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "CUSTOMER INTENT INTELLIGENCE", desc: "Understand what potential customers are trying to discover, evaluate, compare and act on.", tier: "Growth Intelligence" },
                { title: "CONTENT OPPORTUNITY MAP", desc: "Discover customer questions and content gaps surrounding your business.", tier: "Growth Intelligence" },
                { title: "COMPETITIVE VISIBILITY CONTEXT", desc: "Understand relevant visibility context around similar businesses where sufficient evidence exists.", tier: "Growth Intelligence" },
                { title: "PRIORITY ACTION PLAN", desc: "Know what to fix first based on impact and effort.", tier: "Growth Intelligence" },
                { title: "AI VISIBILITY DEEP DIVE", desc: "Understand how clearly your business information can be interpreted by modern discovery systems.", tier: "Authority Intelligence" }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white tracking-wide">{item.title}</h4>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase pt-2 border-t border-zinc-800">Available in {item.tier}</p>
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
