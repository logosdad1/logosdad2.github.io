"use client";

import { useState } from "react";
import { IntelligenceTier } from "@/lib/types";
import { Check, Lock, Sparkles, ArrowRight } from "lucide-react";

interface IntelligenceDepthSliderProps {
  currentTier?: IntelligenceTier;
  initialSelectedTier?: IntelligenceTier;
  onSelectTier?: (tier: IntelligenceTier) => void;
  showActionButton?: boolean;
  actionButtonLabel?: string;
  className?: string;
}

interface TierInfo {
  id: IntelligenceTier;
  name: string;
  price: number;
  label: string;
  badge?: string;
  promise: string;
  unlockedFeatures: string[];
  lockedFeatures: string[];
}

const TIERS: TierInfo[] = [
  {
    id: "SNAPSHOT",
    name: "Visibility Snapshot",
    price: 0,
    label: "FREE",
    promise: "Shows the first layer.",
    unlockedFeatures: [
      "Overall Business Visibility Score (0–100)",
      "6 core dimension score meters",
      "Top verified strengths & urgent warnings",
      "Biggest high-level opportunity statement",
    ],
    lockedFeatures: [
      "Complete technical clarity & AI readiness diagnosis",
      "Structured entity schema generator",
      "Competitor benchmark matrix & gaps",
      "Customer intent & question answering analysis",
      "30-day prioritized action plan",
      "Deeper Discovery Questions",
      "Executive Strategic Roadmap",
    ],
  },
  {
    id: "ESSENTIAL",
    name: "Essential Intelligence",
    price: 10,
    label: "$10",
    promise: "Explains the evidence.",
    unlockedFeatures: [
      "Everything in Snapshot",
      "Full technical website clarity & UX breakdown",
      "AI readiness & machine readability diagnosis",
      "Local search signals, NAP & citation checks",
      "Content authority & trust signal audit",
      "Conversion readiness & contact friction analysis",
      "Prioritized Action List (Fix Now / Next / Later)",
      "Custom JSON-LD LocalBusiness Schema code",
      "Downloadable Executive PDF report",
    ],
    lockedFeatures: [
      "Competitor benchmark intelligence matrix",
      "Customer intent analysis (what buyers ask vs what you answer)",
      "30-day structured weekly implementation plan",
      "Deeper Discovery Questions",
      "Executive Strategic Roadmap",
    ],
  },
  {
    id: "GROWTH",
    name: "Growth Intelligence",
    price: 25,
    label: "$25",
    badge: "MOST POPULAR",
    promise: "Connects the evidence into growth opportunities.",
    unlockedFeatures: [
      "Everything in Essential ($10)",
      "Competitive & Market Context (Your site vs benchmarks)",
      "Customer Intent Analysis (What prospects ask AI vs your site's answers)",
      "Content Opportunity Gap Map (Missing topics, FAQs, and service pages)",
      "Effort vs. Impact Priority Matrix",
      "Structured 30-Day Action Plan (Phased Week 1–4 execution)",
      "High-priority lead & conversion tuning guide",
    ],
    lockedFeatures: [
      "Deeper Discovery Questions (Explore more questions customers may ask)",
      "Entity & Business Identity Analysis (See where information is consistent)",
      "Executive Strategic Roadmap (A plan your team can execute)",
    ],
  },
  {
    id: "AUTHORITY",
    name: "Authority Intelligence",
    price: 50,
    label: "$50",
    badge: "PREMIUM STRATEGIC",
    promise: "Turns that intelligence into a broader strategic position.",
    unlockedFeatures: [
      "Everything in Growth ($25)",
      "Deeper Discovery Questions (Simulated generative search evaluations)",
      "Entity & Business Identity Analysis",
      "Executive Strategic Roadmap (Directives, quarterly KPIs)",
      "Developer & Marketing Team Handoff Blueprint",
      "Grounded Evidence Tags ([Observed], [Inferred], [Recommended])",
      "Priority Access to Agency Implementation Team",
    ],
    lockedFeatures: [],
  },
];

const FOUND_EVIDENCE = [
  "Raw digital footprint signals & gaps",
  "Technical website performance metrics",
  "Competitor & market benchmarking data",
  "Customer intent search patterns",
  "Generative AI discovery capabilities",
  "Business & entity identity consistency"
];

