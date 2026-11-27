"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, ArrowRight, Lock, Mail, Loader2, CheckCircle2, RotateCw, KeyRound } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const action = searchParams.get("action");
  const auditId = searchParams.get("auditId");
  const tier = searchParams.get("tier");

  const [step, setStep] = useState<"login" | "verify">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requireEmailVerification) {
          setStep("verify");
          setError(data.error || "Email not verified yet. Please enter the 6-digit code sent to your inbox.");
          setResendCooldown(60);
          return;
        }
        throw new Error(data.error || "Login failed");
      }

      await handlePostAuthRedirect();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setSuccessMessage("Email verified successfully! Signing you in...");
      await handlePostAuthRedirect();
    } catch (err: any) {
      setError(err.message || "Invalid or expired verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || !email) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend code");

      setSuccessMessage("A fresh verification code was sent to your email!");
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || "Unable to resend verification code");
    } finally {
      setLoading(false);
    }
  };

  const handlePostAuthRedirect = async () => {
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
          {step === "verify" ? <KeyRound className="w-5 h-5 text-indigo-400" /> : action === "checkout" ? <Lock className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {step === "verify"
            ? "Verify Your Email"
            : action === "checkout"
            ? (tier ? `Sign In to Unlock ${tier.charAt(0) + tier.slice(1).toLowerCase()} Intelligence` : "Sign In to Unlock Intelligence")
            : "Sign In to Omnisight"}
        </h1>
        <p className="text-xs text-slate-400">
          {step === "verify"
            ? `Enter the 6-digit code sent to ${email}`
            : action === "checkout"
            ? "Authenticate to secure your report and continue to payment."
            : "Access your saved business reports and visibility benchmarks."}
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-[#0c111d] border border-slate-800 shadow-xl space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {step === "login" ? (
          <>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Password
                  </span>
                  <Link href="/forgot-password" className="text-[11px] text-indigo-400 hover:underline">
                    Forgot password?
                  </Link>
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
                      await handlePostAuthRedirect();
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

            {process.env.NODE_ENV === "development" && (
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="text-indigo-300 font-medium">Development Quick Admin:</div>
                <div>Email: <code className="text-white font-mono">admin@ordigit.com</code></div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!email) {
                    setError("Please enter your email above first.");
                    return;
                  }
                  setStep("verify");
                  setError(null);
                }}
                className="text-slate-400 hover:text-indigo-300"
              >
                Verify with code
              </button>
              <div>
                Don&apos;t have an account?{" "}
                <Link href={registerUrl} className="text-indigo-400 hover:underline font-medium">
                  Sign up
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-5">
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                    6-Digit Security Code
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep("login")}
                    className="text-[11px] text-slate-400 hover:text-indigo-300"
                  >
                    Back to login
                  </button>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  autoFocus
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.5em] text-lg font-mono py-3 rounded-lg bg-slate-900 border border-indigo-500/50 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-400"
                />
                <p className="text-[11px] text-slate-500 text-center">
                  Verification code sent to {email || "your email address"}.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || verificationCode.length < 6}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Verify Code & Sign In</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Didn&apos;t get the code?</span>
              <button
                type="button"
                disabled={resendCooldown > 0 || loading || !email}
                onClick={handleResendCode}
                className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-50 disabled:hover:text-indigo-400"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </button>
            </div>
          </div>
        )}
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
