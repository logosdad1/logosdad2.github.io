import crypto from "crypto";
import {
  IPaymentProvider,
  PaymentProviderName,
  CreateCheckoutParams,
  CreateCheckoutResult,
  VerifyWebhookParams,
  NormalizedWebhookEvent,
} from "./types";

export class PaystackProvider implements IPaymentProvider {
  readonly name: PaymentProviderName = "PAYSTACK";
  private secretKey: string;
  private defaultCurrency: string;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || "";
    this.defaultCurrency = process.env.PAYSTACK_CURRENCY || "USD";
  }

  isConfigured(): boolean {
    return Boolean(
      this.secretKey &&
        this.secretKey.length > 10 &&
        !this.secretKey.includes("placeholder")
    );
  }

  async createCheckoutSession(
    params: CreateCheckoutParams
  ): Promise<CreateCheckoutResult> {
    const {
      auditId,
      businessName,
      userEmail,
      userId,
      businessId,
      targetTier,
      finalPrice,
      isUpgrade,
      returnUrlBase,
    } = params;

    const currency = params.currency || this.defaultCurrency;
    // Paystack takes amount in subunit (cents or pesewas): multiply by 100
    const amountInSubunits = Math.round(finalPrice * 100);
    const reference = `ORD_${auditId.slice(-6)}_${Date.now()}`;
    const email = userEmail || `billing-${auditId.slice(-6)}@ordigit.com`;

    if (!this.isConfigured()) {
      // Return safe mock redirect for local development when keys are not configured
      return {
        checkoutUrl: `${returnUrlBase}/api/checkout/mock?auditId=${auditId}&tier=${targetTier}&ref=${reference}&provider=paystack`,
        providerReference: reference,
        provider: "MOCK",
        finalPrice,
        currency,
        isUpgrade,
        isMock: true,
      };
    }

    const payload = {
      email,
      amount: amountInSubunits,
      currency,
      reference,
      callback_url: `${returnUrlBase}/payment/success`,
      // Explicit channels: card and mobile_money (MTN, Telecel, AirtelTigo). Google Pay is offered through card if eligible.
      channels: ["card", "mobile_money"],
      metadata: {
        auditId,
        businessId: businessId || "",
        userId: userId || "",
        targetTier,
        isUpgrade,
        custom_fields: [
          {
            display_name: "Business Name",
            variable_name: "business_name",
            value: businessName,
          },
          {
            display_name: "Intelligence Tier",
            variable_name: "target_tier",
            value: targetTier,
          },
        ],
      },
    };

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      throw new Error(
        `Paystack checkout initialization failed: ${data.message || "Unknown error"}`
      );
    }

    return {
      checkoutUrl: data.data.authorization_url,
      providerReference: reference,
      provider: "PAYSTACK",
      finalPrice,
      currency,
      isUpgrade,
      isMock: false,
    };
  }

  async verifyWebhook(
    params: VerifyWebhookParams
  ): Promise<NormalizedWebhookEvent | null> {
    const { rawBody, signature } = params;

    if (!this.isConfigured()) {
      return null;
    }

    // Paystack signature verification using HMAC SHA-512
    const hash = crypto
      .createHmac("sha512", this.secretKey)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      console.warn("Paystack webhook signature mismatch.");
      return null;
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const data = event.data;
      if (data.status !== "success") {
        return null;
      }

      const amountInDollars = (data.amount || 0) / 100;
      const currency = data.currency || "USD";
      const metadata = data.metadata || {};

      return {
        eventType: "PAYMENT_SUCCESS",
        providerReference: data.reference,
        amount: amountInDollars,
        currency,
        status: "PAID",
        paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
        metadata: {
          auditId: metadata.auditId,
          targetTier: metadata.targetTier,
          userId: metadata.userId,
          businessId: metadata.businessId,
        },
        rawEvent: event,
      };
    }

    if (event.event === "refund.processed") {
      const data = event.data;
      return {
        eventType: "REFUND",
        providerReference: data.transaction_reference || data.reference,
        amount: (data.amount || 0) / 100,
        currency: data.currency || "USD",
        status: "REFUNDED",
        metadata: {},
        rawEvent: event,
      };
    }

    return {
      eventType: "OTHER",
      providerReference: event.data?.reference || "",
      amount: 0,
      currency: "USD",
      status: "PROCESSING",
      metadata: {},
      rawEvent: event,
    };
  }

  /**
   * Direct server-to-server transaction verification fallback
   */
  async verifyTransaction(reference: string): Promise<NormalizedWebhookEvent | null> {
    if (!this.isConfigured()) return null;

    try {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok || !data.status || data.data.status !== "success") {
        return null;
      }

      const tx = data.data;
      return {
        eventType: "PAYMENT_SUCCESS",
        providerReference: tx.reference,
        amount: (tx.amount || 0) / 100,
        currency: tx.currency || "USD",
        status: "PAID",
        paidAt: tx.paid_at ? new Date(tx.paid_at) : new Date(),
        metadata: {
          auditId: tx.metadata?.auditId,
          targetTier: tx.metadata?.targetTier,
          userId: tx.metadata?.userId,
          businessId: tx.metadata?.businessId,
        },
        rawEvent: data,
      };
    } catch (err: any) {
      console.error("Paystack transaction verification error:", err.message);
      return null;
    }
  }
}
