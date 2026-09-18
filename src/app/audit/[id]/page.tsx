"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import TeaserReport from "@/components/TeaserReport";
import FullReportView from "@/components/FullReportView";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function AuditDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const isJustUnlocked = searchParams.get("unlocked") === "true";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let isSubscribed = true;
    let pollInterval: NodeJS.Timeout;

    const fetchAudit = async () => {
      try {
        const res = await fetch(`/api/audit/${id}`, { cache: 'no-store' });
        if (!res.ok) throw new Error("Audit report not found");
        const resData = await res.json();
        
        if (isSubscribed) {
          setData(resData);
          setLoading(false);
          
          if (resData.audit?.status === "COMPLETED" || resData.audit?.status === "FAILED") {
            clearInterval(pollInterval);
          }
        }
      } catch (err: any) {
        if (isSubscribed) {
          setError(err.message);
          setLoading(false);
          clearInterval(pollInterval);
        }
      }
    };

    fetchAudit(); // Initial fetch
    
    // Poll every 3 seconds if not completed
    pollInterval = setInterval(fetchAudit, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
    };
  }, [id, isJustUnlocked]);

  if (loading) { 
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400"/>
        <p className="text-xs font-mono text-slate-400">Loading Business Intelligence Report...</p>
      </div>
    ); 
  }
  
  if (error || !data?.audit) { 
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full p-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto"/>
          <h2 className="text-lg font-semibold text-white">Report Unavailable</h2>
          <p className="text-xs text-rose-300">{error || "Unable to load audit report."}</p>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 pt-2 font-medium">
            <ArrowLeft className="w-3.5 h-3.5"/><span>Return to Audit Scanner</span>
          </Link>
        </div>
      </div>
    ); 
  }

  const { audit, reportData, tierPrices } = data;
  const currentTier = audit.tier || "SNAPSHOT";

  // Phase 3 Asynchronous Progress UI
  if (audit.status !== "COMPLETED" && audit.status !== "FAILED") {
    const statusMessages: Record<string, string> = {
      "QUEUED": "In Queue...",
      "DISCOVERING": "Discovering your digital footprint...",
      "ANALYZING": "Running multi-agent intelligence analysis...",
      "SCORING": "Calculating visibility and intent metrics...",
      "PROCESSING": "Finalizing ordigit report..."
    };
    
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xl mx-auto bg-[#121212]/90 border border-zinc-800/80 rounded-2xl p-10 shadow-2xl backdrop-blur-sm text-center relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
             <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500 rounded-full blur-[100px] animate-pulse" />
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500 rounded-full blur-[100px] animate-pulse delay-700" />
          </div>

          <Loader2 className="w-12 h-12 text-teal-400 animate-spin mx-auto mb-6 relative z-10" />
          
          <div className="space-y-3 relative z-10 mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">INVESTIGATING YOUR BUSINESS</h2>
            <p className="text-sm font-mono text-teal-400">{statusMessages[audit.status] || "Connecting digital evidence..."}</p>
          </div>
          
          <div className="flex flex-col text-left space-y-4 pt-8 border-t border-zinc-800 relative z-10">
            <div className={`flex items-center gap-3 transition-all ${audit.status !== 'QUEUED' ? 'text-emerald-400' : 'text-zinc-600'}`}>
              <div className="w-5 h-5 flex items-center justify-center shrink-0">{audit.status !== 'QUEUED' ? '✓' : '○'}</div> 
              <span className="text-sm font-semibold tracking-wide">Business identity resolved</span>
            </div>
            <div className={`flex items-center gap-3 transition-all ${['ANALYZING', 'SCORING', 'PROCESSING'].includes(audit.status) ? 'text-emerald-400' : 'text-zinc-600'}`}>
              <div className="w-5 h-5 flex items-center justify-center shrink-0">{['ANALYZING', 'SCORING', 'PROCESSING'].includes(audit.status) ? '✓' : '○'}</div> 
              <span className="text-sm font-semibold tracking-wide">Digital evidence investigated</span>
            </div>
            <div className={`flex items-center gap-3 transition-all ${['SCORING', 'PROCESSING'].includes(audit.status) ? 'text-emerald-400' : 'text-zinc-600'}`}>
              <div className="w-5 h-5 flex items-center justify-center shrink-0">{['SCORING', 'PROCESSING'].includes(audit.status) ? '✓' : '○'}</div> 
              <span className="text-sm font-semibold tracking-wide">Customer intent understood</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (audit.status === "FAILED") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full p-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto"/>
          <h2 className="text-lg font-semibold text-white">Intelligence Engine Failed</h2>
          <p className="text-xs text-rose-300">We encountered an error while mapping your digital ecosystem. Please try running a new scan.</p>
          <Link href="/" className="inline-block py-2 px-4 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs mt-2">Try Again</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {audit.isPaid || isJustUnlocked ? (
        <FullReportView
          auditId={audit.id}
          businessName={audit.businessName}
          url={audit.url}
          industry={audit.industry}
          location={audit.location}
          overallScore={audit.overallScore}
          reportData={reportData}
          tier={currentTier}
          tierPrices={tierPrices}
        />
      ) : (
        <TeaserReport
          auditId={audit.id}
          businessName={audit.businessName}
          url={audit.url}
          industry={audit.industry}
          location={audit.location}
          overallScore={audit.overallScore}
          reportData={reportData}
          tierPrices={tierPrices}
        />
      )}
    </div>
  );
}

export default function AuditDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4"><Loader2 className="w-8 h-8 animate-spin text-indigo-400"/><p className="text-xs font-mono text-slate-400">Loading Business Intelligence Report...</p></div>}>
      <AuditDetailContent />
    </Suspense>
  );
}
