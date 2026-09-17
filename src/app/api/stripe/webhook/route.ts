import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/payment";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return new NextResponse("Stripe is not configured", { status: 500 });
  }

  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set.");
    return new NextResponse("Webhook Secret is missing", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const auditId = session.metadata?.auditId;
    const targetTier = session.metadata?.targetTier || "ESSENTIAL";
    const amount = (session.amount_total || 0) / 100;
    const currency = session.currency || "USD";
    const paymentIntentId = session.payment_intent as string;

    if (!auditId) {
      console.error("Missing auditId in webhook metadata", session.id);
      return new NextResponse("Missing metadata", { status: 400 });
    }

    try {
      // Check for idempotency: Does this payment already exist?
      const existingPayment = await prisma.payment.findFirst({
        where: { transactionRef: session.id },
      });

      if (existingPayment) {
        console.log("Idempotent webhook skipped, payment already processed:", session.id);
        return new NextResponse("Already processed", { status: 200 });
      }

      const audit = await prisma.audit.findUnique({ where: { id: auditId } });
      if (!audit) {
        return new NextResponse("Audit not found", { status: 404 });
      }

      const newTotalTierPrice = Math.max(audit.tierPrice || 0, (audit.tierPrice || 0) + amount);

      // We use transaction to ensure both payment log and audit unlock happen atomically
      await prisma.$transaction([
        prisma.payment.create({
          data: {
            auditId,
            tier: targetTier,
            amount,
            currency: currency.toUpperCase(),
            status: "SUCCEEDED",
            provider: "stripe",
            transactionRef: session.id, // we use checkout session id as ref for idempotency
          },
        }),
        prisma.audit.update({
          where: { id: auditId },
          data: {
            tier: targetTier,
            tierPrice: newTotalTierPrice,
            isPaid: true,
            paidAt: new Date(),
            status: "PROCESSING", // Start background generation visually
          },
        })
      ]);

      console.log(`Payment confirmed for audit ${auditId}, upgraded to ${targetTier}`);
      
      // In a real production system, you'd trigger an asynchronous background worker here 
      // (like Inngest, BullMQ, or AWS SQS) to actually generate the new deeper intelligence report.
      // For now, we update the status to processing, and it will be fulfilled asynchronously.

    } catch (err: any) {
      console.error("Error processing checkout.session.completed:", err.message);
      return new NextResponse("Database error", { status: 500 });
    }
  }

  return new NextResponse("Success", { status: 200 });
}
