"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Building2, MapPin, Briefcase, Sparkles, Activity } from "lucide-react";

interface AuditFormProps {
  defaultIndustry?: string;
  className?: string;
}

export default function AuditForm({ defaultIndustry = "Roofing", className = "" }: AuditFormProps) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState(defaultIndustry);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !location.trim()) {
      setError("Please fill in your Business Name and Location to run an accurate analysis.");
      return;
    }

    setError(null);
    setLoading(true);

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
      
      fetch("/api/audit/worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId: data.auditId })
      }).catch(console.error);

      router.push(`/audit/${data.auditId}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-5xl mx-auto ${className}`} id="audit-form">
      <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
        {/* Animated gradient border effect (pseudo-border) */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />

        {loading ? (
          <div className="py-24 px-6 relative z-10 flex flex-col items-center justify-center">
            {/* Visual Metaphor: Signals converging */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-teal-500 rounded-full blur-[80px] animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-emerald-500 rounded-full blur-[80px] animate-pulse delay-700" />
            </div>

            <div className="text-center space-y-6">
              <Activity className="w-12 h-12 text-teal-400 animate-pulse mx-auto" />
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono tracking-widest text-teal-300 bg-teal-500/10 border border-teal-500/30">
                <Sparkles className="w-4 h-4" />
                <span>INITIATING ORDIGIT INVESTIGATION</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row relative z-10">
            {/* Left Column: Value Prop / Engine Look */}
            <div className="md:w-5/12 p-8 md:p-12 bg-zinc-900/40 border-b md:border-b-0 md:border-r border-zinc-800/80 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-teal-500/10 blur-[60px] rounded-full pointer-events-none" />
              
              <div className="space-y-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest text-teal-400 font-semibold bg-teal-500/10 border border-teal-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  Instant Business Scan
                </div>
                
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-[1.1]">
                  Investigate Your Business Visibility
                </h3>
                
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-medium">
                  Enter your business details and we'll investigate the digital signals that help customers find, understand, trust, and choose your business.
                </p>
              </div>

              <div className="pt-10 relative z-10">
                <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-mono font-semibold text-zinc-500 tracking-widest uppercase">
                  <span>Website</span> <span className="text-zinc-700">•</span>
                  <span>Search</span> <span className="text-zinc-700">•</span>
                  <span>Local</span> <span className="text-zinc-700">•</span>
                  <span>Social</span> <span className="text-zinc-700">•</span>
                  <span>Trust</span> <span className="text-zinc-700">•</span>
                  <span>Content</span>
                </div>
              </div>
            </div>

            {/* Right Column: The Input Form */}
            <div className="md:w-7/12 p-8 md:p-12 relative bg-[#0a0a0a]/50">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm mb-4 flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 text-rose-400">⚠</span>
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Business Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="businessName" className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Business Name</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Building2 className="w-5 h-5 text-zinc-500 group-focus-within/input:text-teal-400 transition-colors" />
                      </div>
                      <input
                        id="businessName"
                        type="text"
                        required
                        placeholder="e.g. Apex Roofing Co."
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full pl-12 pr-4 h-14 rounded-xl bg-[#121212] border border-zinc-800 text-white text-base placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 transition-all hover:border-zinc-700 shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Website URL */}
                  <div className="space-y-1.5">
                    <label htmlFor="websiteUrl" className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Website URL <span className="text-zinc-600 font-normal">(Optional)</span></label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Globe className="w-5 h-5 text-zinc-500 group-focus-within/input:text-teal-400 transition-colors" />
                      </div>
                      <input
                        id="websiteUrl"
                        type="text"
                        placeholder="e.g. apexroofing.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="w-full pl-12 pr-4 h-14 rounded-xl bg-[#121212] border border-zinc-800 text-white text-base placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 transition-all hover:border-zinc-700 shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Industry */}
                  <div className="space-y-1.5">
                    <label htmlFor="industry" className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Industry</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Briefcase className="w-5 h-5 text-zinc-500 group-focus-within/input:text-teal-400 transition-colors" />
                      </div>
                      <select
                        id="industry"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full pl-12 pr-10 h-14 rounded-xl bg-[#121212] border border-zinc-800 text-white text-base focus:outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 transition-all hover:border-zinc-700 appearance-none shadow-inner cursor-pointer"
                      >
                        <option value="Roofing">Roofing Companies</option>
                        <option value="Construction">Construction Companies</option>
                        <option value="Real Estate">Real Estate Companies</option>
                        <option value="Contractors">General Contractors & Trades</option>
                        <option value="Technology">Technology / SaaS Companies</option>
                        <option value="Professional Services">Professional Services</option>
                        <option value="Healthcare">Healthcare & Dental Practices</option>
                        <option value="Restaurant">Restaurants & Hospitality</option>
                        <option value="Local Business">Local Retail & Services</option>
                        <option value="Other">Other Business</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label htmlFor="location" className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Location</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="w-5 h-5 text-zinc-500 group-focus-within/input:text-teal-400 transition-colors" />
                      </div>
                      <input
                        id="location"
                        type="text"
                        required
                        placeholder="e.g. Austin, TX"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-12 pr-4 h-14 rounded-xl bg-[#121212] border border-zinc-800 text-white text-base placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 transition-all hover:border-zinc-700 shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 rounded-2xl bg-teal-500 hover:bg-teal-400 active:bg-teal-600 disabled:opacity-70 disabled:cursor-not-allowed text-teal-950 text-lg font-extrabold flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:shadow-[0_0_40px_rgba(20,184,166,0.5)] group/btn relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                    <span className="relative z-10 tracking-tight">CHECK MY BUSINESS FREE</span>
                    <ArrowRight className="w-6 h-6 relative z-10 group-hover/btn:translate-x-1.5 transition-transform" />
                  </button>

                  <div className="text-center mt-5">
                    <p className="text-sm text-zinc-400">
                      No credit card required. Start with a free business visibility snapshot.
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
