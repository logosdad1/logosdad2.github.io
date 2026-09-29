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
          // If the very first load is already completed, skip the transition animation
          if (loading && (resData.audit?.status === "COMPLETED" || resData.audit?.status === "FAILED")) {
            setTransitionStage("RESULT");
          }

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

  // Transition state for finishing the investigation
  const [transitionStage, setTransitionStage] = useState<string | null>(null);

  useEffect(() => {
    if (data?.audit?.status === "COMPLETED" && !transitionStage) {
      // Show brief completion state before transitioning
      setTransitionStage("COMPLETE");
      setTimeout(() => setTransitionStage("RESULT"), 2000); // Wait 2 seconds to show "Investigation complete"
    }
  }, [data?.audit?.status]);

  const businessName = data?.audit?.businessName || searchParams.get("name") || "your business";

  if (error || (!data?.audit && !loading)) { 
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full p-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto"/>
          <h2 className="text-lg font-semibold text-white">Report Unavailable</h2>
          <p className="text-xs text-rose-300">{error || "Unable to load audit report."}</p>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 pt-2 font-medium">
            <ArrowLeft className="w-3.5 h-3.5"/><span>Return to Audit Scanner</span>
          </Link>
        </div>
      </div>
    ); 
  }

  // Show specific loading states to avoid flashing the scanner UI
  if (loading) {
    if (isJustUnlocked) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-400"/>
          <div className="space-y-2 text-center">
            <p className="text-sm font-mono text-emerald-400 uppercase tracking-widest font-bold">Unlocking Intelligence</p>
            <p className="text-xs text-zinc-500">Applying your new access level...</p>
          </div>
        </div>
      );
    }
    
    // If they didn't just submit a new scan (no name param), show a plain spinner
    if (!searchParams.has("name")) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400"/>
          <p className="text-xs font-mono text-slate-400">Loading Business Intelligence Report...</p>
        </div>
      );
    }
  }

  // Handle both backend processing and new scan loading with the same UI
  if ((loading && searchParams.has("name")) || (data?.audit && data.audit.status !== "COMPLETED") || (transitionStage && transitionStage !== "RESULT")) {
    const status = data?.audit?.status || 'QUEUED'; // Default to QUEUED if loading
    const isTransitioning = transitionStage === "COMPLETE";
    
    // Determine step status based on backend audit status
    const isDone = (statuses: string[]) => statuses.includes(status) || isTransitioning;
    const isActive = (s: string) => status === s && !isTransitioning;

    const steps = [
      { 
        label: "Identifying the business", 
        done: isDone(['DISCOVERING', 'ANALYZING', 'SCORING', 'PROCESSING']), 
        active: isActive('QUEUED'),
        evidence: isDone(['DISCOVERING', 'ANALYZING', 'SCORING', 'PROCESSING']) ? "Business identity established" : undefined
      },
      { 
        label: "Checking business & website clarity", 
        done: isDone(['ANALYZING', 'SCORING', 'PROCESSING']), 
        active: isActive('DISCOVERING'),
        evidence: isDone(['ANALYZING', 'SCORING', 'PROCESSING']) ? (data?.audit?.url ? "Website detected" : "Analyzing footprint") : undefined
      },
      { 
        label: "Investigating search & local visibility", 
        done: isDone(['ANALYZING', 'SCORING', 'PROCESSING']), 
        active: isActive('DISCOVERING'),
        evidence: isActive('DISCOVERING') ? "Looking for public local business signals..." : undefined
      },
      { 
        label: "Checking public trust signals", 
        done: isDone(['SCORING', 'PROCESSING']), 
        active: isActive('ANALYZING') 
      },
      { 
        label: "Analyzing customer discovery opportunities", 
        done: isDone(['SCORING', 'PROCESSING']), 
        active: isActive('ANALYZING') 
      },
      { 
        label: "Connecting the evidence", 
        done: isDone(['PROCESSING']), 
        active: isActive('SCORING') || isActive('PROCESSING') 
      }
    ];
    
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xl mx-auto bg-[#121212]/90 border border-zinc-800/80 rounded-2xl p-10 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="text-center relative z-10 mb-8 space-y-4">
            {isTransitioning ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-light text-white tracking-tight">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Investigation complete</span>
                </div>
                <p className="text-zinc-400 text-lg">ordigit connected the available evidence.</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
                  <span className="font-bold">ordigit</span> is investigating
                </h2>
                <div className="text-xl sm:text-2xl font-bold text-teal-400 uppercase tracking-wide">
                  {businessName}
                </div>
              </>
            )}
          </div>
          
          {!isTransitioning && (
            <div className="flex flex-col gap-y-5 pt-6 relative z-10 max-w-md mx-auto">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className={`flex items-center gap-3 transition-all duration-300 ${step.done ? 'text-zinc-500' : step.active ? 'text-teal-400 font-medium' : 'text-zinc-600 opacity-50'}`}>
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      {step.done ? (
                        <span className="font-bold">✓</span>
                      ) : step.active ? (
                        <span className="animate-pulse font-bold">→</span>
                      ) : (
                        <span className="font-bold">○</span>
                      )}
                    </div> 
                    <span className="text-base tracking-wide">{step.label}</span>
                  </div>
                  {(step.evidence) && (
                    <div className="pl-8 text-sm text-zinc-500 mt-1">
                      {step.evidence}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const { audit, reportData, tierPrices } = data;
  const currentTier = audit.tier || "SNAPSHOT";

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
          isJustUnlocked={isJustUnlocked}
          unlockedTier={searchParams.get("tier") || currentTier}
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
