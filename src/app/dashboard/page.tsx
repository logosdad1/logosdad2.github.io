"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ScoreGauge from "@/components/ScoreGauge";
import {
  Building2,
  Calendar,
  TrendingUp,
  ArrowRight,
  Plus,
  Loader2,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/audits")
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = "/login?redirect=/dashboard";
            return null;
          }
          throw new Error("Failed to load businesses");
        }
        return res.json();
      })
      .then((data) => {
        if (data?.businesses) setBusinesses(data.businesses);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-xs font-mono text-slate-400">Loading Account Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            My Businesses
          </h1>
          <p className="text-xs text-slate-400">
            Monitor digital visibility, score changes over time, and unlocked executive reports.
          </p>
        </div>

        <Link
          href="/#audit-form"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Scan New Business</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Business Cards Grid */}
      {businesses.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl border border-dashed border-slate-800 bg-[#0c111d]/50 space-y-4">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">No businesses tracked yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Run a free visibility audit on any website to automatically save and track it here.
            </p>
          </div>
          <Link
            href="/#audit-form"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium"
          >
            <span>Run First Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businesses.map((biz) => (
            <div
              key={biz.id}
              className="p-6 rounded-2xl border border-slate-800 bg-[#0c111d] hover:border-slate-700/80 transition-all space-y-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-400">
                      {biz.industry}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">{biz.location}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{biz.name}</h3>
                  <a
                    href={biz.websiteUrl.startsWith("http") ? biz.websiteUrl : `https://${biz.websiteUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-400 font-mono hover:text-indigo-300 flex items-center gap-1 truncate max-w-xs"
                  >
                    <span>{biz.websiteUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                {biz.latestScore !== null && (
                  <div className="shrink-0 flex flex-col items-center">
                    <ScoreGauge score={biz.latestScore} size={85} strokeWidth={8} showLabel={false} />
                  </div>
                )}
              </div>

              {/* Metrics bar */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Last Audit</span>
                  <span className="text-slate-300 font-medium">
                    {biz.lastAuditDate ? new Date(biz.lastAuditDate).toLocaleDateString() : "Never"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Score Change</span>
                  <span
                    className={`font-mono font-medium ${
                      biz.scoreChange > 0
                        ? "text-emerald-400"
                        : biz.scoreChange < 0
                        ? "text-rose-400"
                        : "text-slate-400"
                    }`}
                  >
                    {biz.scoreChange > 0 ? `+${biz.scoreChange}` : biz.scoreChange} pts
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                    biz.isPaid
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}
                >
                  {biz.isPaid ? "Full Report Unlocked" : "Free Assessment"}
                </span>

                {biz.latestAuditId && (
                  <Link
                    href={`/audit/${biz.latestAuditId}`}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                  >
                    <span>View Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
