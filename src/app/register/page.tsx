"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, ArrowRight, Lock, Mail, User, Loader2, CheckCircle2, RotateCw, KeyRound } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const auditId = searchParams.get("auditId");
  const tier = searchParams.get("tier");
  
  const [step, setStep] = useState<"register" | "verify">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Resend cooldown timer
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      if (data.requireEmailVerification) {
        setStep("verify");
        setSuccessMessage(data.message || `We sent a 6-digit verification code to ${email}`);
        setResendCooldown(60);
      } else {
        // Direct entry if verification disabled
        await handlePostAuthRedirect();
      }
    } catch (err: any) {
      setError(err.message || "Registration error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setError("Please enter the 6-digit verification code sent to your email.");
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

      setSuccessMessage("Email verified successfully! Setting up your session...");
      await handlePostAuthRedirect();
    } catch (err: any) {
      setError(err.message || "Verification code invalid or expired");
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

    router.push("/dashboard");
    router.refresh();
  };

  const loginParams = new URLSearchParams();
  if (action) loginParams.set("action", action);
  if (auditId) loginParams.set("auditId", auditId);
  if (tier) loginParams.set("tier", tier);
  const loginUrl = `/login${loginParams.toString() ? `?${loginParams.toString()}` : ""}`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center">
            {step === "verify" ? <KeyRound className="w-5 h-5 text-indigo-400" /> : action === "checkout" ? <Lock className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {step === "verify"
              ? "Verify Your Email"
              : action === "checkout"
              ? (tier ? `Create an Account to Unlock ${tier.charAt(0) + tier.slice(1).toLowerCase()} Intelligence` : "Create an Account to Unlock Intelligence")
              : "Create an Account"}
          </h1>
          <p className="text-xs text-slate-400">
            {step === "verify"
              ? `Enter the 6-digit verification code sent to ${email}`
              : action === "checkout"
              ? "Secure your report and continue to payment."
              : "Powered by InsForge secure auth & real-time Postgres database."}
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

          {step === "register" ? (
            <>
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sarah Connor"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

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
                    placeholder="sarah@agency.com"
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
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (min 6 chars)"
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
                      <span>Sign Up & Send Code</span>
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
                        setError(data.error || "Google sign-up failed");
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

              <div className="text-center text-xs text-slate-400 pt-2">
                Already have an account?{" "}
                <Link href={loginUrl} className="text-indigo-400 hover:underline">
                  Sign in
                </Link>
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
                      onClick={() => setStep("register")}
                      className="text-[11px] text-slate-400 hover:text-indigo-300"
                    >
                      Change email
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
                    Check your spam or promotions folder if you don&apos;t see it immediately.
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
                      <span>Verify Email & Complete Sign In</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Didn&apos;t get the code?</span>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
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
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
