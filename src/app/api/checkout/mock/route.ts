import { NextRequest, NextResponse } from "next/server";
import { markAuditAsPaid, calculateTierPrice } from "@/lib/payment";
import { IntelligenceTier } from "@/lib/types";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const auditId = url.searchParams.get("auditId");
  const tier = (url.searchParams.get("tier") as IntelligenceTier) || "GROWTH";

  if (!auditId) {
    return NextResponse.json({ error: "Missing auditId" }, { status: 400 });
  }

  const { finalPrice } = await calculateTierPrice(auditId, tier);
  await markAuditAsPaid(auditId, tier, finalPrice, "mock_test_mode", `demo_${Date.now()}`);

  const redirectParam = url.searchParams.get("redirect");
  
  if (redirectParam) {
    const redirectUrl = new URL(`${redirectParam}?unlocked=true&auditId=${auditId}&tier=${tier}`, req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  const dashboardUrl = new URL(`/dashboard?unlocked=true&auditId=${auditId}&tier=${tier}`, req.url);
  return NextResponse.redirect(dashboardUrl);
}
