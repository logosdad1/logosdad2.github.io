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
      "DISCOVERING": "Investigating digital footprint (Web, Search, Local, Social)...",
      "ANALYZING": "Running multi-agent intelligence analysis...",
      "SCORING": "Calculating conversion and visibility scores...",
      "PROCESSING": "Finalizing intelligence report..."
    };
    
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#0c111d] border border-slate-800 text-center space-y-6">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Generating Intelligence</h2>
            <p className="text-xs text-slate-400">{statusMessages[audit.status] || "Processing..."}</p>
          </div>
          <div className="flex flex-col text-left space-y-3 pt-6 border-t border-slate-800 text-xs font-mono text-slate-400">
            <div className={`flex items-center gap-2 ${audit.status !== 'QUEUED' ? 'text-emerald-400' : ''}`}>
              <span>{audit.status !== 'QUEUED' ? '✓' : '●'}</span> Business identity resolved
            </div>
            <div className={`flex items-center gap-2 ${['ANALYZING', 'SCORING', 'PROCESSING'].includes(audit.status) ? 'text-emerald-400' : ''}`}>
              <span>{['ANALYZING', 'SCORING', 'PROCESSING'].includes(audit.status) ? '✓' : '●'}</span> Digital discovery complete
            </div>
            <div className={`flex items-center gap-2 ${['SCORING', 'PROCESSING'].includes(audit.status) ? 'text-emerald-400' : ''}`}>
              <span>{['SCORING', 'PROCESSING'].includes(audit.status) ? '✓' : '●'}</span> Evidence analysis complete
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
