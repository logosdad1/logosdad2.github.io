import { NextRequest, NextResponse } from "next/server";
import { stripe, markAuditAsPaid } from "@/lib/payment";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ message: "Stripe webhook not configured" }, { status: 200 });
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const auditId = session.metadata?.auditId;
    const amount = (session.amount_total || 1000) / 100;

    if (auditId) {
      const targetTier = session.metadata?.targetTier || "GROWTH";
      await markAuditAsPaid(auditId, targetTier, amount, "stripe", session.id);
    }
  }

  return NextResponse.json({ received: true });
}
