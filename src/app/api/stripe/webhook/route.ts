import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { paymentService } from "@/lib/payments/service";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = headers().get("Stripe-Signature") || "";

    if (!signature) {
      console.warn("Stripe webhook received without Stripe-Signature header");
      return new NextResponse("Missing signature header", { status: 400 });
    }

    const stripeProvider = paymentService.getProviderByName("STRIPE");
    const normalizedEvent = await stripeProvider.verifyWebhook({
      rawBody,
      signature,
    });

    if (!normalizedEvent) {
      return new NextResponse("Webhook signature verification failed or unhandled", { status: 400 });
    }

    const result = await paymentService.processWebhookEvent(
      normalizedEvent,
      "STRIPE"
    );

    return new NextResponse(result.message, { status: result.status });
  } catch (error: any) {
    console.error("Stripe webhook error:", error.message);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
