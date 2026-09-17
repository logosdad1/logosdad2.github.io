"use client";
import { useState } from "react";
import ScoreGauge from "./ScoreGauge";
import { AuditReportDataPayload, IntelligenceTier } from "@/lib/types";
import { Printer,Copy,Check,ShieldCheck,Zap,Layers,Search,Users,TrendingUp,AlertCircle,CheckCircle2,Send,Sparkles,ArrowRight,Lock,Target,Calendar,BarChart2,Map } from "lucide-react";

interface FullReportViewProps { auditId:string; businessName:string; url:string; industry:string; location:string; overallScore:number; reportData:AuditReportDataPayload; tier?:IntelligenceTier; tierPrices?:{essential:number;growth:number;authority:number}; }

export default function FullReportView({ auditId,businessName,url,industry,location,overallScore,reportData, tier="ESSENTIAL", tierPrices }: FullReportViewProps) {
  const tp = tierPrices || {essential:10,growth:25,authority:50};
  const [activeTab,setActiveTab]=useState<string>("executive");
  const [planFilter,setPlanFilter]=useState<"ALL"|"FIX_NOW"|"FIX_NEXT"|"OPTIMIZE_LATER">("ALL");
  const [copiedSchema,setCopiedSchema]=useState(false);
  const [leadForm,setLeadForm]=useState({name:"",email:"",phone:"",service:"AI visibility optimization",message:""});
  const [leadSubmitted,setLeadSubmitted]=useState(false);
  const [leadLoading,setLeadLoading]=useState(false);
  const [upgrading,setUpgrading]=useState(false);
  const {executiveSummary,categories,aiReadinessDetails,actionPlan,competitorComparison,generatedSchema,customerIntentAnalysis,thirtyDayPlan,queryCoverageAnalysis,strategicRoadmap}=reportData;
  const isGrowth=tier==="GROWTH"||tier==="AUTHORITY";
  const isAuthority=tier==="AUTHORITY";
  const handleCopySchema=()=>{navigator.clipboard.writeText(generatedSchema.codeSnippet);setCopiedSchema(true);setTimeout(()=>setCopiedSchema(false),2500);};
  const handlePrint=()=>window.print();
  const handleUpgrade=(targetTier:IntelligenceTier)=>{setUpgrading(true);fetch("/api/checkout/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({auditId,tier:targetTier})}).then(r=>r.json()).then(d=>{if(d.checkoutUrl)window.location.href=d.checkoutUrl;else{alert("Checkout error.");setUpgrading(false);}}).catch(()=>{alert("Error.");setUpgrading(false);});};
  const handleLeadSubmit=async(e:React.FormEvent)=>{e.preventDefault();setLeadLoading(true);try{const res=await fetch("/api/leads/submit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({auditId,company:businessName,...leadForm})});if(res.ok)setLeadSubmitted(true);else alert("Failed.");}catch{alert("Error.");}finally{setLeadLoading(false);}};
  const filteredPlan = actionPlan?.filter(item => planFilter === "ALL" || item.tier === planFilter) || [];
  const baseTabs=[{id:"executive",label:"Executive Summary"},{id:"action_plan",label:"Priority Action Plan"},{id:"ai_visibility",label:"AI Visibility"},{id:"website_clarity",label:"Website Clarity"},{id:"search_local",label:"Search & Local"},{id:"content_authority",label:"Content & Authority"},{id:"trust",label:"Trust & Credibility"},{id:"conversion",label:"Conversion Audit"},{id:"schema",label:"Schema Code"}];
  const allTabs=[...baseTabs,...(isGrowth?[{id:"competitors",label:"Competitors"},{id:"customer_intent",label:"Customer Intent"},{id:"thirty_day_plan",label:"30-Day Plan"}]:[]),...(isAuthority?[{id:"query_coverage",label:"Query Coverage"},{id:"strategic_roadmap",label:"Strategic Roadmap"}]:[])];
  const UpgradeBanner = ({ targetTier, price, description }: { targetTier: IntelligenceTier; price: number; description: string }) => {
    return (
      <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400"><Lock className="w-4 h-4"/></div>
          <div>
            <div className="text-xs font-semibold text-white">Upgrade to unlock this intelligence layer</div>
            <div className="text-[11px] text-slate-400">{description}</div>
          </div>
        </div>
        <button onClick={() => handleUpgrade(targetTier)} disabled={upgrading} className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shrink-0 transition-all disabled:opacity-50">
          <span>{upgrading ? "Redirecting..." : `Upgrade — $${price}`}</span>
          <ArrowRight className="w-3.5 h-3.5"/>
        </button>
      </div>
    );
  };
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 no-print"><div className="flex items-center gap-3"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5"/><span>Full Unlocked Report &bull; Audit: {auditId.slice(0,10)}</span></div><span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{tier} TIER</span></div><button onClick={handlePrint} className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"><Printer className="w-3.5 h-3.5"/><span>Download / Print PDF</span></button></div>
      <div className="rounded-2xl border border-slate-800 bg-[#0c111d]/90 p-6 sm:p-8 card-print"><div className="flex flex-col md:flex-row items-center justify-between gap-8"><div className="space-y-3 text-center md:text-left flex-1"><div className="text-xs font-mono uppercase tracking-wider text-indigo-400">Business Visibility Intelligence Report &bull; {tier} Tier</div><h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{businessName}</h1><div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono"><span>{url || "No Website Provided"}</span><span>&bull;</span><span>{industry}</span><span>&bull;</span><span>{location}</span></div><blockquote className="text-sm text-slate-300 italic border-l-2 border-indigo-500 pl-3 mt-2">&ldquo;{executiveSummary.visibilityStatement}&rdquo;</blockquote></div><div className="shrink-0 flex flex-col items-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800 card-print"><span className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Overall Score</span><ScoreGauge score={overallScore} size={150}/></div></div></div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 no-print">{allTabs.map(tab=>(<button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab===tab.id?"bg-indigo-600 text-white shadow-sm":"text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"}`}>{tab.label}</button>))}</div>
      {(activeTab==="executive"||typeof window==="undefined")&&(<div className="space-y-6"><div className="rounded-2xl border border-slate-800 bg-[#0c111d]/90 p-6 sm:p-8 card-print space-y-4"><h2 className="text-lg font-semibold text-white tracking-tight">Executive Summary</h2><p className="text-sm text-slate-300 leading-relaxed">{executiveSummary.currentVisibility}</p><div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/80"><div className="space-y-3"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400"><CheckCircle2 className="w-4 h-4"/><span>Top 3 Strengths</span></div><ul className="space-y-2">{executiveSummary.topStrengths.map((s,i)=>(<li key={i} className="text-xs text-slate-300 flex items-start gap-2"><span className="text-emerald-500 font-bold shrink-0">&#10003;</span><span>{s}</span></li>))}</ul></div><div className="space-y-3"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400"><AlertCircle className="w-4 h-4"/><span>Top 5 Weaknesses</span></div><ul className="space-y-2">{executiveSummary.topProblems.map((p,i)=>(<li key={i} className="text-xs text-slate-300 flex items-start gap-2"><span className="text-rose-500 font-bold shrink-0">&#10005;</span><span>{p}</span></li>))}</ul></div><div className="space-y-3"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400"><Sparkles className="w-4 h-4"/><span>Top 5 Opportunities</span></div><ul className="space-y-2">{executiveSummary.topOpportunities.map((o,i)=>(<li key={i} className="text-xs text-slate-300 flex items-start gap-2"><span className="text-indigo-400 font-bold shrink-0">&rarr;</span><span>{o}</span></li>))}</ul></div></div></div>{tier==="ESSENTIAL"&&(<UpgradeBanner targetTier="GROWTH" price={tp.growth-tp.essential} description="Unlock Customer Intent Analysis, 30-Day Structured Plan, and Competitor Intelligence Matrix."/>)}</div>)}
      {(activeTab==="action_plan"||typeof window==="undefined")&&(<div className="space-y-6"><div className="rounded-2xl border border-slate-800 bg-[#0c111d]/90 p-6 sm:p-8 card-print space-y-5"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h2 className="text-lg font-semibold text-white tracking-tight">Priority Action Plan</h2><p className="text-xs text-slate-400">Ordered by highest ROI. Start at FIX NOW.</p></div><div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 no-print">{(["ALL","FIX_NOW","FIX_NEXT","OPTIMIZE_LATER"] as const).map(t=>(<button key={t} onClick={()=>setPlanFilter(t)} className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-colors ${planFilter===t?"bg-slate-800 text-white":"text-slate-400 hover:text-white"}`}>{t.replace(/_/g," ")}</button>))}</div></div><div className="space-y-3">{filteredPlan.map(item=>{let bc="bg-rose-500/10 text-rose-400 border-rose-500/30";if(item.tier==="FIX_NEXT")bc="bg-amber-500/10 text-amber-400 border-amber-500/30";if(item.tier==="OPTIMIZE_LATER")bc="bg-blue-500/10 text-blue-400 border-blue-500/30";return(<div key={item.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-print"><div className="space-y-1"><div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${bc}`}>{item.tier.replace(/_/g," ")}</span><span className="text-[11px] font-mono text-slate-500">{item.category}</span></div><h4 className="text-sm font-semibold text-white">{item.title}</h4><p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{item.description}</p></div><div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0"><span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Impact: {item.impact}</span><span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/60 text-slate-400">Effort: {item.effort}</span></div></div>);})}</div></div></div>)}
      {activeTab === "ai_visibility" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#0c111d]/90 p-6 sm:p-8 card-print space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-white tracking-tight">AI Visibility & Machine Readability</h2>
                <p className="text-xs text-slate-400">How understandable your business is to LLMs and generative search.</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-indigo-400">{categories.aiVisibility.score}</span>
                <span className="text-xs text-slate-500 font-mono">/100</span>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Can AI Clearly Determine:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {[
                  { flag: aiReadinessDetails.canUnderstandWhatYouDo, label: "What the company does" },
                  { flag: aiReadinessDetails.canUnderstandWhoYouServe, label: "Target audience" },
                  { flag: aiReadinessDetails.canUnderstandLocations, label: "Geographic service bounds" }
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                    {item.flag ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">{aiReadinessDetails.readinessAssessment}</p>

            {categories.aiVisibility.findings && categories.aiVisibility.findings.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-indigo-300 border-b border-slate-800 pb-2">Intelligence Findings</h3>
                <div className="grid grid-cols-1 gap-4">
                  {categories.aiVisibility.findings.map((finding, i) => (
                    <div key={i} className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white">{finding.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          finding.priority === "HIGH" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : 
                          finding.priority === "MEDIUM" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : 
                          "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}>{finding.priority} PRIORITY</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">What We Found</span>
                          <p className="text-xs text-slate-300">{finding.whatWeFound}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Why It Matters</span>
                          <p className="text-xs text-slate-300">{finding.whyItMatters}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between gap-3">
                        <div className="flex-1">
                          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">Business Impact</span>
                          <p className="text-xs text-indigo-200 mt-0.5">{finding.businessImpact}</p>
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Recommended Action</span>
                          <p className="text-xs text-emerald-200 mt-0.5">{finding.recommendedAction}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300">Observed Evidence</div>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {aiReadinessDetails.observedEvidence.map((ev, i) => <li key={i}>&bull; {ev}</li>)}
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-indigo-300">Key Recommendations</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {categories.aiVisibility.recommendations.map((rec, i) => <li key={i}>&rarr; {rec}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {["website_clarity", "search_local", "content_authority", "trust", "conversion"].includes(activeTab) && (
        <div className="space-y-6">
          {(() => {
            const catMap: Record<string, { title: string; data: any }> = {
              website_clarity: { title: "Website Clarity & Architecture", data: categories.websiteClarity },
              search_local: { title: "Search & Local Presence", data: categories.searchLocal },
              content_authority: { title: "Content & Authority Audit", data: categories.contentAuthority },
              trust: { title: "Trust & Credibility Signals", data: categories.trustCredibility },
              conversion: { title: "Conversion & Friction Audit", data: categories.conversionReadiness },
            };
            const cc = catMap[activeTab];

            return (
              <div className="rounded-2xl border border-slate-800 bg-[#0c111d]/90 p-6 sm:p-8 card-print space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white tracking-tight">{cc.title}</h2>
                    <p className="text-xs text-slate-400">{cc.data.explanation}</p>
                  </div>
                  <div className="text-right">
                    {cc.data.status === "insufficient" ? (
                      <span className="text-sm font-bold text-slate-500">N/A</span>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-white">{cc.data.score}</span>
                        <span className="text-xs text-slate-500 font-mono">/100</span>
                      </>
                    )}
                  </div>
                </div>

                {cc.data.findings && cc.data.findings.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-indigo-300 border-b border-slate-800 pb-2">Intelligence Findings</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {cc.data.findings.map((finding: any, i: number) => (
                        <div key={i} className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white">{finding.title}</h4>
                            <div className="flex gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                finding.confidence === "VERIFIED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                finding.confidence === "INSUFFICIENT_DATA" ? "bg-slate-500/10 text-slate-400 border border-slate-500/20" :
                                finding.confidence === "NOT_CONFIRMED" ? "bg-slate-500/10 text-slate-400 border border-slate-500/20" :
                                "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                              }`}>{finding.confidence}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                finding.priority === "HIGH" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : 
                                finding.priority === "MEDIUM" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : 
                                "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              }`}>{finding.priority} PRIORITY</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">What We Found</span>
                              <p className="text-xs text-slate-300">{finding.whatWeFound}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Why It Matters</span>
                              <p className="text-xs text-slate-300">{finding.whyItMatters}</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between gap-3">
                            <div className="flex-1">
                              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">Business Impact</span>
                              <p className="text-xs text-indigo-200 mt-0.5">{finding.businessImpact}</p>
                            </div>
                            <div className="flex-1">
                              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Recommended Action</span>
                              <p className="text-xs text-emerald-200 mt-0.5">{finding.recommendedAction}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-emerald-400">Strengths Identified</div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {cc.data.strengths.length > 0 ? cc.data.strengths.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5"><span className="text-emerald-400">&#10003;</span><span>{s}</span></li>
                      )) : <li className="text-slate-500">No major strengths recorded.</li>}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-rose-400">Weaknesses / Gaps</div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {cc.data.weaknesses.map((w: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5"><span className="text-rose-400">&#10005;</span><span>{w}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
                {(!cc.data.findings || cc.data.findings.length === 0) && (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-indigo-300">Recommended Steps</div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {cc.data.recommendations.map((r: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5"><span className="text-indigo-400">&rarr;</span><span>{r}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
      {activeTab==="competitors"&&(<div className="space-y-6"><div className="rounded-2xl border border-slate-800 bg-[#0c111d]/90 p-6 sm:p-8 card-print space-y-5"><div><h2 className="text-lg font-semibold text-white tracking-tight">Your Business vs. Industry Benchmarks</h2><p className="text-xs text-slate-400">Grounded comparison in the {industry} sector.</p></div><div className="overflow-x-auto"><table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden"><thead className="bg-slate-900 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800"><tr><th className="p-3">Analysis Area</th><th className="p-3">Your Status</th><th className="p-3">Benchmark</th><th className="p-3">Impact</th></tr></thead><tbody className="divide-y divide-slate-800">{competitorComparison?.map((comp,i)=>(<tr key={i} className="hover:bg-slate-900/40 transition-colors"><td className="p-3 font-medium text-white">{comp.area}</td><td className="p-3 text-slate-300">{comp.yourStatus}</td><td className="p-3 text-slate-400">{comp.competitorBenchmark}</td><td className="p-3 font-mono text-indigo-400">{comp.impact}</td></tr>))}</tbody></table></div></div></div>)}
      {activeTab==="schema"&&(<div className="space-y-6"><div className="rounded-2xl border border-slate-800 bg-[#0c111d]/90 p-6 sm:p-8 card-print space-y-4"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h2 className="text-lg font-semibold text-white tracking-tight">Instant JSON-LD Schema Snippet</h2><p className="text-xs text-slate-400">Custom-tailored structured entity markup for {businessName}.</p></div><button onClick={handleCopySchema} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors">{copiedSchema?<Check className="w-3.5 h-3.5"/>:<Copy className="w-3.5 h-3.5"/>}<span>{copiedSchema?"Copied!":"Copy Code"}</span></button></div><div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto"><pre>{generatedSchema.codeSnippet}</pre></div><p className="text-xs text-slate-400 leading-relaxed"><span className="text-white font-medium">Installation: </span>{generatedSchema.instructions}</p></div></div>)}
      {activeTab === "customer_intent" && (
        <div className="space-y-6">
          {isGrowth && customerIntentAnalysis && customerIntentAnalysis.length > 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-[#0c111d]/90 p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white tracking-tight">Customer Intent Analysis</h2>
                  <p className="text-xs text-slate-400">What buyers ask AI vs. what your site currently answers.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                  <thead className="bg-slate-900 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Buyer Question</th>
                      <th className="p-3">Intent Type</th>
                      <th className="p-3">Site Status</th>
                      <th className="p-3">Actionable Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {customerIntentAnalysis.map((item, i) => {
                      const statusColor =
                        item.yourSiteStatus === "Explicitly Answered"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : item.yourSiteStatus === "Partially Covered"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20";
                      return (
                        <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3 text-white font-medium max-w-xs">{item.buyerQuestion}</td>
                          <td className="p-3 text-indigo-300 font-mono text-[11px]">{item.intentType}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${statusColor}`}>
                              {item.yourSiteStatus}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300 text-xs">{item.recommendation}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <UpgradeBanner
              targetTier="GROWTH"
              price={(tp?.growth ?? 25) - (tp?.essential ?? 10)}
              description="Unlock Customer Intent Analysis — understand what your buyers ask AI versus what your site answers."
            />
          )}
        </div>
      )}

      {activeTab === "thirty_day_plan" && (
        <div className="space-y-6">
          {isGrowth && thirtyDayPlan && thirtyDayPlan.length > 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-[#0c111d]/90 p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white tracking-tight">Structured 30-Day Action Plan</h2>
                  <p className="text-xs text-slate-400">Phased week-by-week execution roadmap with clear team ownership.</p>
                </div>
              </div>
              <div className="space-y-5">
                {thirtyDayPlan.map((phase, i) => (
                  <div key={i} className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                          {phase.phase}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{phase.timeframe}</span>
                      </div>
                      <span className="text-xs font-medium text-slate-300 italic">{phase.objective}</span>
                    </div>
                    <div className="space-y-2.5">
                      {phase.tasks?.map((task, j) => (
                        <div key={j} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-white flex items-center gap-2">
                              <span className="text-emerald-400 font-bold">&#10003;</span>
                              <span>{task.title}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 pl-4">{task.deliverable}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 pl-4 sm:pl-0">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                              {task.role}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono text-[10px]">
                              {task.impact}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <UpgradeBanner
              targetTier="GROWTH"
              price={(tp?.growth ?? 25) - (tp?.essential ?? 10)}
              description="Unlock the 30-Day Structured Action Plan — phased week-by-week execution roadmap."
            />
          )}
        </div>
      )}

      {activeTab === "query_coverage" && (
        <div className="space-y-6">
          {isAuthority && queryCoverageAnalysis && queryCoverageAnalysis.length > 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-[#0c111d]/90 p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white tracking-tight">Generative Query Coverage Analysis</h2>
                  <p className="text-xs text-slate-400">Simulated LLM query evaluations across 6 critical search intent categories.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {queryCoverageAnalysis.map((item, i) => {
                  const statusBadge =
                    item.aiVisibilityStatus === "Dominant"
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : item.aiVisibilityStatus === "At Risk"
                      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      : "text-rose-400 bg-rose-500/10 border-rose-500/20";
                  return (
                    <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-300 font-mono">{item.queryCategory}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${statusBadge}`}>
                          {item.aiVisibilityStatus}
                        </span>
                      </div>
                      <p className="text-xs text-white font-medium">&ldquo;{item.simulatedQuery}&rdquo;</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.diagnosticReason}</p>
                      <div className="pt-1 text-[11px] text-emerald-400 flex items-start gap-1.5">
                        <span className="shrink-0 font-bold">&rarr;</span>
                        <span>{item.optimizationStep}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <UpgradeBanner
              targetTier="AUTHORITY"
              price={(tp?.authority ?? 50) - (isGrowth ? (tp?.growth ?? 25) : (tp?.essential ?? 10))}
              description="Unlock Generative Query Coverage Analysis — see which LLM search intents your site is missing."
            />
          )}
        </div>
      )}

      {activeTab === "strategic_roadmap" && (
        <div className="space-y-6">
          {isAuthority && strategicRoadmap ? (
            <div className="rounded-2xl border border-slate-800 bg-[#0c111d]/90 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Map className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white tracking-tight">Executive Strategic Roadmap</h2>
                  <p className="text-xs text-slate-400">Quarterly directives for executive decision-makers and agency handoff.</p>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40 space-y-1.5">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">Executive Directive</div>
                <p className="text-sm text-slate-200 leading-relaxed">{strategicRoadmap.executiveDirective}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-emerald-400">Primary Strategic Advantage</div>
                  <p className="text-xs text-slate-300">{strategicRoadmap.primaryStrategicAdvantage}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-rose-400">Immediate Bottleneck</div>
                  <p className="text-xs text-slate-300">{strategicRoadmap.immediateBottleneck}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Quarterly Milestones</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {strategicRoadmap.quarterlyMilestones?.map((m, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                          {m.quarter}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{m.kpiTarget}</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium">{m.focus}</p>
                    </div>
                  ))}
                </div>
              </div>

              {strategicRoadmap.handoffGuideForTeam && strategicRoadmap.handoffGuideForTeam.length > 0 && (
                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Team &amp; Agency Handoff Blueprint
                  </div>
                  <ul className="space-y-2">
                    {strategicRoadmap.handoffGuideForTeam.map((guide, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                        <span className="text-indigo-400 font-bold shrink-0">&rarr;</span>
                        <span>{guide}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <UpgradeBanner
              targetTier="AUTHORITY"
              price={(tp?.authority ?? 50) - (isGrowth ? (tp?.growth ?? 25) : (tp?.essential ?? 10))}
              description="Unlock the Executive Strategic Roadmap — quarterly KPIs and developer/marketing handoff blueprint."
            />
          )}
        </div>
      )}
      
      {/* PHASE 3L: Render Dynamic Service Opportunities */}
      {reportData.serviceOpportunities && reportData.serviceOpportunities.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-[#0c111d]/90 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight">Evidence-Backed Opportunities</h2>
              <p className="text-xs text-slate-400">Qualified services mapped directly to your priority findings.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reportData.serviceOpportunities.map((so: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    {so.service.replace(/_/g, " ")}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    so.priority === "HIGH" ? "text-rose-400" : "text-amber-400"
                  }`}>{so.priority} PRIORITY</span>
                </div>
                <p className="text-xs text-slate-300 pt-1 leading-relaxed">{so.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="rounded-2xl border border-indigo-900/40 bg-[#0d1326] p-6 sm:p-8 no-print space-y-6 relative overflow-hidden"><div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600/10 blur-[100px] pointer-events-none"/><div className="max-w-2xl space-y-2"><div className="text-xs font-mono uppercase tracking-wider text-indigo-400">Professional Implementation</div><h3 className="text-2xl font-bold text-white tracking-tight">Want Us To Fix It?</h3><p className="text-xs text-slate-300 leading-relaxed">Your report identified key visibility gaps. Our senior digital engineering team can implement the complete solution: schema architecture, AI visibility optimization, and conversion-rate tuning.</p></div>{leadSubmitted?(<div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0"/><span>Thank you! An expert strategist has received your audit and will review within 24 hours.</span></div>):(<form onSubmit={handleLeadSubmit} className="space-y-4 max-w-xl"><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><input type="text" required placeholder="Your Name" value={leadForm.name} onChange={e=>setLeadForm({...leadForm,name:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"/><input type="email" required placeholder="Your Email" value={leadForm.email} onChange={e=>setLeadForm({...leadForm,email:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"/></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><input type="tel" placeholder="Phone (Optional)" value={leadForm.phone} onChange={e=>setLeadForm({...leadForm,phone:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"/><select value={leadForm.service} onChange={e=>setLeadForm({...leadForm,service:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"><option value="AI visibility optimization">AI Visibility Optimization</option><option value="Complete Website Redesign">Complete Website Redesign</option><option value="Content &amp; Topical Strategy">Content &amp; Topical Strategy</option><option value="Local Search &amp; Schema Setup">Local Search &amp; Schema Setup</option><option value="Full Digital Turnkey Growth">Full Digital Turnkey Growth</option></select></div><textarea rows={2} placeholder="Tell us about your immediate goals..." value={leadForm.message} onChange={e=>setLeadForm({...leadForm,message:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"/><button type="submit" disabled={leadLoading} className="py-2.5 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"><Send className="w-3.5 h-3.5"/><span>{leadLoading?"Sending...":"Talk to an Expert"}</span></button></form>)}</div>
    </div>
  );
}
