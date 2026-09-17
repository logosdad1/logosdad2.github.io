"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  FileCheck2,
  DollarSign,
  TrendingUp,
  Sliders,
  Sparkles,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  Mail,
  Phone,
  Building,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [configData, setConfigData] = useState<any>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for config
  const [tierPrices, setTierPrices] = useState({ essential: 10, growth: 25, authority: 50 });
  const [weights, setWeights] = useState({
    websiteClarity: 20,
    aiVisibility: 20,
    searchLocal: 15,
    contentAuthority: 15,
    trustCredibility: 15,
    conversionReadiness: 15,
  });
  const [aiProvider, setAiProvider] = useState<string>("gemini");
  const [allowMockCheckout, setAllowMockCheckout] = useState<boolean>(true);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, configRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/config"),
      ]);

      if (statsRes.status === 403 || statsRes.status === 401) {
        window.location.href = "/login?redirect=/admin";
        return;
      }

      if (!statsRes.ok || !configRes.ok) {
        throw new Error("Failed to load admin telemetry");
      }

      const stats = await statsRes.json();
      const config = await configRes.json();

      setStatsData(stats);
      setConfigData(config.settings);
      setTierPrices(config.settings.tierPrices || { essential: 10, growth: 25, authority: 50 });
      setWeights(config.settings.scoreWeights);
      setAiProvider(config.settings.aiProvider);
      setAllowMockCheckout(config.settings.allowMockCheckout);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierPrices,
          scoreWeights: weights,
          aiProvider,
          allowMockCheckout,
        }),
      });

      if (!res.ok) throw new Error("Failed to update configuration");

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save configuration");
    } finally {
      setSavingConfig(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-xs font-mono text-slate-400">Loading Admin Control Center...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-20 p-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-base font-semibold text-white">Admin Access Required</h3>
        <p className="text-xs text-rose-300">{error}</p>
        <Link
          href="/login"
          className="inline-block py-2 px-4 rounded-lg bg-indigo-600 text-white text-xs font-medium"
        >
          Sign in as Admin
        </Link>
      </div>
    );
  }

  const { stats, recentAudits, leads } = statsData;

  const totalWeight = Object.values(weights).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-indigo-400">
            System Operations &amp; Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Admin Dashboard
          </h1>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-[#0c111d] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Audits Performed</span>
            <FileCheck2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalAudits}</div>
          <div className="text-[11px] font-mono text-slate-500">
            {stats.freeAudits} Free • {stats.paidAudits} Paid
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c111d] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">${stats.totalRevenue.toFixed(2)}</div>
          <div className="text-[11px] font-mono text-slate-500">Stripe &amp; Direct Unlocks</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c111d] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Free → Paid Conversion</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.conversionRate}%</div>
          <div className="text-[11px] font-mono text-slate-500">Target Benchmark: &gt;5.0%</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c111d] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Estimated AI Costs</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">${stats.estimatedApiCost}</div>
          <div className="text-[11px] font-mono text-emerald-400">&gt;98% Gross Margins</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c111d] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Tier Breakdown</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-[11px] font-mono text-slate-300 space-y-1 mt-1">
            <div className="flex justify-between"><span>Snapshot:</span> <span>{stats.tierCounts?.SNAPSHOT || 0}</span></div>
            <div className="flex justify-between text-indigo-300"><span>Essential:</span> <span>{stats.tierCounts?.ESSENTIAL || 0}</span></div>
            <div className="flex justify-between text-emerald-300"><span>Growth:</span> <span>{stats.tierCounts?.GROWTH || 0}</span></div>
            <div className="flex justify-between text-amber-300"><span>Authority:</span> <span>{stats.tierCounts?.AUTHORITY || 0}</span></div>
          </div>
        </div>
      </div>

      {/* DYNAMIC CONFIGURATION CONTROLS */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c111d] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Dynamic Price &amp; Scoring Configuration
            </h2>
            <p className="text-xs text-slate-400">
              A/B test pricing without code deployments. Calibrate score weights in real-time.
            </p>
          </div>
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved successfully</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tier Price Settings */}
            <div className="space-y-3 col-span-1 md:col-span-1">
              <label className="text-xs font-medium text-slate-300 block">
                Tier Pricing ($USD)
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400 font-mono w-20">Essential:</span>
                  <input type="number" min="1" max="999" value={tierPrices.essential}
                    onChange={(e) => setTierPrices({ ...tierPrices, essential: parseInt(e.target.value) || 0 })}
                    className="w-20 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-indigo-300 font-mono w-20">Growth:</span>
                  <input type="number" min="1" max="999" value={tierPrices.growth}
                    onChange={(e) => setTierPrices({ ...tierPrices, growth: parseInt(e.target.value) || 0 })}
                    className="w-20 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-emerald-300 font-mono w-20">Authority:</span>
                  <input type="number" min="1" max="999" value={tierPrices.authority}
                    onChange={(e) => setTierPrices({ ...tierPrices, authority: parseInt(e.target.value) || 0 })}
                    className="w-20 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Instantly updates checkout links. Upgrades only charge the difference.
              </p>
            </div>

            {/* AI Provider */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 block">
                Active AI Architecture Engine
              </label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="gemini">Google Gemini 1.5/2.0 Flash (Fast, Low Cost)</option>
                <option value="openai">OpenAI GPT-4o-mini</option>
                <option value="heuristic">Heuristic Rules Only (Zero API Cost)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Fallback gracefully triggers deterministic checks if keys are unset.
              </p>
            </div>

            {/* Mock Checkout Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 block">
                Developer Test Unlock Mode
              </label>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="mockCheckout"
                  checked={allowMockCheckout}
                  onChange={(e) => setAllowMockCheckout(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="mockCheckout" className="text-xs text-slate-300 cursor-pointer">
                  Enable 1-Click Test Unlock (Bypasses Stripe for testing)
                </label>
              </div>
              <p className="text-[11px] text-slate-500">
                Allows testing complete paid reports without a live bank card.
              </p>
            </div>
          </div>

          {/* Score Category Weight Sliders */}
          <div className="space-y-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-white">
                Category Score Weightings
              </div>
              <div
                className={`text-xs font-mono font-medium ${
                  totalWeight === 100 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                Total Weight: {totalWeight}% {totalWeight !== 100 && "(Must sum to 100%)"}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: "websiteClarity", label: "Website Clarity" },
                { key: "aiVisibility", label: "AI Visibility" },
                { key: "searchLocal", label: "Search / Local Presence" },
                { key: "contentAuthority", label: "Content & Authority" },
                { key: "trustCredibility", label: "Trust & Credibility" },
                { key: "conversionReadiness", label: "Conversion Readiness" },
              ].map((c) => (
                <div key={c.key} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>{c.label}</span>
                    <span className="font-mono text-indigo-400">{(weights as any)[c.key]}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="5"
                    value={(weights as any)[c.key]}
                    onChange={(e) =>
                      setWeights({ ...weights, [c.key]: parseInt(e.target.value) })
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={savingConfig || totalWeight !== 100}
            className="py-2.5 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingConfig ? "Saving..." : "Save Settings"}</span>
          </button>
        </form>
      </div>

      {/* RECENT AUDITS & AGENCY LEADS CRM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audits Table */}
        <div className="p-6 rounded-2xl bg-[#0c111d] border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white">Recent Audits</h3>
          <div className="divide-y divide-slate-800 text-xs overflow-x-auto">
            {recentAudits.slice(0, 8).map((a: any) => (
              <div key={a.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="truncate">
                  <div className="font-medium text-white truncate">{a.businessName}</div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">{a.url}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-slate-300">{a.overallScore}/100</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      a.isPaid ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {a.isPaid ? "PAID" : "FREE"}
                  </span>
                  <Link
                    href={`/audit/${a.id}`}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agency Lead CRM ("Want Us To Fix It?") */}
        <div className="p-6 rounded-2xl bg-[#0c111d] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              Agency Leads (&quot;Want Us To Fix It?&quot;)
            </h3>
            <span className="text-[11px] font-mono text-indigo-400">
              {leads.length} Inquiries
            </span>
          </div>

          {leads.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              No high-ticket inquiries submitted yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-800 text-xs overflow-y-auto max-h-80">
              {leads.map((l: any) => (
                <div key={l.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between text-white font-medium">
                    <span>{l.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                      {l.service}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      {l.email}
                    </span>
                    {l.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {l.phone}
                      </span>
                    )}
                  </div>
                  {l.message && (
                    <p className="text-slate-300 text-[11px] italic bg-slate-900/50 p-2 rounded border border-slate-800/60 mt-1">
                      &ldquo;{l.message}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
