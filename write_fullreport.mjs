import { writeFileSync } from 'fs';
const Q = '"';
const BT = '\';

const f = [
"use client";,
,
import { useState } from "react";,
import ScoreGauge from "./ScoreGauge";,
import { AuditReportDataPayload, IntelligenceTier } from "@/lib/types";,
import {,
  Printer, Copy, Check, ShieldCheck, Zap, Layers, Search, Users,,
  TrendingUp, AlertCircle, CheckCircle2, Send, Sparkles, ArrowRight,,
  Lock, Target, Calendar, BarChart2, Map,,
} from "lucide-react";,
,
].join('\n');
writeFileSync('src/components/FullReportView_test2.txt', f, 'utf8');
console.log('Written', f.length);
