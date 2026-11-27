import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { paymentService } from "@/lib/payments/service";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = headers().get("x-paystack-signature") || "";

    if (!signature) {
      console.warn("Paystack webhook received without x-paystack-signature header");
      return new NextResponse("Missing signature header", { status: 400 });
    }

    const paystackProvider = paymentService.getProviderByName("PAYSTACK");
    const normalizedEvent = await paystackProvider.verifyWebhook({
      rawBody,
      signature,
    });

    if (!normalizedEvent) {
      console.warn("Paystack webhook signature verification failed.");
      return new NextResponse("Invalid signature or payload", { status: 400 });
    }

    const result = await paymentService.processWebhookEvent(
      normalizedEvent,
      "PAYSTACK"
    );

    return new NextResponse(result.message, { status: result.status });
  } catch (error: any) {
    console.error("Paystack webhook error:", error.message);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
