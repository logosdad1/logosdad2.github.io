import { prisma } from "./prisma";
import { SystemSettings } from "./types";

export const DEFAULT_SETTINGS: SystemSettings = {
  paidReportPrice: 10,
  tierPrices: {
    essential: 10,
    growth: 25,
    authority: 50,
  },
  scoreWeights: {
    websiteClarity: 20,
    aiVisibility: 20,
    searchLocal: 15,
    contentAuthority: 15,
    trustCredibility: 15,
    conversionReadiness: 15,
  },
  aiProvider: "gemini",
  allowMockCheckout: true,
  freeReportLimitsPerIp: 10,
  leadCaptureEmail: "hello@ordigit.com",
};

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const configs = await prisma.systemConfig.findMany();
    const settingsMap: Record<string, string> = {};
    configs.forEach((c) => {
      settingsMap[c.key] = c.value;
    });

    let tierPrices = DEFAULT_SETTINGS.tierPrices;
    if (settingsMap.tierPrices) {
      try {
        tierPrices = JSON.parse(settingsMap.tierPrices);
      } catch {}
    }

    return {
      paidReportPrice: settingsMap.paidReportPrice ? parseFloat(settingsMap.paidReportPrice) : DEFAULT_SETTINGS.paidReportPrice,
      tierPrices,
      scoreWeights: settingsMap.scoreWeights ? JSON.parse(settingsMap.scoreWeights) : DEFAULT_SETTINGS.scoreWeights,
      aiProvider: (settingsMap.aiProvider as any) || DEFAULT_SETTINGS.aiProvider,
      allowMockCheckout: settingsMap.allowMockCheckout !== undefined ? settingsMap.allowMockCheckout === "true" : DEFAULT_SETTINGS.allowMockCheckout,
      freeReportLimitsPerIp: settingsMap.freeReportLimitsPerIp ? parseInt(settingsMap.freeReportLimitsPerIp) : DEFAULT_SETTINGS.freeReportLimitsPerIp,
      leadCaptureEmail: settingsMap.leadCaptureEmail || DEFAULT_SETTINGS.leadCaptureEmail,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSystemSetting(key: string, value: string): Promise<void> {
  await prisma.systemConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
