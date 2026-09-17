"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"loading" | "processing" | "completed" | "error">("loading");
  const [auditId, setAuditId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    // Poll the server to check if the webhook has marked the audit as processing/completed
    let interval: NodeJS.Timeout;
    
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/checkout/status?session_id=${sessionId}`);
        if (!res.ok) throw new Error("Payment status check failed");
        
        const data = await res.json();
        
        if (data.status === "COMPLETED") {
          setAuditId(data.auditId);
          setStatus("completed");
          clearInterval(interval);
        } else if (data.status === "PROCESSING") {
          setStatus("processing");
          // Continue polling
        } else if (data.status === "FAILED") {
          setStatus("error");
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkStatus(); // Initial check
    interval = setInterval(checkStatus, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-2xl bg-[#0c111d] border border-slate-800 text-center space-y-6">
        
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
            <h2 className="text-xl font-semibold text-white">Verifying Secure Payment...</h2>
            <p className="text-xs text-slate-400">Please do not close this window.</p>
          </div>
        )}

        {status === "processing" && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-white uppercase tracking-wider">Payment Received</h2>
            <p className="text-sm text-slate-300">Your intelligence report is being prepared.</p>
            
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 mt-6">
              <div className="flex items-center gap-3 justify-center text-xs text-indigo-400 font-mono">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ANALYZING YOUR BUSINESS...</span>
              </div>
              <p className="text-[11px] text-slate-500">This usually takes 15-30 seconds. The page will update automatically.</p>
            </div>
          </div>
        )}

        {status === "completed" && (
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white uppercase tracking-wider">Intelligence Ready</h2>
              <p className="text-sm text-slate-300">Your deep business visibility report has been successfully generated.</p>
            </div>
            
            <Link 
              href={`/audit/${auditId}`}
              className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <span>View My Report</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-rose-400">Payment Verification Failed</h2>
            <p className="text-sm text-slate-300">We could not confirm this payment session. If you believe this is an error, please check your dashboard or contact support.</p>
            <Link 
              href="/dashboard"
              className="inline-block py-2 px-4 rounded-lg bg-slate-800 text-white text-xs font-semibold mt-4"
            >
              Return to Dashboard
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
