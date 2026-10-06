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

  // Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Validate session payment status
    if (session.payment_status !== "paid") {
      console.warn("Checkout session received but payment_status is not paid:", session.id, session.payment_status);
      return new NextResponse("Payment not complete", { status: 200 });
    }

    const auditId = session.metadata?.auditId;
    const targetTier = (session.metadata?.targetTier as any) || "ESSENTIAL";
    const amount = (session.amount_total || 0) / 100;
    const currency = session.currency || "USD";

    if (!auditId) {
      console.error("Missing auditId in webhook metadata", session.id);
      return new NextResponse("Missing metadata", { status: 400 });
    }

    try {
      // Idempotency: Does this payment already exist?
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

      // Atomic unlock and payment transaction
      await prisma.$transaction([
        prisma.payment.create({
          data: {
            auditId,
            tier: targetTier,
            amount,
            currency: currency.toUpperCase(),
            status: "SUCCEEDED",
            provider: "stripe",
            transactionRef: session.id,
          },
        }),
        prisma.audit.update({
          where: { id: auditId },
          data: {
            tier: targetTier,
            tierPrice: newTotalTierPrice,
            isPaid: true,
            paidAt: new Date(),
            status: "COMPLETED",
          },
        }),
      ]);

      console.log(`Payment confirmed for audit ${auditId}, upgraded to ${targetTier}`);
    } catch (err: any) {
      console.error("Error processing checkout.session.completed:", err.message);
      return new NextResponse("Database error", { status: 500 });
    }
  }

  // Handle charge refunds - revoke entitlements if fully refunded
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = charge.payment_intent as string;

    try {
      // Find payment record
      const payment = await prisma.payment.findFirst({
        where: {
          OR: [
            { transactionRef: charge.id },
            { transactionRef: paymentIntentId },
          ],
        },
        include: { audit: true },
      });

      if (payment) {
        if (charge.refunded) {
          // Fully refunded - mark payment refunded and reset audit access
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: { status: "REFUNDED" },
            }),
            prisma.audit.update({
              where: { id: payment.auditId },
              data: {
                isPaid: false,
                tier: "SNAPSHOT",
                tierPrice: 0,
              },
            }),
          ]);
          console.log(`Entitlement revoked for refunded audit ${payment.auditId}`);
        }
      }
    } catch (err: any) {
      console.error("Error processing charge.refunded:", err.message);
    }
  }

  // Handle failed payment intent
  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    console.warn(`Payment failed for payment_intent: ${pi.id}`);
  }

  return new NextResponse("Success", { status: 200 });
}
