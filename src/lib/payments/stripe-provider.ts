import Stripe from "stripe";
import {
  IPaymentProvider,
  PaymentProviderName,
  CreateCheckoutParams,
  CreateCheckoutResult,
  VerifyWebhookParams,
  NormalizedWebhookEvent,
} from "./types";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
export const stripe = stripeSecretKey && !stripeSecretKey.includes("placeholder")
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-09-30.acacia" as any })
  : null;

export class StripeProvider implements IPaymentProvider {
  readonly name: PaymentProviderName = "STRIPE";
  private stripe: Stripe | null = stripe;
  private secretKey: string;
  private webhookSecret: string;

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY || "";
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
    if (this.secretKey && !this.secretKey.includes("placeholder")) {
      this.stripe = new Stripe(this.secretKey, {
        apiVersion: "2024-09-30.acacia" as any,
      });
    }
  }

  isConfigured(): boolean {
    return Boolean(this.stripe && this.secretKey && this.webhookSecret);
  }

  async createCheckoutSession(
    params: CreateCheckoutParams
  ): Promise<CreateCheckoutResult> {
    const {
      auditId,
      businessName,
      userId,
      businessId,
      targetTier,
      finalPrice,
      isUpgrade,
      returnUrlBase,
    } = params;

    const reference = `cs_stripe_${auditId.slice(-6)}_${Date.now()}`;

    if (!this.isConfigured() || !this.stripe) {
      return {
        checkoutUrl: `${returnUrlBase}/api/checkout/mock?auditId=${auditId}&tier=${targetTier}&provider=stripe`,
        providerReference: reference,
        provider: "MOCK",
        finalPrice,
        currency: "USD",
        isUpgrade,
        isMock: true,
      };
    }

    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${isUpgrade ? "Upgrade to " : ""}${targetTier} Intelligence - ${businessName}`,
              description: `Tiered AI Visibility Intelligence for ${businessName}`,
            },
            unit_amount: Math.round(finalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${returnUrlBase}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrlBase}/audit/${auditId}?canceled=true&tier=${targetTier}`,
      metadata: {
        auditId,
        businessId: businessId || "",
        userId: userId || "",
        targetTier,
      },
    });

    return {
      checkoutUrl: session.url || `${returnUrlBase}/payment/success?session_id=mock`,
      providerReference: session.id,
      provider: "STRIPE",
      finalPrice,
      currency: "USD",
      isUpgrade,
      isMock: false,
    };
  }

  async verifyWebhook(
    params: VerifyWebhookParams
  ): Promise<NormalizedWebhookEvent | null> {
    const { rawBody, signature } = params;

    if (!this.isConfigured() || !this.stripe) {
      return null;
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret
      );
    } catch (err: any) {
      console.warn("Stripe webhook constructEvent failed:", err.message);
      return null;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid") {
        return null;
      }

      const amount = (session.amount_total || 0) / 100;
      const currency = (session.currency || "USD").toUpperCase();
      const meta = session.metadata || {};

      return {
        eventType: "PAYMENT_SUCCESS",
        providerReference: session.id,
        amount,
        currency,
        status: "PAID",
        paidAt: new Date(),
        metadata: {
          auditId: meta.auditId,
          targetTier: meta.targetTier as any,
          userId: meta.userId,
          businessId: meta.businessId,
        },
        rawEvent: event,
      };
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string;
      return {
        eventType: "REFUND",
        providerReference: paymentIntentId || charge.id,
        amount: (charge.amount_refunded || 0) / 100,
        currency: (charge.currency || "USD").toUpperCase(),
        status: "REFUNDED",
        metadata: {},
        rawEvent: event,
      };
    }

    return {
      eventType: "OTHER",
      providerReference: (event.data.object as any)?.id || "",
      amount: 0,
      currency: "USD",
      status: "PROCESSING",
      metadata: {},
      rawEvent: event,
    };
  }
}
