"use client";

import { useState } from "react";
import { IntelligenceTier } from "@/lib/types";
import { Check, Lock, Sparkles, ArrowRight, ShieldCheck, Zap, TrendingUp, Layers, HelpCircle, FileText } from "lucide-react";

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
    promise: "See my score.",
    unlockedFeatures: [
      "Overall Business Visibility Score (0–100)",
      "6 core dimension score meters",
      "Top 3 verified strengths & top 2 urgent warnings",
      "Biggest high-level opportunity statement",
    ],
    lockedFeatures: [
      "Complete technical clarity & AI readiness diagnosis",
      "Structured entity schema generator",
      "Competitor benchmark matrix & gaps",
      "Customer intent & question answering analysis",
      "30-day prioritized action plan",
      "Generative search query coverage analysis",
      "Executive team strategic roadmap",
    ],
  },
  {
    id: "ESSENTIAL",
    name: "Essential Intelligence",
    price: 10,
    label: "$10",
    promise: "Understand my problems.",
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
      "Generative query coverage across 6 search intents",
      "Executive team strategic roadmap",
    ],
  },
  {
    id: "GROWTH",
    name: "Growth Intelligence",
    price: 25,
    label: "$25",
    badge: "MOST POPULAR",
    promise: "Find my growth opportunities.",
    unlockedFeatures: [
      "Everything in Essential ($10)",
      "Competitor Intelligence Matrix (Your site vs top 20% benchmarks)",
      "Customer Intent Analysis (What prospects ask AI vs your site's answers)",
      "Content Opportunity Gap Map (Missing topics, FAQs, and service pages)",
      "Effort vs. Impact Priority Matrix",
      "Structured 30-Day Action Plan (Phased Week 1–4 execution)",
      "High-priority lead & conversion tuning guide",
    ],
    lockedFeatures: [
      "Deep Generative Search Query Coverage (Simulated LLM brand & solution queries)",
      "Entity Disambiguation Graph for RAG engines",
      "Executive Strategic Roadmap suitable for developer/marketing team handoff",
    ],
  },
  {
    id: "AUTHORITY",
    name: "Authority Intelligence",
    price: 50,
    label: "$50",
    badge: "PREMIUM STRATEGIC",
    promise: "Build my strategy.",
    unlockedFeatures: [
      "Everything in Growth ($25)",
      "Generative Search Query Coverage Analysis (6 simulated LLM queries)",
      "Brand, solution, local, pricing, competitor & proof query ranking status",
      "Entity Disambiguation Graph for RAG and search assistants",
      "Executive Strategic Growth Roadmap (Directives, quarterly KPIs)",
      "Developer & Marketing Team Handoff Blueprint",
      "Grounded Evidence Tags ([Observed], [Calculated], [AI-Assisted], [Recommendation])",
      "Priority Access to Agency Implementation Team",
    ],
    lockedFeatures: [],
  },
];

export default function IntelligenceDepthSlider({
  currentTier = "SNAPSHOT",
  initialSelectedTier = "GROWTH",
  onSelectTier,
  showActionButton = true,
  actionButtonLabel,
  className = "",
}: IntelligenceDepthSliderProps) {
  const [selectedTier, setSelectedTier] = useState<IntelligenceTier>(initialSelectedTier);

  const activeTierIndex = TIERS.findIndex((t) => t.id === selectedTier);
  const activeTier = TIERS[activeTierIndex];

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
    <div className={`rounded-2xl border border-zinc-800 bg-[#121212] p-6 sm:p-8 space-y-6 ${className}`}>
      <div className="text-center space-y-1.5 max-w-xl mx-auto">
        <div className="text-[11px] font-mono uppercase tracking-widest text-teal-400 font-semibold">
          Progressive Intelligence Model
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          HOW DEEP DO YOU WANT US TO GO?
        </h3>
        <p className="text-xs text-zinc-400">
          You are not buying more pages — you are choosing the depth of evidence, competitor insight, and strategic actionability.
        </p>
      </div>

      {/* Interactive Slider Track */}
      <div className="max-w-2xl mx-auto pt-2 space-y-4">
        <div className="relative px-2">
          {/* Custom Track with 4 Notch Positions */}
          <input
            type="range"
            min="0"
            max="3"
            step="1"
            value={activeTierIndex}
            onChange={handleSliderChange}
            className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500 focus:outline-none"
          />

          {/* Notch Labels */}
          <div className="flex justify-between text-xs font-mono font-bold pt-3 select-none">
            {TIERS.map((tier, idx) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => handleTierClick(tier.id)}
                className={`flex flex-col items-center transition-all ${
                  activeTierIndex === idx
                    ? "text-teal-400 scale-105"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <span className="text-sm font-bold">{tier.label}</span>
                <span className="text-[10px] font-normal tracking-tight hidden sm:inline text-zinc-400">
                  {tier.id === "SNAPSHOT" ? "Snapshot" : tier.id === "ESSENTIAL" ? "Essential" : tier.id === "GROWTH" ? "Growth" : "Authority"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Tier Banner */}
        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">{activeTier.name}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30">
                {activeTier.price === 0 ? "Free Scan" : `$${activeTier.price} One-Time`}
              </span>
              {activeTier.badge && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  activeTier.badge.includes("POPULAR")
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-teal-500/10 text-teal-300 border border-teal-500/30"
                }`}>
                  {activeTier.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-teal-300 italic">
              &ldquo;{activeTier.promise}&rdquo;
            </p>
          </div>

          {showActionButton && (
            <button
              type="button"
              onClick={() => onSelectTier && onSelectTier(activeTier.id)}
              className="py-2.5 px-5 rounded-full bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2 shrink-0 transition-all shadow-md"
            >
              <span>
                {actionButtonLabel || "Unlock My Intelligence"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Intelligence Unlocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Unlocked */}
          <div className="p-4 rounded-xl bg-emerald-950/10 border border-emerald-900/30 space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Intelligence Unlocked at {activeTier.label}</span>
            </div>
            <ul className="space-y-1.5 text-xs text-zinc-300">
              {activeTier.unlockedFeatures.map((feat, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Locked at this tier */}
          <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Requires Higher Intelligence Depth</span>
            </div>
            {activeTier.lockedFeatures.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-zinc-400">
                {activeTier.lockedFeatures.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-zinc-500 shrink-0">🔒</span>
                    <span className="line-through text-zinc-400">{feat}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-teal-300/80 pt-2 italic">
                Maximum strategic depth unlocked! Includes simulated generative query evaluations and complete team execution roadmap.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
