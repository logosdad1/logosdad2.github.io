import { IntelligenceTier } from "../types";

export type PaymentProviderName = "PAYSTACK" | "STRIPE" | "MOCK";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export interface CreateCheckoutParams {
  auditId: string;
  businessName: string;
  userEmail?: string;
  userId?: string;
  businessId?: string;
  targetTier: IntelligenceTier;
  finalPrice: number; // In main currency units, e.g. 10, 25, 50
  currency: string;   // e.g. "USD" or "GHS"
  isUpgrade: boolean;
  returnUrlBase: string;
}

export interface CreateCheckoutResult {
  checkoutUrl: string;
  providerReference: string;
  provider: PaymentProviderName;
  finalPrice: number;
  currency: string;
  isUpgrade: boolean;
  isMock: boolean;
}

export interface VerifyWebhookParams {
  rawBody: string;
  signature: string;
}

export interface NormalizedWebhookEvent {
  eventType: "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "REFUND" | "OTHER";
  providerReference: string;
  amount: number; // In main currency units, e.g. 10.00, 25.00
  currency: string;
  status: PaymentStatus;
  paidAt?: Date;
  metadata: {
    auditId?: string;
    targetTier?: IntelligenceTier;
    userId?: string;
    businessId?: string;
  };
  rawEvent: any;
}

export interface IPaymentProvider {
  readonly name: PaymentProviderName;
  isConfigured(): boolean;
  createCheckoutSession(params: CreateCheckoutParams): Promise<CreateCheckoutResult>;
  verifyWebhook(params: VerifyWebhookParams): Promise<NormalizedWebhookEvent | null>;
}
