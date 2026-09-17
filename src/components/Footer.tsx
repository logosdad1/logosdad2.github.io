import Link from "next/link";
import { Eye } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070a12] text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/60">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>Omnisight AI</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              AI-powered Business Visibility Intelligence. Understand how customers, search systems and AI-powered discovery may interpret your business — and know what to improve next.
            </p>
          </div>

          <div>
            <div className="font-semibold text-slate-200 mb-3">Industries</div>
            <ul className="space-y-2">
              <li>
                <Link href="/services/roofing" className="hover:text-slate-200 transition-colors">
                  Roofing Contractors
                </Link>
              </li>
              <li>
                <Link href="/services/real-estate" className="hover:text-slate-200 transition-colors">
                  Real Estate Agencies
                </Link>
              </li>
              <li>
                <Link href="/services/saas" className="hover:text-slate-200 transition-colors">
                  B2B SaaS & Tech
                </Link>
              </li>
              <li>
                <Link href="/services/construction" className="hover:text-slate-200 transition-colors">
                  Construction Companies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-slate-200 mb-3">Platform</div>
            <ul className="space-y-2">
              <li>
                <Link href="/#audit-form" className="hover:text-slate-200 transition-colors">
                  Scan Your Business
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-slate-200 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#what-we-analyze" className="hover:text-slate-200 transition-colors">
                  Intelligence Overview
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-slate-200 transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-slate-200 mb-3">Ethics & Transparency</div>
            <p className="text-slate-400 text-xs leading-relaxed mb-2">
              We evaluate deterministic public signals and machine readability. We never fabricate scores or claim impossible secret access to private LLM weights.
            </p>
            <div className="text-slate-300 font-mono text-[11px]">
              Reliable • Evidence-Based • Actionable
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
          <div>© {new Date().getFullYear()} Omnisight AI. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="/#audit-form" className="hover:text-slate-200">
              Run Audit
            </Link>
            <Link href="/dashboard" className="hover:text-slate-200">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
