import { notFound } from "next/navigation";
import AuditForm from "@/components/AuditForm";
import { CheckCircle2, AlertTriangle, ShieldCheck, Zap, ArrowRight, Layers } from "lucide-react";

interface IndustryData {
  title: string;
  industryName: string;
  headline: string;
  description: string;
  aiSpecificChallenges: string[];
  keySignalsToWin: string[];
  recommendedSchema: string;
}

const INDUSTRIES: Record<string, IndustryData> = {
  roofing: {
    title: "Roofing Company AI Visibility & Audit",
    industryName: "Roofing",
    headline: "How Do AI Search Engines See Your Roofing Company?",
    description:
      "When homeowners ask ChatGPT or Google 'Who is the most reliable roofing contractor near me for storm damage repair?', will your business get cited or will your competitors dominate?",
    aiSpecificChallenges: [
      "AI models struggle to determine emergency roofing availability without explicit service hours schema.",
      "Service area ambiguity: AI cannot verify whether you serve surrounding counties without dedicated city landing pages.",
      "Missing RoofingContractor schema prevents automated quote engines from understanding your pricing tier.",
    ],
    keySignalsToWin: [
      "Explicit RoofingContractor JSON-LD Schema with geo-coordinates",
      "Dedicated pages for Roof Replacement, Metal Roofing, and Storm Damage",
      "Embedded Google Reviews and verified manufacturer certifications (GAF, Owens Corning)",
      "Visible emergency phone numbers and instant quote request forms above the fold",
    ],
    recommendedSchema: "RoofingContractor",
  },
  "real-estate": {
    title: "Real Estate Agency AI Visibility & Audit",
    industryName: "Real Estate",
    headline: "Can Conversational AI Recommend Your Real Estate Agency?",
    description:
      "Modern home buyers and sellers ask AI for hyper-local neighborhood experts, agent track records, and recent listing valuations. Understand your agency's machine legibility.",
    aiSpecificChallenges: [
      "Listing pages frequently lack RealEstateAgent schema, causing AI to miss your active inventory.",
      "Neighborhood expertise is often buried in unindexed PDFs rather than structured semantic content.",
      "Agent credentials and license numbers are omitted from footer citation signals.",
    ],
    keySignalsToWin: [
      "RealEstateAgent schema with agent broker licenses and office addresses",
      "Hyper-local market guides detailing school zones, price trends, and community amenities",
      "Verified past transaction track records and client testimonial videos",
      "Direct 1-click consultation and valuation booking CTAs",
    ],
    recommendedSchema: "RealEstateAgent",
  },
  saas: {
    title: "B2B SaaS & Tech AI Visibility Audit",
    industryName: "Technology",
    headline: "How Discoverable is Your Software in LLM Product Recommendations?",
    description:
      "When enterprise buyers ask Perplexity or Claude 'What are the top alternatives to Salesforce for mid-market logistics?', is your SaaS included in the answer?",
    aiSpecificChallenges: [
      "Vague marketing buzzwords obscure your core feature set from semantic LLM parsers.",
      "Lack of transparent pricing or feature comparison tables forces AI to mark your product as 'pricing unknown'.",
      "Absence of SoftwareApplication schema prevents AI engines from extracting your API and integration ecosystem.",
    ],
    keySignalsToWin: [
      "SoftwareApplication & FAQPage structured JSON-LD schemas",
      "Direct feature-by-feature comparison tables against industry incumbents",
      "Clear developer documentation and public API endpoints",
      "Customer case studies featuring quantified ROI metrics and enterprise security certifications (SOC 2, ISO)",
    ],
    recommendedSchema: "SoftwareApplication",
  },
  construction: {
    title: "Construction & Commercial Contractor Audit",
    industryName: "Construction",
    headline: "See How Commercial Developers and AI See Your Contracting Firm",
    description:
      "General contractors and commercial builders rely on reputation and licensing. Discover how search bots and AI assistants index your project portfolio and bid capabilities.",
    aiSpecificChallenges: [
      "Portfolios lack machine-readable project specs (square footage, completion date, contract type).",
      "Subcontractor prequalification forms are hidden behind unindexed login walls.",
      "Safety records (EMR ratings, OSHA compliance) are missing from public trust signals.",
    ],
    keySignalsToWin: [
      "GeneralContractor schema with bonded and insured badges",
      "Detailed project case studies with photos, budget ranges, and project scopes",
      "Clear RFP and bid submission contact forms",
      "State general contractor license numbers in site footer",
    ],
    recommendedSchema: "GeneralContractor",
  },
};

export default function IndustryPage({ params }: { params: { slug: string } }) {
  const data = INDUSTRIES[params.slug];
  if (!data) notFound();

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Industry Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
          <span>Industry Intelligence • {data.industryName}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          {data.headline}
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          {data.description}
        </p>
      </div>

      {/* Pre-filled Audit Form */}
      <AuditForm defaultIndustry={data.industryName} />

      {/* Industry Challenges & Signals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto pt-8 border-t border-slate-800">
        <div className="p-6 rounded-2xl bg-[#0c111d] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Why Most {data.industryName} Sites Are Invisible to AI</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-300">
            {data.aiSpecificChallenges.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-[#0c111d] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Key Signals AI Look For</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-300">
            {data.keySignalsToWin.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
