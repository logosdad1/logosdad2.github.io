import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { POST as paystackHandler } from "@/app/api/paystack/webhook/route";
import { POST as stripeHandler } from "@/app/api/stripe/webhook/route";

/**
 * Unified Webhook Entrypoint
 * Intelligently routes incoming webhooks based on provider signature headers.
 */
export async function POST(req: NextRequest) {
  const headerList = headers();
  const hasPaystack = Boolean(headerList.get("x-paystack-signature"));
  const hasStripe = Boolean(headerList.get("stripe-signature"));

  if (hasPaystack) {
    return paystackHandler(req);
  }

  if (hasStripe) {
    return stripeHandler(req);
  }

  return new NextResponse("Unrecognized webhook provider signature", { status: 400 });
}
