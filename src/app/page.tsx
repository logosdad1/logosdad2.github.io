"use client";

import Link from "next/link";
import IntelligenceDepthSlider from "@/components/IntelligenceDepthSlider";
import AuditForm from "@/components/AuditForm";
import ScoreGauge from "@/components/ScoreGauge";
import {
  Sparkles,
  Zap,
  Layers,
  Search,
  Users,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
  Cpu,
  Bot,
  Compass,
} from "lucide-react";

export default function HomePage() {
  const scrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const input = document.getElementById("businessName");
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      document.getElementById("audit-form")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-24 pb-20">
      <section className="relative pt-8 sm:pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
        {/* Subtle glowing background gradient for the hero/form area */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80%] max-w-[800px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="text-center space-y-4 max-w-3xl mx-auto mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-teal-300 bg-teal-500/10 border border-teal-500/20 shadow-sm shadow-teal-500/10">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>AI BUSINESS VISIBILITY INTELLIGENCE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            How Does AI See Your Business?
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Tell us who you are. We&apos;ll investigate the digital signals that help customers and AI-powered systems understand, discover and trust your business.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={scrollToForm}
              className="py-3 px-6 rounded-full bg-teal-500 hover:bg-teal-400 text-zinc-950 text-sm font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-all"
            >
              <span>Check My Business Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#how-it-works"
              className="py-3 px-6 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white text-sm font-medium transition-colors"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Hero Form Component */}
        <AuditForm className="relative z-20" />
      </section>

      {/* WHY THIS MATTERS SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80 pt-16">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Why This Matters
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            People aren&apos;t only searching Google anymore. They&apos;re asking intelligent AI systems for recommendations.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl mx-auto mb-10">
          {[
            { name: "ChatGPT", role: "Conversational Discovery", icon: Bot },
            { name: "Gemini", role: "Multimodal Search", icon: Cpu },
            { name: "Perplexity", role: "Direct Citations", icon: Sparkles },
            { name: "Search Engines", role: "Semantic AI Overviews", icon: Search },
            { name: "Google Maps", role: "Local Intent & Proximity", icon: Compass },
            { name: "Social Networks", role: "Brand Sentiment", icon: Users },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center space-y-1.5"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 mx-auto flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-white">{item.name}</div>
                <div className="text-[10px] text-zinc-500">{item.role}</div>
              </div>
            );
          })}
        </div>

        <div className="max-w-2xl mx-auto text-center p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
          &ldquo;If someone asks an AI system: <span className="text-teal-300 italic font-mono">&apos;Who is the best roofing contractor in my city?&apos;</span> — will the AI have enough structured evidence to mention you, or will it recommend your competitor?&rdquo;
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80 pt-16">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <div className="text-xs font-mono uppercase tracking-wider text-teal-400">
            Frictionless Process
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How It Works
          </h2>
          <p className="text-xs text-zinc-400">
            From raw domain scan to prioritized remediation in 5 clean steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {[
            { step: "01", title: "Enter Your Business", desc: "Submit your business name, domain, industry, and location." },
            { step: "02", title: "Get Your Free Score", desc: "Instantly view your 0–100 Business Visibility Score." },
            { step: "03", title: "Discover What's Missing", desc: "Understand why AI models or search bots struggle with your entity." },
            { step: "04", title: "Unlock Complete Report", desc: "Gain full access to the multi-agent diagnostic for $10." },
            { step: "05", title: "Fix Highest-Impact Problems", desc: "Execute the prioritized action plan (Fix Now / Fix Next / Later)." },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-[#121212] border border-zinc-800 space-y-2 relative"
            >
              <div className="text-xs font-mono text-teal-400 font-bold">{item.step}</div>
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT WE ANALYZE SECTION */}
      <section id="what-we-analyze" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80 pt-16">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <div className="text-xs font-mono uppercase tracking-wider text-teal-400">
            Comprehensive Dimensions
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            What We Analyze
          </h2>
          <p className="text-xs text-zinc-400">
            Six foundational pillars of digital legibility and machine discoverability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {[
            {
              icon: Layers,
              title: "Website Clarity",
              weight: "20%",
              desc: "Homepage value proposition, H1 hierarchy, mobile navigation clarity, and immediate service comprehension.",
            },
            {
              icon: Zap,
              title: "AI Visibility & Discoverability",
              weight: "20%",
              desc: "JSON-LD schema entities, machine-readable services, entity disambiguation, and AI answer readiness.",
            },
            {
              icon: Search,
              title: "Search & Local Presence",
              weight: "15%",
              desc: "NAP consistency (Name, Address, Phone), geographic coverage indicators, SSL encryption, and local signals.",
            },
            {
              icon: TrendingUp,
              title: "Content & Authority",
              weight: "15%",
              desc: "Topical depth, dedicated service pages, case study proof, and structured answering of customer questions.",
            },
            {
              icon: ShieldCheck,
              title: "Trust & Credibility",
              weight: "15%",
              desc: "Verified customer testimonials, licenses, certifications, privacy disclosures, and social footprint.",
            },
            {
              icon: Users,
              title: "Conversion Readiness",
              weight: "15%",
              desc: "Frictionless contact discovery, click-to-call, WhatsApp integration, and clear quote request forms.",
            },
          ].map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl bg-[#121212] border border-zinc-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    Weight: {cat.weight}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{cat.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{cat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SAMPLE REPORT PREVIEW */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80 pt-16">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <div className="text-xs font-mono uppercase tracking-wider text-teal-400">
            Interactive Output
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Sample Report Preview
          </h2>
          <p className="text-xs text-zinc-400">
            Clear, transparent business intelligence designed for decision-makers.
          </p>
        </div>

        {/* Mock Report Card */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-zinc-800 bg-[#121212] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-zinc-800">
            <div>
              <div className="text-xs font-mono text-teal-400 mb-1">Sample Client Diagnostic</div>
              <h3 className="text-xl font-bold text-white">Apex Commercial Roofing Ltd.</h3>
              <p className="text-xs text-zinc-400 font-mono">apexroofing-sample.com • Roofing • Austin, TX</p>
            </div>
            <ScoreGauge score={42} size={110} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-xs">
              <span className="text-emerald-400 font-bold block mb-1">✓ Doing Well</span>
              <p className="text-zinc-300">Core roofing services are clearly listed on the website.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-900/30 text-xs">
              <span className="text-amber-400 font-bold block mb-1">⚠ Needs Attention</span>
              <p className="text-zinc-300">AI cannot reliably determine your service areas outside city center.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/30 text-xs">
              <span className="text-rose-400 font-bold block mb-1">✕ Biggest Opportunity</span>
              <p className="text-zinc-300">Local business entity signals are incomplete, which may make it harder for search and AI systems to interpret your business.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TRANSPARENT PRICING SECTION */}
      <section id="pricing" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80 pt-16">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <div className="text-xs font-mono uppercase tracking-wider text-teal-400">
            Transparent Pricing
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Simple, Accessible Intelligence
          </h2>
          <p className="text-xs text-zinc-400">
            Start completely free. Unlock in-depth diagnostics when you want actionable fixes.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <IntelligenceDepthSlider
            currentTier="SNAPSHOT"
            initialSelectedTier="GROWTH"
            showActionButton={true}
            actionButtonLabel="Start Free Audit"
            onSelectTier={() => {
              if (typeof window !== "undefined") {
                window.location.href = "#audit-form";
              }
            }}
          />
        </div>
      </section>
    </div>
  );
}
