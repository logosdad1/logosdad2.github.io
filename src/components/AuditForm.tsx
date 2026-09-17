"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe, Building2, MapPin, Briefcase, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface AuditFormProps {
  defaultIndustry?: string;
  className?: string;
}

const PROGRESS_STEPS = [
  "Connecting to server & verifying SSL certificate...",
  "Parsing HTML structure, meta tags & JSON-LD schemas...",
  "Auditing machine legibility & AI recommendation signals...",
  "Evaluating local citations, trust badges & conversion friction...",
  "Compiling Business Visibility Score & executive report...",
];

export default function AuditForm({ defaultIndustry = "Roofing", className = "" }: AuditFormProps) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState(defaultIndustry);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !location.trim()) {
      setError("Please fill in your Business Name and Location to run an accurate analysis.");
      return;
    }

    setError(null);
    setLoading(true);
    setStepIndex(0);

    // Simulate realistic multi-agent progress steps
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < PROGRESS_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 1800);

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

      clearInterval(interval);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to complete analysis. Please try again.");
      }

      const data = await res.json();
      router.push(`/audit/${data.auditId}`);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`} id="audit-form">
      <div className="rounded-2xl border border-zinc-800 bg-[#121212]/90 p-6 md:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
        {/* Subtle accent border line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />

        {loading ? (
          <div className="py-12 text-center space-y-8">
            <div className="inline-flex p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>

            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Analyzing Your Business
              </h3>
              <p className="text-sm font-mono text-teal-400 animate-pulse transition-all">
                {PROGRESS_STEPS[stepIndex]}
              </p>
            </div>

            {/* Step badges */}
            <div className="grid grid-cols-1 gap-3 max-w-lg mx-auto text-left pt-4">
              {PROGRESS_STEPS.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                    idx < stepIndex
                      ? "text-emerald-400 bg-emerald-950/20 border border-emerald-900/30"
                      : idx === stepIndex
                      ? "text-teal-300 bg-teal-950/40 border border-teal-800/40"
                      : "text-zinc-600 bg-zinc-900/20"
                  }`}
                >
                  {idx < stepIndex ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : idx === stepIndex ? (
                    <Loader2 className="w-4 h-4 shrink-0 animate-spin text-teal-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                  )}
                  <span className="truncate">{step.replace(/\.\.\./, "")}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-zinc-500 pt-2">
              Running multi-agent analysis. This takes approximately 8–12 seconds.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2 mb-6">
              <div className="text-xs font-mono uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Instant Business Scan
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Audit Your Business Visibility
              </h3>
              <p className="text-sm sm:text-base text-zinc-400 max-w-2xl">
                Enter your business details and we&apos;ll show you how easy your business is to find, understand, trust, and choose.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-zinc-400" />
                  Business Name
                </label>
                <input
                  id="businessName"
                  type="text"
                  required
                  placeholder="e.g. Apex Roofing Co."
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 h-[54px] rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/30 transition-all"
                />
              </div>

              {/* Website URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-zinc-400" />
                  Website URL <span className="text-zinc-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. apexroofing.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full px-4 h-[54px] rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/30 transition-all"
                />
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-zinc-400" />
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 h-[54px] rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-sm focus:outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/30 transition-all"
                >
                  <option value="Roofing">Roofing Companies</option>
                  <option value="Construction">Construction Companies</option>
                  <option value="Real Estate">Real Estate Companies</option>
                  <option value="Contractors">General Contractors & Trades</option>
                  <option value="Technology">Technology / SaaS Companies</option>
                  <option value="Professional Services">Professional Services (Legal, Accounting)</option>
                  <option value="Healthcare">Healthcare & Dental Practices</option>
                  <option value="Restaurant">Restaurants & Hospitality</option>
                  <option value="Local Business">Local Retail & Services</option>
                  <option value="Other">Other Business</option>
                </select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  Location / City
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Accra, Ghana or Austin, TX"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 h-[54px] rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/30 transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-[56px] rounded-full bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-zinc-950 text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-all shadow-md group"
              >
                <span>Check My Business Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-center text-xs text-zinc-500 mt-4">
                No credit card required. Free report generated in ~10 seconds.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
