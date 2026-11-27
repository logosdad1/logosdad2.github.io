import { paymentService } from "./payments/service";
import { IntelligenceTier } from "./types";
import { stripe } from "./payments/stripe-provider";

export { paymentService };

export async function calculateTierPrice(
  auditId: string,
  targetTier: IntelligenceTier
): Promise<{ finalPrice: number; isUpgrade: boolean; targetTier: IntelligenceTier }> {
  return paymentService.calculateTierPrice(auditId, targetTier);
}

export async function createCheckoutSession(
  auditId: string,
  targetTier: IntelligenceTier = "GROWTH",
  returnUrlBase: string,
  userInfo?: { userId?: string; email?: string }
): Promise<{ checkoutUrl: string; isMock: boolean; finalPrice: number; isUpgrade: boolean }> {
  const result = await paymentService.createCheckout(auditId, targetTier, returnUrlBase, userInfo);
  return {
    checkoutUrl: result.checkoutUrl,
    isMock: result.isMock,
    finalPrice: result.finalPrice,
    isUpgrade: result.isUpgrade,
  };
}

export async function markAuditAsPaid(
  auditId: string,
  tier: IntelligenceTier = "GROWTH",
  amount: number,
  provider: string = "paystack",
  ref: string = `ref_${Date.now()}`
): Promise<void> {
  return paymentService.markAuditAsPaidMock(auditId, tier, amount, provider, ref);
}
