import { prisma } from "../prisma";
import { IntelligenceTier } from "../types";
import { getSystemSettings } from "../config";
import {
  IPaymentProvider,
  PaymentProviderName,
  CreateCheckoutResult,
  NormalizedWebhookEvent,
} from "./types";
import { PaystackProvider } from "./paystack-provider";
import { StripeProvider } from "./stripe-provider";

export class PaymentService {
  private paystack: PaystackProvider;
  private stripe: StripeProvider;

  constructor() {
    this.paystack = new PaystackProvider();
    this.stripe = new StripeProvider();
  }

  getActiveProvider(): IPaymentProvider {
    const configuredProvider = (process.env.PAYMENT_PROVIDER || "PAYSTACK").toUpperCase();
    if (configuredProvider === "STRIPE" && this.stripe.isConfigured()) {
      return this.stripe;
    }
    // Paystack is primary
    return this.paystack;
  }

  getProviderByName(name: PaymentProviderName): IPaymentProvider {
    if (name === "STRIPE") return this.stripe;
    return this.paystack;
  }

  async calculateTierPrice(
    auditId: string,
    targetTier: IntelligenceTier
  ): Promise<{ finalPrice: number; isUpgrade: boolean; targetTier: IntelligenceTier }> {
    const audit = await prisma.audit.findUnique({ where: { id: auditId } });
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

    // If upgrading from an already paid lower tier, only charge the differential
    if (audit.isPaid && currentTierPrice > 0 && targetFullPrice > currentTierPrice) {
      const upgradeDifference = Math.max(5, targetFullPrice - currentTierPrice);
      return { finalPrice: upgradeDifference, isUpgrade: true, targetTier };
    }

    return { finalPrice: targetFullPrice, isUpgrade: false, targetTier };
  }

  async createCheckout(
    auditId: string,
    targetTier: IntelligenceTier = "GROWTH",
    returnUrlBase: string,
    userInfo?: { userId?: string; email?: string }
  ): Promise<CreateCheckoutResult> {
    const audit = await prisma.audit.findUnique({ where: { id: auditId } });
    if (!audit) throw new Error("Audit not found");

    const { finalPrice, isUpgrade } = await this.calculateTierPrice(auditId, targetTier);
    const provider = this.getActiveProvider();
    const currency = process.env.PAYSTACK_CURRENCY || "USD";

    const result = await provider.createCheckoutSession({
      auditId,
      businessName: audit.businessName,
      userEmail: userInfo?.email,
      userId: userInfo?.userId || audit.userId || undefined,
      businessId: audit.businessId || undefined,
      targetTier,
      finalPrice,
      currency,
      isUpgrade,
      returnUrlBase,
    });

    // Record pending transaction in database for idempotency & auditing
    try {
      await prisma.payment.create({
        data: {
          auditId,
          userId: userInfo?.userId || audit.userId,
          businessId: audit.businessId,
          tier: targetTier,
          amount: finalPrice,
          currency,
          status: "PENDING",
          provider: result.provider.toLowerCase(),
          transactionRef: result.providerReference,
        },
      });
    } catch (e: any) {
      console.warn("Could not pre-create pending payment record:", e.message);
    }

    return result;
  }

  async processWebhookEvent(
    event: NormalizedWebhookEvent,
    providerName: PaymentProviderName
  ): Promise<{ success: boolean; status: number; message: string }> {
    if (event.eventType === "PAYMENT_SUCCESS") {
      const ref = event.providerReference;
      const targetTier = event.metadata.targetTier || "ESSENTIAL";
      const auditId = event.metadata.auditId;

      if (!auditId) {
        return { success: false, status: 400, message: "Missing auditId in metadata" };
      }

      // Idempotency: Has this payment already succeeded?
      const existingSuccess = await prisma.payment.findFirst({
        where: {
          transactionRef: ref,
          status: { in: ["PAID", "SUCCEEDED"] },
        },
      });

      if (existingSuccess) {
        return { success: true, status: 200, message: "Payment already processed" };
      }

      const audit = await prisma.audit.findUnique({ where: { id: auditId } });
      if (!audit) {
        return { success: false, status: 404, message: "Audit not found" };
      }

      const newTotalTierPrice = Math.max(audit.tierPrice || 0, (audit.tierPrice || 0) + event.amount);

      // Atomic unlock and payment update
      await prisma.$transaction([
        prisma.payment.upsert({
          where: { id: (await prisma.payment.findFirst({ where: { transactionRef: ref } }))?.id || "new" },
          update: {
            status: "PAID",
            amount: event.amount,
            currency: event.currency,
            paidAt: event.paidAt || new Date(),
            tier: targetTier,
          },
          create: {
            auditId,
            userId: event.metadata.userId || audit.userId,
            businessId: event.metadata.businessId || audit.businessId,
            tier: targetTier,
            amount: event.amount,
            currency: event.currency,
            status: "PAID",
            provider: providerName.toLowerCase(),
            transactionRef: ref,
            paidAt: event.paidAt || new Date(),
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

      console.log(`[PaymentService] ${providerName} confirmed payment for audit ${auditId} (Tier: ${targetTier}, Amount: ${event.amount})`);
      return { success: true, status: 200, message: "Payment confirmed and intelligence unlocked" };
    }

    if (event.eventType === "REFUND") {
      const ref = event.providerReference;
      const payment = await prisma.payment.findFirst({
        where: { transactionRef: ref },
      });

      if (payment) {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "REFUNDED",
              refundedAt: new Date(),
            },
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
        console.log(`[PaymentService] Revoked entitlement for refunded audit ${payment.auditId}`);
        return { success: true, status: 200, message: "Entitlement revoked for refund" };
      }

      return { success: true, status: 200, message: "Refund noted, no payment record matched" };
    }

    return { success: true, status: 200, message: "Event ignored" };
  }

  async verifyPaymentStatus(
    reference: string
  ): Promise<{ status: "COMPLETED" | "PROCESSING" | "PENDING" | "FAILED"; auditId?: string; tier?: string }> {
    const payment = await prisma.payment.findFirst({
      where: { transactionRef: reference },
      include: { audit: true },
    });

    if (payment) {
      if (payment.status === "PAID" || payment.status === "SUCCEEDED" || payment.audit.isPaid) {
        return { status: "COMPLETED", auditId: payment.auditId, tier: payment.tier };
      }
      if (payment.status === "FAILED") {
        return { status: "FAILED" };
      }
    }

    // Direct Paystack fallback verification if webhook was delayed
    if (this.paystack.isConfigured() && reference.startsWith("ORD_")) {
      const verified = await this.paystack.verifyTransaction(reference);
      if (verified && verified.eventType === "PAYMENT_SUCCESS") {
        await this.processWebhookEvent(verified, "PAYSTACK");
        const updated = await prisma.audit.findUnique({ where: { id: verified.metadata.auditId } });
        if (updated) {
          return { status: "COMPLETED", auditId: updated.id, tier: updated.tier };
        }
      }
    }

    return { status: "PENDING" };
  }

  async markAuditAsPaidMock(
    auditId: string,
    tier: IntelligenceTier = "GROWTH",
    amount: number,
    provider: string = "mock",
    ref: string = `mock_${Date.now()}`
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
          status: "COMPLETED",
        },
      }),
      prisma.payment.create({
        data: {
          auditId,
          userId: audit.userId,
          businessId: audit.businessId,
          tier,
          amount,
          currency: "USD",
          status: "PAID",
          provider,
          transactionRef: ref,
          paidAt: new Date(),
        },
      }),
    ]);
  }
}

export const paymentService = new PaymentService();
