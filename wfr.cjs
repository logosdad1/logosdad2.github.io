const fs = require('fs');
let c = '';
c += '"use client";\n';
c += 'import { useState } from "react";\n';
c += 'import ScoreGauge from "./ScoreGauge";\n';
c += 'import { AuditReportDataPayload, IntelligenceTier } from "@/lib/types";\n';
c += 'import {\n  Printer, Copy, Check, ShieldCheck, Zap, Layers, Search, Users,\n  TrendingUp, AlertCircle, CheckCircle2, Send, Sparkles, ArrowRight,\n  Lock, Target, Calendar, BarChart2, Map,\n} from "lucide-react";\n\n';
c += 'interface FullReportViewProps {\n  auditId: string;\n  businessName: string;\n  url: string;\n  industry: string;\n  location: string;\n  overallScore: number;\n  reportData: AuditReportDataPayload;\n  tier?: IntelligenceTier;\n  tierPrices?: { essential: number; growth: number; authority: number };\n}\n\n';
