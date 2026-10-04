"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import AIAmbientBackground from "./AIAmbientBackground";

interface AuditFormProps {
  defaultIndustry?: string;
  className?: string;
}

const loadingSteps = [
  "Identifying business entity",
  "Mapping digital presence",
  "Reading website signals",
  "Checking discovery surfaces",
  "Connecting public evidence",
  "Preparing visibility intelligence"
];

export default function AuditForm({ defaultIndustry = "Roofing", className = "" }: AuditFormProps) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState(defaultIndustry);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);

  // System Activation Animation Logic
  useEffect(() => {
    if (loading && loadingStep < loadingSteps.length) {
      const timer = setTimeout(() => {
        setLoadingStep(s => s + 1);
      }, 600); // Progress every 600ms
      return () => clearTimeout(timer);
    }
  }, [loading, loadingStep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !location.trim()) {
      setError("Please provide Business Name and Location to run an accurate analysis.");
      return;
    }

    setError(null);
    setLoading(true);
    setLoadingStep(0);

    try {
      const res = await fetch("/api/audit/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          websiteUrl: websiteUrl ? websiteUrl.trim() : "",
          industry,
          location: location.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to initiate analysis. Please try again.");
      }

      const data = await res.json();
      
      // Trigger background worker
      fetch("/api/audit/worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId: data.auditId })
      }).catch(console.error);

      // Wait for the visual "System Activation" sequence to finish before navigating
      setTimeout(() => {
        router.push(`/audit/${data.auditId}?name=${encodeURIComponent(businessName.trim())}`);
      }, 3600); // 6 steps * 600ms = 3600ms

    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`w-full max-w-2xl mx-auto ${className}`} id="audit-form">
        <div className="rounded-2xl border border-[#00BFA6]/20 bg-black/60 backdrop-blur-xl shadow-[0_0_50px_rgba(0,191,166,0.1)] relative overflow-hidden min-h-[400px] flex items-center justify-center p-8 sm:p-12">
          
          {/* Subtle localized AI background inside the form during activation */}
          <AIAmbientBackground intensity="subtle" activeState={true} />

          <div className="w-full relative z-10 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-sm font-mono text-[#00BFA6] tracking-widest uppercase">INITIALIZING BUSINESS INTELLIGENCE</h2>
              {loadingStep >= loadingSteps.length && (
                <div className="text-xl font-bold text-white tracking-wide mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  BUSINESS ENTITY IDENTIFIED<br/>
                  <span className="text-[#A7B2AE] text-base font-normal">ordigit is now investigating...</span>
                </div>
              )}
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              {loadingSteps.map((step, index) => {
                const isActive = index === loadingStep;
                const isCompleted = index < loadingStep;
                const isPending = index > loadingStep;
                
                if (isPending) return null;

                return (
                  <div key={index} className={`flex items-center gap-3 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-50'}`}>
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-[#00E676]" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#39FF88] animate-pulse shadow-[0_0_8px_#39FF88]" />
                      )}
                    </div>
                    <span className={`text-sm tracking-wide ${isActive ? 'text-[#39FF88]' : 'text-[#A7B2AE]'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress indicators bottom */}
            <div className="pt-6 flex items-center justify-center gap-2">
              {loadingSteps.map((_, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono ${idx <= loadingStep ? 'text-[#00BFA6]' : 'text-zinc-700'}`}>0{idx + 1}</span>
                  {idx < loadingSteps.length - 1 && <span className="text-zinc-800">→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${className} relative`} id="audit-form">
      {/* Background Connecting Lines */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden sm:block">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Business to Website line */}
          <path d="M 25% 60 L 75% 60" stroke="rgba(0, 191, 166, 0.2)" strokeWidth="1" fill="none" className={`transition-all duration-700 ${businessName && websiteUrl ? 'stroke-[#00BFA6]/50 shadow-[0_0_8px_#00BFA6]' : ''}`} />
          {/* Business to Location line */}
          <path d="M 25% 60 L 50% 180" stroke="rgba(0, 191, 166, 0.2)" strokeWidth="1" fill="none" className={`transition-all duration-700 ${businessName && location ? 'stroke-[#00BFA6]/50 shadow-[0_0_8px_#00BFA6]' : ''}`} />
          {/* Website to Location line */}
          <path d="M 75% 60 L 50% 180" stroke="rgba(0, 191, 166, 0.2)" strokeWidth="1" fill="none" className={`transition-all duration-700 ${websiteUrl && location ? 'stroke-[#00BFA6]/50 shadow-[0_0_8px_#00BFA6]' : ''}`} />
          {/* Location to Industry line */}
          <path d="M 50% 180 L 50% 280" stroke="rgba(0, 191, 166, 0.2)" strokeWidth="1" fill="none" className={`transition-all duration-700 ${location && industry ? 'stroke-[#00BFA6]/50 shadow-[0_0_8px_#00BFA6]' : ''}`} />
          {/* Industry to Submit line */}
          <path d="M 50% 280 L 50% 360" stroke="rgba(0, 191, 166, 0.2)" strokeWidth="1" fill="none" className={`transition-all duration-700 ${industry && businessName && location ? 'stroke-[#00BFA6]/80 stroke-[1.5px]' : ''}`} />
        </svg>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 flex flex-col items-center w-full">
        
        {error && (
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2 mb-8 backdrop-blur-md">
            <span className="shrink-0 mt-0.5 text-rose-400">⚠</span>
            {error}
          </div>
        )}

        {/* Top Row: Business and Website */}
        <div className="flex flex-col sm:flex-row w-full justify-between gap-8 sm:gap-4 mb-8">
          {/* Business Name Node */}
          <div className="w-full sm:w-[45%] relative group">
            <div className={`absolute -inset-1 rounded-xl bg-gradient-to-r from-[#00BFA6]/20 to-transparent opacity-0 blur transition-opacity duration-500 ${activeField === 'name' ? 'opacity-100' : ''}`} />
            <div className="relative bg-[#020404]/80 backdrop-blur-xl border border-white/10 rounded-xl p-5 sm:p-6 transition-all duration-300 hover:border-[#00BFA6]/40 focus-within:border-[#00BFA6] focus-within:shadow-[0_0_20px_rgba(0,191,166,0.15)]">
              <label htmlFor="businessName" className="flex items-center gap-2 text-[10px] font-mono text-[#A7B2AE] tracking-widest uppercase mb-3">
                <span className={`w-1.5 h-1.5 rounded-full ${businessName ? 'bg-[#39FF88]' : 'bg-white/20'}`} />
                BUSINESS ENTITY
              </label>
              <input
                id="businessName"
                type="text"
                required
                placeholder="e.g. Apex Roofing Co."
                value={businessName}
                onFocus={() => setActiveField('name')}
                onBlur={() => setActiveField(null)}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-transparent border-none text-white text-lg sm:text-xl placeholder:text-zinc-700 focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Website Node */}
          <div className="w-full sm:w-[45%] relative group">
            <div className={`absolute -inset-1 rounded-xl bg-gradient-to-l from-[#00BFA6]/20 to-transparent opacity-0 blur transition-opacity duration-500 ${activeField === 'website' ? 'opacity-100' : ''}`} />
            <div className="relative bg-[#020404]/80 backdrop-blur-xl border border-white/10 rounded-xl p-5 sm:p-6 transition-all duration-300 hover:border-[#00BFA6]/40 focus-within:border-[#00BFA6] focus-within:shadow-[0_0_20px_rgba(0,191,166,0.15)]">
              <label htmlFor="websiteUrl" className="flex items-center gap-2 text-[10px] font-mono text-[#A7B2AE] tracking-widest uppercase mb-3">
                <span className={`w-1.5 h-1.5 rounded-full ${websiteUrl ? 'bg-[#39FF88]' : 'bg-white/20'}`} />
                DIGITAL ADDRESS <span className="opacity-50 lowercase">(optional)</span>
              </label>
              <input
                id="websiteUrl"
                type="text"
                placeholder="e.g. apexroofing.com"
                value={websiteUrl}
                onFocus={() => setActiveField('website')}
                onBlur={() => setActiveField(null)}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full bg-transparent border-none text-white text-lg sm:text-xl placeholder:text-zinc-700 focus:outline-none focus:ring-0"
              />
            </div>
          </div>
        </div>

        {/* Middle Node: Location */}
        <div className="w-full sm:w-[50%] relative group mb-8">
          <div className={`absolute -inset-1 rounded-xl bg-gradient-to-t from-[#00BFA6]/20 to-transparent opacity-0 blur transition-opacity duration-500 ${activeField === 'location' ? 'opacity-100' : ''}`} />
          <div className="relative bg-[#020404]/80 backdrop-blur-xl border border-white/10 rounded-xl p-5 sm:p-6 transition-all duration-300 hover:border-[#00BFA6]/40 focus-within:border-[#00BFA6] focus-within:shadow-[0_0_20px_rgba(0,191,166,0.15)]">
            <label htmlFor="location" className="flex items-center gap-2 text-[10px] font-mono text-[#A7B2AE] tracking-widest uppercase mb-3">
              <span className={`w-1.5 h-1.5 rounded-full ${location ? 'bg-[#39FF88]' : 'bg-white/20'}`} />
              OPERATIONAL ORIGIN
            </label>
            <input
              id="location"
              type="text"
              required
              placeholder="e.g. Austin, Texas"
              value={location}
              onFocus={() => setActiveField('location')}
              onBlur={() => setActiveField(null)}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent border-none text-white text-lg sm:text-xl placeholder:text-zinc-700 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        {/* Lower Node: Industry */}
        <div className="w-full sm:w-[40%] relative group mb-12">
          <div className={`absolute -inset-1 rounded-xl bg-[#00BFA6]/10 opacity-0 blur transition-opacity duration-500 ${activeField === 'industry' ? 'opacity-100' : ''}`} />
          <div className="relative bg-[#020404]/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-5 transition-all duration-300 hover:border-[#00BFA6]/40 focus-within:border-[#00BFA6] focus-within:shadow-[0_0_20px_rgba(0,191,166,0.15)]">
            <label htmlFor="industry" className="flex items-center gap-2 text-[10px] font-mono text-[#A7B2AE] tracking-widest uppercase mb-2">
              <span className={`w-1.5 h-1.5 rounded-full ${industry ? 'bg-[#39FF88]' : 'bg-white/20'}`} />
              CATEGORY
            </label>
            <div className="relative">
              <select
                id="industry"
                value={industry}
                onFocus={() => setActiveField('industry')}
                onBlur={() => setActiveField(null)}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-transparent border-none text-white text-base focus:outline-none focus:ring-0 appearance-none cursor-pointer"
              >
                <option value="Roofing" className="bg-black text-white">Roofing / Construction</option>
                <option value="Real Estate" className="bg-black text-white">Real Estate</option>
                <option value="Technology" className="bg-black text-white">Technology / SaaS</option>
                <option value="Professional Services" className="bg-black text-white">Professional Services</option>
                <option value="Healthcare" className="bg-black text-white">Healthcare / Dental</option>
                <option value="Restaurant" className="bg-black text-white">Restaurant / Hospitality</option>
                <option value="Local Business" className="bg-black text-white">Local Retail & Services</option>
                <option value="Other" className="bg-black text-white">Other Business</option>
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-[#A7B2AE]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Node */}
        <div className="relative z-20 mt-4">
          <div className="absolute inset-0 bg-[#00BFA6] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
          <button
            type="submit"
            className="relative px-8 py-4 bg-white text-black font-semibold tracking-wide rounded-full hover:bg-[#E5FFF8] transition-all duration-300 flex items-center gap-3 group shadow-[0_0_30px_rgba(0,191,166,0.3)] hover:shadow-[0_0_50px_rgba(0,191,166,0.5)] hover:-translate-y-1"
          >
            <span className="text-sm">INVESTIGATE MY BUSINESS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </form>
    </div>
  );
}
