import Stripe from "stripe";
import { prisma } from "./prisma";
import { IntelligenceTier } from "./types";
import { getSystemSettings } from "./config";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-09-30.acacia" as any })
  : null;

export async function calculateTierPrice(
  auditId: string,
  targetTier: IntelligenceTier
): Promise<{ finalPrice: number; isUpgrade: boolean; targetTier: IntelligenceTier }> {
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
  });

  if (!audit) throw new Error("Audit not found");

  const settings = await getSystemSettings();
  const prices = settings.tierPrices || { essential: 10, growth: 25, authority: 50 };

  const targetFullPrice =
    targetTier === "AUTHORITY"
      ? prices.authority
      : targetTier === "GROWTH"
      ? prices.growth
      : prices.essential;

  const currentTierPrice = audit.tierPrice || 0;

  // If upgrading from an already paid lower tier, only charge the difference
  if (audit.isPaid && currentTierPrice > 0 && targetFullPrice > currentTierPrice) {
    const upgradeDifference = Math.max(5, targetFullPrice - currentTierPrice);
    return { finalPrice: upgradeDifference, isUpgrade: true, targetTier };
  }

  return { finalPrice: targetFullPrice, isUpgrade: false, targetTier };
}

export async function createCheckoutSession(
  auditId: string,
  targetTier: IntelligenceTier = "GROWTH",
  returnUrlBase: string
): Promise<{ checkoutUrl: string; isMock: boolean; finalPrice: number; isUpgrade: boolean }> {
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
  });

  if (!audit) throw new Error("Audit not found");

  const { finalPrice, isUpgrade } = await calculateTierPrice(auditId, targetTier);

  const tierNames: Record<IntelligenceTier, string> = {
    SNAPSHOT: "Visibility Snapshot (Free)",
    ESSENTIAL: "Essential Intelligence ($10)",
    GROWTH: "Growth Intelligence ($25)",
    AUTHORITY: "Authority Intelligence ($50)",
  };

  // If Stripe is configured and valid, create real Stripe Checkout session
  if (stripe && stripeSecretKey && !stripeSecretKey.includes("placeholder")) {
    const session = await stripe.checkout.sessions.create({
      // Omit payment_method_types to let Stripe automatically offer Google Pay, Apple Pay, and Cards based on Dashboard settings
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${isUpgrade ? "Upgrade to " : ""}${tierNames[targetTier]} - ${audit.businessName}`,
              description: `Tiered AI Visibility Intelligence for ${audit.businessName}`,
            },
            unit_amount: Math.round(finalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${returnUrlBase}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrlBase}/audit/${auditId}?canceled=true`,
      metadata: {
        auditId: audit.id,
        businessId: audit.businessId || "",
        userId: audit.userId || "",
        targetTier,
      },
    });

    return {
      checkoutUrl: session.url || `${returnUrlBase}/payment/success?session_id=mock`,
      isMock: false,
      finalPrice,
      isUpgrade,
    };
  }

  // Otherwise, return direct mock unlock endpoint
  return {
    checkoutUrl: `${returnUrlBase}/api/checkout/mock?auditId=${audit.id}&tier=${targetTier}&redirect=/dashboard`,
    isMock: true,
    finalPrice,
    isUpgrade,
  };
}

export async function markAuditAsPaid(
  auditId: string,
  tier: IntelligenceTier = "GROWTH",
  amount: number,
  provider: string = "stripe",
  ref: string = "txn_demo"
): Promise<void> {
  const audit = await prisma.audit.findUnique({ where: { id: auditId } });
  if (!audit) throw new Error("Audit not found");

  const newTotalTierPrice = Math.max(audit.tierPrice || 0, (audit.tierPrice || 0) + amount);

  await prisma.$transaction([
    prisma.audit.update({
      where: { id: auditId },
      data: {
        tier,
        tierPrice: newTotalTierPrice,
        isPaid: true,
        paidAt: new Date(),
      },
    }),
    prisma.payment.create({
      data: {
        auditId,
        tier,
        amount,
        currency: "USD",
        status: "SUCCEEDED",
        provider,
        transactionRef: ref,
      },
    }),
  ]);
}
