"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, ArrowRight, Lock, Mail, Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const action = searchParams.get("action");
  const auditId = searchParams.get("auditId");
  const tier = searchParams.get("tier");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // Handle checkout intent
      if (action === "checkout" && auditId && tier) {
        const checkoutRes = await fetch("/api/checkout/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auditId, tier }),
        });
        const checkoutData = await checkoutRes.json();
        if (checkoutData.checkoutUrl) {
          window.location.href = checkoutData.checkoutUrl;
          return;
        }
      }

      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
      setLoading(false);
    }
  };

  const registerParams = new URLSearchParams();
  if (action) registerParams.set("action", action);
  if (auditId) registerParams.set("auditId", auditId);
  if (tier) registerParams.set("tier", tier);
  const registerUrl = `/register${registerParams.toString() ? `?${registerParams.toString()}` : ""}`;

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center">
          {action === "checkout" ? <Lock className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {action === "checkout" ? (tier ? `Sign In to Unlock ${tier.charAt(0) + tier.slice(1).toLowerCase()} Intelligence` : "Sign In to Unlock Intelligence") : "Sign In to ordigit"}
        </h1>
        <p className="text-xs text-slate-400">
          {action === "checkout" ? "Authenticate to secure your report and continue to payment." : "Access your saved business reports and visibility benchmarks."}
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-[#0c111d] border border-slate-800 shadow-xl space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ordigit.com or your email"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{action === "checkout" ? "Sign In & Continue" : "Sign In"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-mono">
            <span className="bg-[#0c111d] px-2 text-slate-500">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              setLoading(true);
              try {
                const res = await fetch("/api/auth/google", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ credential: credentialResponse.credential })
                });
                const data = await res.json();
                if (data.success) {
                  if (action === "checkout" && auditId && tier) {
                    const checkoutRes = await fetch("/api/checkout/session", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ auditId, tier }),
                    });
                    const checkoutData = await checkoutRes.json();
                    if (checkoutData.checkoutUrl) {
                      window.location.href = checkoutData.checkoutUrl;
                      return;
                    }
                  }
                  router.push(redirectUrl);
                  router.refresh();
                } else {
                  setError(data.error || "Google login failed");
                  setLoading(false);
                }
              } catch(err) {
                setError("Google Login failed");
                setLoading(false);
              }
            }}
            onError={() => {
              setError("Google Login failed");
            }}
            useOneTap
            shape="rectangular"
            theme="filled_black"
          />
        </div>

        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <div className="text-indigo-300 font-medium">Default Admin Credentials:</div>
          <div>Email: <code className="text-white font-mono">admin@ordigit.com</code></div>
          <div>Password: <code className="text-white font-mono">AdminPassword2026!</code></div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2">
          Don&apos;t have an account?{" "}
          <Link href={registerUrl} className="text-indigo-400 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs font-mono text-slate-400">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