export default function IntelligenceDepthSlider({
  currentTier = "SNAPSHOT",
  initialSelectedTier = "ESSENTIAL",
  onSelectTier,
  showActionButton = true,
  actionButtonLabel,
  className = "",
}: IntelligenceDepthSliderProps) {
  const [selectedTier, setSelectedTier] = useState<IntelligenceTier>(initialSelectedTier);

  const activeTierIndex = TIERS.findIndex((t) => t.id === selectedTier);
  const activeTier = TIERS[activeTierIndex];
  const isGrowthSelected = activeTier.id === "GROWTH";

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value);
    const tier = TIERS[idx].id;
    setSelectedTier(tier);
    if (onSelectTier) onSelectTier(tier);
  };

  const handleTierClick = (tier: IntelligenceTier) => {
    setSelectedTier(tier);
    if (onSelectTier) onSelectTier(tier);
  };

  return (
    <div className={`rounded-3xl border border-zinc-800/80 bg-[#121212]/90 p-8 sm:p-12 space-y-12 shadow-2xl relative overflow-hidden ${className}`}>
      {/* Decorative background glow for the slider section */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
      
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-widest text-teal-400 font-semibold bg-teal-500/10 border border-teal-500/20">
          Progressive Intelligence Model
        </div>
        <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          How Deep Should We Investigate?
        </h3>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          You are not buying additional pages. You are purchasing <strong className="text-zinc-200">depth of intelligence, evidence processing, and strategic actionability</strong>. Slide to explore what our AI can uncover.
        </p>
      </div>

      {/* Interactive Slider Track */}
      <div className="max-w-4xl mx-auto pt-4 space-y-6">
        <div className="relative px-4">
          <input
            type="range"
            min="0"
            max="3"
            step="1"
            value={activeTierIndex}
            onChange={handleSliderChange}
            className="w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all"
          />

          <div className="flex justify-between text-xs font-mono font-bold pt-6 select-none relative z-10">
            {TIERS.map((tier, idx) => {
              const isSelected = activeTierIndex === idx;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => handleTierClick(tier.id)}
                  className={`flex flex-col items-center transition-all duration-300 ${
                    isSelected
                      ? "text-teal-400 scale-110 -translate-y-2"
                      : "text-zinc-500 hover:text-zinc-300 hover:-translate-y-1"
                  }`}
                >
                  <span className={`text-base sm:text-lg font-bold ${isSelected ? 'text-white' : ''}`}>{tier.label}</span>
                  <span className={`text-[10px] sm:text-xs font-normal tracking-wide mt-1 ${isSelected ? 'text-teal-400 font-semibold' : 'text-zinc-500'}`}>
                    {tier.id === "SNAPSHOT" ? "Snapshot" : tier.id === "ESSENTIAL" ? "Essential" : tier.id === "GROWTH" ? "Growth" : "Authority"}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Tier Banner */}
        <div className={`mt-8 p-6 sm:p-8 rounded-2xl border transition-all duration-500 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden ${
          isGrowthSelected 
            ? "bg-gradient-to-r from-teal-950/40 to-[#121212] border-teal-500/50 shadow-[0_0_40px_rgba(20,184,166,0.15)]" 
            : "bg-zinc-900/50 border-zinc-700"
        }`}>
          {isGrowthSelected && (
            <div className="absolute top-0 right-0 p-32 bg-teal-500/10 blur-[80px] pointer-events-none rounded-full" />
          )}
          
          <div className="space-y-2 relative z-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-2xl font-bold ${isGrowthSelected ? 'text-white' : 'text-zinc-100'}`}>
                {activeTier.name}
              </span>
              <span className={`text-sm font-mono px-3 py-1 rounded-full font-semibold ${
                isGrowthSelected ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'bg-zinc-800 text-zinc-300'
              }`}>
                {activeTier.price === 0 ? "Free Scan" : `$${activeTier.price} One-Time`}
              </span>
              {activeTier.badge && (
                <span className={`text-xs font-mono px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                  activeTier.badge.includes("POPULAR")
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse"
                    : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                }`}>
                  {activeTier.badge}
                </span>
              )}
            </div>
            <p className={`text-sm italic ${isGrowthSelected ? 'text-teal-200/80' : 'text-zinc-400'}`}>
              &ldquo;{activeTier.promise}&rdquo;
            </p>
          </div>

          {showActionButton && (
            <button
              type="button"
              onClick={() => onSelectTier && onSelectTier(activeTier.id)}
              className={`relative z-10 py-3.5 px-6 rounded-full text-sm font-bold flex items-center justify-center gap-2 shrink-0 transition-all shadow-xl group ${
                isGrowthSelected
                  ? "bg-teal-500 hover:bg-teal-400 text-teal-950 hover:shadow-[0_0_30px_rgba(20,184,166,0.5)]"
                  : "bg-zinc-100 hover:bg-white text-zinc-950"
              }`}
            >
              <span>{actionButtonLabel || "Unlock My Intelligence"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Intelligence Unlocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-4">
          
          {/* Column 1: Found */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0c111d]/30 border border-indigo-900/30 space-y-4">
            <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold flex items-center gap-2 pb-2 border-b border-indigo-900/30">
              <Sparkles className="w-4 h-4" />
              <span>What ordigit Already Found</span>
            </div>
            <ul className="space-y-3 text-sm text-zinc-400">
              {FOUND_EVIDENCE.map((feat, i) => (
                <li key={i} className="flex items-start gap-3 leading-relaxed">
                  <span className="text-indigo-400 font-bold shrink-0 mt-0.5">·</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Unlocked */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0c111d]/50 border border-teal-900/30 space-y-4">
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-2 pb-2 border-b border-teal-900/30">
              <Check className="w-4 h-4" />
              <span>What You Can Understand Now</span>
            </div>
            <ul className="space-y-3 text-sm text-zinc-300">
              {activeTier.unlockedFeatures.map((feat, i) => (
                <li key={i} className="flex items-start gap-3 leading-relaxed">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Locked */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#121212] border border-zinc-800/80 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-800/10 rounded-bl-full pointer-events-none" />
            
            <div className="text-xs font-mono uppercase tracking-widest text-amber-500 font-bold flex items-center gap-2 pb-2 border-b border-zinc-800/80">
              <Lock className="w-4 h-4" />
              <span>What The Next Level Reveals</span>
            </div>
            {activeTier.lockedFeatures.length > 0 ? (
              <ul className="space-y-3 text-sm text-zinc-500">
                {activeTier.lockedFeatures.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 leading-relaxed">
                    <span className="text-amber-500/50 shrink-0 mt-0.5">🔒</span>
                    <span className="line-through decoration-zinc-700/50">{feat}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex flex-col justify-center pb-8">
                <Sparkles className="w-8 h-8 text-amber-500/40 mb-3" />
                <p className="text-sm text-amber-300/80 leading-relaxed">
                  You have unlocked maximum strategic depth. This includes full executive directives, simulated generative query evaluations, and complete developer handoff blueprints.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
