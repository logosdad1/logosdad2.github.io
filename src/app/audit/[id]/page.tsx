"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import TeaserReport from "@/components/TeaserReport";
import FullReportView from "@/components/FullReportView";
import { Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import AIAmbientBackground from "@/components/AIAmbientBackground";

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
        {/* Active Investigation Background */}
        <div className="fixed inset-0 z-[-1]">
          <AIAmbientBackground intensity="full" activeState={true} />
        </div>

        <div className="w-full max-w-2xl mx-auto rounded-2xl border border-[#00BFA6]/20 bg-black/60 backdrop-blur-xl shadow-[0_0_50px_rgba(0,191,166,0.1)] p-10 relative overflow-hidden">
          <div className="text-center relative z-10 mb-10 space-y-4">
            {isTransitioning ? (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="flex items-center justify-center gap-3 text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  <span className="w-3 h-3 rounded-full bg-[#00E676] shadow-[0_0_15px_#00E676]"></span>
                  <span>INVESTIGATION COMPLETE</span>
                </div>
                <p className="text-[#A7B2AE] font-mono text-xs tracking-widest uppercase">EVIDENCE CONNECTED. PREPARING REPORT.</p>
              </div>
            ) : (
              <>
                <h2 className="text-xs font-mono text-[#00BFA6] tracking-widest uppercase animate-pulse">
                  SYSTEM ACTIVE: GATHERING SIGNALS
                </h2>
                <div className="text-2xl sm:text-3xl font-bold text-white tracking-wide uppercase">
                  {businessName}
                </div>
              </>
            )}
          </div>
          
          {!isTransitioning && (
            <div className="flex flex-col gap-y-5 relative z-10 max-w-md mx-auto">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className={`flex items-center gap-4 transition-all duration-500 ${step.done ? 'text-[#00BFA6] opacity-70' : step.active ? 'text-[#39FF88] opacity-100 translate-x-2' : 'text-[#A7B2AE] opacity-40'}`}>
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      {step.done ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : step.active ? (
                        <div className="w-2 h-2 rounded-full bg-[#39FF88] animate-pulse shadow-[0_0_8px_#39FF88]" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#A7B2AE]" />
                      )}
                    </div> 
                    <span className="text-sm tracking-wide font-medium">{step.label}</span>
                  </div>
                  {(step.evidence) && (
                    <div className="pl-8 text-xs font-mono text-[#A7B2AE] mt-1.5 opacity-80 animate-in fade-in slide-in-from-left-1">
                      ↳ {step.evidence}
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
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative min-h-screen">
      <div className="fixed inset-0 z-[-1]">
        <AIAmbientBackground intensity="minimal" />
      </div>

      {audit.isPaid ? (
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
