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
  Activity,
  MessageSquareQuote,
  Target
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
    <div className="space-y-32 pb-32">
      <section className="relative pt-6 sm:pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
        {/* Subtle glowing background gradient for the hero/form area */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[600px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="text-center space-y-5 max-w-4xl mx-auto mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono tracking-widest text-teal-300 bg-teal-500/10 border border-teal-500/30 shadow-sm shadow-teal-500/20 mb-2 hover:bg-teal-500/20 transition-colors">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>AI BUSINESS VISIBILITY INTELLIGENCE</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
            How Does AI See <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">
              Your Business?
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto font-medium">
            Customers no longer just search—they ask intelligent systems for recommendations. We investigate the digital signals that help AI, Search, and Maps discover, understand, and trust your business.
          </p>
        </div>

        {/* Hero Form Component - Moved closely up to act as the primary CTA */}
        <AuditForm className="relative z-20 shadow-[0_40px_100px_rgba(0,0,0,0.6)]" />
      </section>

      {/* WHY THIS MATTERS SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-5xl mx-auto text-center space-y-6 mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            PEOPLE AREN'T ONLY SEARCHING GOOGLE ANYMORE.
          </h2>
          <p className="text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto">
            Customers now use a combination of AI, Maps, and Social platforms to make decisions. If your digital footprint isn't legible to these machines, you are invisible to modern customers.
          </p>
        </div>

        {/* VISUAL JOURNEY: Customer Question -> Action */}
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#121212] border border-zinc-700 shadow-xl relative z-10">
              <MessageSquareQuote className="w-6 h-6 text-teal-400" />
              <span className="text-lg font-medium text-white">"Who is the best roofing contractor near me?"</span>
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-0">
            <div className="w-px h-8 bg-gradient-to-b from-teal-500/50 to-teal-500/0" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {[
              { name: "Search Engines", role: "Google, Bing", icon: Search },
              { name: "Generative AI", role: "ChatGPT, Perplexity", icon: Bot },
              { name: "Local Maps", role: "Proximity & Intent", icon: Compass },
              { name: "Social & Trust", role: "Verification & Proof", icon: Users },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-[#121212] border border-zinc-700 flex items-center justify-center text-teal-400">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">{item.name}</h3>
                <p className="text-sm font-mono text-zinc-500">{item.role}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center -my-2 relative z-0">
            <div className="w-px h-16 bg-gradient-to-b from-zinc-800 to-teal-500/50" />
          </div>

          <div className="flex flex-col items-center text-center space-y-6">
            <div className="px-8 py-5 rounded-3xl bg-teal-500/10 border border-teal-500/20 text-teal-300 font-bold tracking-widest text-sm sm:text-base">
              DIGITAL BUSINESS SIGNALS
            </div>
            <ArrowRight className="w-6 h-6 text-zinc-600 rotate-90" />
            <div className="px-8 py-5 rounded-3xl bg-[#121212] border border-zinc-700 text-white font-bold tracking-widest text-sm sm:text-base">
              UNDERSTANDING
            </div>
            <ArrowRight className="w-6 h-6 text-zinc-600 rotate-90" />
            <div className="px-8 py-5 rounded-3xl bg-[#121212] border border-zinc-700 text-white font-bold tracking-widest text-sm sm:text-base">
              TRUST
            </div>
            <ArrowRight className="w-6 h-6 text-zinc-600 rotate-90" />
            <div className="px-8 py-5 rounded-3xl bg-teal-500 hover:bg-teal-400 transition-colors text-teal-950 font-extrabold tracking-widest text-base sm:text-lg shadow-[0_0_30px_rgba(20,184,166,0.3)] cursor-default">
              ACTION
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION (Vertical Journey) */}
      <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            How It Works
          </h2>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 relative">
          {/* Vertical connecting line for desktop */}
          <div className="hidden sm:block absolute top-10 bottom-10 left-[48px] w-px bg-zinc-800" />

          {[
            { step: "01", title: "TELL US ABOUT YOUR BUSINESS", desc: "Business name, website, industry and location." },
            { step: "02", title: "WE INVESTIGATE", desc: "Website, search, local presence, social signals, reputation and content." },
            { step: "03", title: "WE CONNECT THE EVIDENCE", desc: "ordigit connects the signals to understand the bigger picture." },
            { step: "04", title: "UNDERSTAND YOUR VISIBILITY", desc: "See how your business is discovered, understood and trusted." },
            { step: "05", title: "KNOW WHAT TO FIX FIRST", desc: "Get prioritized actions and a growth roadmap." },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row gap-6 sm:gap-12 p-8 sm:p-10 rounded-3xl bg-[#121212]/80 border border-zinc-800/80 hover:border-zinc-700 transition-all group relative overflow-hidden"
            >
              <div className="flex-shrink-0 relative z-10 bg-[#121212] pt-1">
                <div className="text-6xl font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-zinc-700 to-zinc-900 group-hover:from-teal-400 group-hover:to-teal-900 transition-colors">
                  {item.step}
                </div>
              </div>
              <div className="space-y-4 relative z-10 flex flex-col justify-center">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">{item.title}</h3>
                <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT WE ANALYZE SECTION (6 Pillars) */}
      <section id="what-we-analyze" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-5 mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            What We Analyze
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Six foundational pillars of digital legibility. If these aren't clear, machines cannot confidently connect you with customers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: Layers,
              title: "BUSINESS & WEBSITE CLARITY",
              desc: "How clearly is your core identity defined? We evaluate service positioning, location clarity, and cross-platform consistency.",
              tags: ["POSITIONING", "SERVICES", "IDENTITY"]
            },
            {
              icon: Zap,
              title: "AI VISIBILITY & DISCOVERABILITY",
              desc: "Can machines read your data? We check for structured data, JSON-LD schemas, and entity clarity for generative AI.",
              tags: ["SCHEMA.ORG", "JSON-LD", "ENTITY RELEVANCE"]
            },
            {
              icon: Search,
              title: "SEARCH & LOCAL PRESENCE",
              desc: "Is your footprint consistent? We cross-reference your Name, Address, and Phone (NAP) across local maps and directories.",
              tags: ["GOOGLE BUSINESS", "NAP CONSISTENCY", "CITATIONS"]
            },
            {
              icon: TrendingUp,
              title: "CONTENT & TOPICAL AUTHORITY",
              desc: "Do you answer the questions customers are asking? We measure topical depth, educational content, and service breakdowns.",
              tags: ["WORD COUNT", "FAQ DEPTH", "SERVICE PAGES"]
            },
            {
              icon: ShieldCheck,
              title: "TRUST & REPUTATION",
              desc: "We look for the verifiable proof that machines use to rank trustworthiness: reviews, case studies, and transparent policies.",
              tags: ["REVIEWS", "TESTIMONIALS", "CERTIFICATIONS"]
            },
            {
              icon: Users,
              title: "CUSTOMER CONVERSION",
              desc: "How much friction is in your funnel? We analyze contact methods, CTAs, forms, and booking accessibility.",
              tags: ["USABILITY", "CLICK-TO-CALL", "CLEAR CTAS"]
            },
          ].map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="group p-10 rounded-3xl bg-zinc-900/30 border border-zinc-800 hover:border-teal-500/50 hover:bg-zinc-900 transition-all duration-300 space-y-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-24 bg-teal-500/5 blur-[80px] group-hover:bg-teal-500/10 transition-colors pointer-events-none rounded-bl-full" />
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="p-4 rounded-2xl bg-zinc-800 text-zinc-400 group-hover:bg-teal-500 group-hover:text-teal-950 transition-all shadow-lg">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-5xl font-extrabold text-zinc-800/50 group-hover:text-teal-900/30 transition-colors">
                    0{idx + 1}
                  </div>
                </div>
                
                <div className="space-y-4 relative z-10">
                  <h3 className="text-2xl font-extrabold text-white tracking-tight group-hover:text-teal-300 transition-colors">{cat.title}</h3>
                  <p className="text-base text-zinc-400 leading-relaxed font-medium">{cat.desc}</p>
                </div>

                {/* Evidence Tags */}
                <div className="flex flex-wrap gap-3 pt-2 relative z-10">
                  {cat.tags.map((tag, tagIdx) => (
                    <span key={tagIdx} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#121212] text-zinc-500 border border-zinc-800/80 uppercase tracking-widest group-hover:border-zinc-700 transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SAMPLE REPORT PREVIEW */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-5 mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Clear, Decisive Intelligence
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Stop reading generic PDF audits. Our reports are designed for decision-makers—highlighting exactly what's working, what's broken, and what to do next.
          </p>
        </div>

        {/* Browser-like Mock Report Card */}
        <div className="max-w-5xl mx-auto rounded-[2rem] border border-zinc-700/50 bg-[#0c111d] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Browser Header */}
          <div className="h-14 border-b border-zinc-800 bg-[#1a1f2b] flex items-center px-6 gap-3">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-rose-500/80" />
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500/80" />
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="mx-auto flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#0c111d] border border-zinc-800 text-xs font-mono text-zinc-500">
              <Lock className="w-3.5 h-3.5" /> ordigit.com/report/demo
            </div>
            <div className="w-16" /> {/* Spacer */}
          </div>

          <div className="p-10 sm:p-16 space-y-12 relative">
            <div className="absolute top-10 right-10 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-extrabold text-emerald-400 uppercase tracking-widest">Live Demo</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-zinc-800/80">
              <div className="space-y-3 max-w-xl">
                <div className="text-sm font-mono font-bold text-teal-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5" /> Visibility Diagnostic
                </div>
                <h3 className="text-4xl font-extrabold text-white tracking-tight">Apex Commercial Roofing Ltd.</h3>
                <p className="text-base text-zinc-400 font-mono">apexroofing-sample.com • Roofing • Austin, TX</p>
              </div>
              <div className="flex-shrink-0">
                <ScoreGauge score={42} size={160} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-emerald-950/10 border border-emerald-900/30 space-y-4">
                <div className="inline-block px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-bold text-sm tracking-wide uppercase">✓ Doing Well</div>
                <p className="text-base text-zinc-300 leading-relaxed font-medium">Core roofing services are clearly listed on the website, establishing a baseline of service clarity.</p>
              </div>
              <div className="p-8 rounded-3xl bg-amber-950/10 border border-amber-900/30 space-y-4">
                <div className="inline-block px-3 py-1 rounded-md bg-amber-500/10 text-amber-400 font-bold text-sm tracking-wide uppercase">⚠ Needs Attention</div>
                <p className="text-base text-zinc-300 leading-relaxed font-medium">Your public business information does not clearly define the full service area. Discovery systems lack evidence for locations outside the primary city.</p>
              </div>
              <div className="p-8 rounded-3xl bg-rose-950/10 border border-rose-900/30 space-y-4">
                <div className="inline-block px-3 py-1 rounded-md bg-rose-500/10 text-rose-400 font-bold text-sm tracking-wide uppercase">✕ Biggest Opportunity</div>
                <p className="text-base text-zinc-300 leading-relaxed font-medium">Local business entity signals are incomplete (missing JSON-LD), making it significantly harder for AI systems to accurately classify your business.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMER INTENT SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-10">
        <div className="max-w-4xl mx-auto text-center space-y-5 mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight uppercase">
            What Are Your Customers Actually Trying To Find?
          </h2>
          <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
            ordigit goes beyond technical metrics to analyze Customer Intent.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="text-xs font-bold text-teal-500 tracking-widest uppercase">DISCOVER</div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white font-medium">"roofing companies near me"</div>
            </div>
            <div className="space-y-4">
              <div className="text-xs font-bold text-teal-500 tracking-widest uppercase">EVALUATE</div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white font-medium">"best roofing company in Accra"</div>
            </div>
            <div className="space-y-4">
              <div className="text-xs font-bold text-teal-500 tracking-widest uppercase">COMPARE</div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white font-medium">"metal roofing vs shingles"</div>
            </div>
            <div className="space-y-4">
              <div className="text-xs font-bold text-teal-500 tracking-widest uppercase">TRUST</div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white font-medium">"reliable roofing company Accra"</div>
            </div>
            <div className="space-y-4">
              <div className="text-xs font-bold text-teal-500 tracking-widest uppercase">ACT</div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white font-medium">"get roofing quote Accra"</div>
            </div>
          </div>

          <div className="bg-[#121212] border border-zinc-800 rounded-3xl p-10 flex flex-col items-center justify-center space-y-8 h-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-24 bg-teal-500/10 blur-[80px] pointer-events-none rounded-full" />
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-700">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="font-bold text-white uppercase tracking-widest text-sm pt-4">CUSTOMER QUESTION</div>
            </div>
            <ArrowRight className="w-6 h-6 text-zinc-600 rotate-90" />
            <div className="text-center space-y-2">
              <div className="font-bold text-zinc-300 uppercase tracking-widest text-sm">DOES THE BUSINESS ANSWER IT?</div>
            </div>
            <ArrowRight className="w-6 h-6 text-zinc-600 rotate-90" />
            <div className="text-center space-y-2">
              <div className="font-bold text-rose-400 uppercase tracking-widest text-sm">GAP</div>
            </div>
            <ArrowRight className="w-6 h-6 text-zinc-600 rotate-90" />
            <div className="text-center space-y-2">
              <div className="font-bold text-teal-400 uppercase tracking-widest text-lg">OPPORTUNITY</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRANSPARENT PRICING SECTION */}
      <section id="pricing" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-16">
        <div className="max-w-4xl mx-auto text-center space-y-5 mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight uppercase">
            HOW DEEP SHOULD WE INVESTIGATE?
          </h2>
          <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
            You're not buying more pages. You're choosing how deeply ordigit investigates the evidence surrounding your business.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <IntelligenceDepthSlider
            currentTier="SNAPSHOT"
            initialSelectedTier="GROWTH"
            showActionButton={true}
            actionButtonLabel="Start Your Investigation"
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
