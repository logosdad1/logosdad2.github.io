import { NextRequest, NextResponse } from "next/server";
import { markAuditAsPaid, calculateTierPrice } from "@/lib/payment";
import { IntelligenceTier } from "@/lib/types";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const auditId = url.searchParams.get("auditId");
  const tier = (url.searchParams.get("tier") as IntelligenceTier) || "GROWTH";
  const provider = url.searchParams.get("provider") || "mock";
  const ref = url.searchParams.get("ref") || `demo_${Date.now()}`;

  if (!auditId) {
    return NextResponse.json({ error: "Missing auditId" }, { status: 400 });
  }

  const { finalPrice } = await calculateTierPrice(auditId, tier);
  await markAuditAsPaid(auditId, tier, finalPrice, provider, ref);

  const redirectParam = url.searchParams.get("redirect");
  if (redirectParam) {
    const redirectUrl = new URL(`${redirectParam}?reference=${ref}&auditId=${auditId}&tier=${tier}`, req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to success page with reference to test verified completion flow
  const successUrl = new URL(`/payment/success?reference=${ref}`, req.url);
  return NextResponse.redirect(successUrl);
}
