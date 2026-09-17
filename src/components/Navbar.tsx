"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, Shield, User, LogOut, LayoutDashboard, Sliders } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-[#0A0A0A]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:border-teal-400/50 transition-colors">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight text-white">Omnisight</span>
            <span className="text-xs font-mono ml-1.5 px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              AI
            </span>
          </div>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
          <Link href="/#audit-form" className="hover:text-white transition-colors">
            Scan
          </Link>
          <Link href="/#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="/#what-we-analyze" className="hover:text-white transition-colors">
            Intelligence
          </Link>
          <Link href="/#pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Right CTA / Auth */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 border border-zinc-800 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              {currentUser.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-full transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/#audit-form"
                className="text-xs font-medium px-4 py-2 rounded-full bg-teal-500 hover:bg-teal-400 text-zinc-950 transition-all shadow-sm"
              >
                Scan Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
