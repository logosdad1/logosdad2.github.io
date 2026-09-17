import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/payment";
import { IntelligenceTier } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { auditId, tier } = await req.json();
    if (!auditId) {
      return NextResponse.json({ error: "Audit ID is required" }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (user) {
      // Find the audit first to see if it needs a business
      const audit = await prisma.audit.findUnique({
        where: { id: auditId }
      });
      
      if (audit && !audit.userId) {
        let businessId = audit.businessId;
        
        // If the audit was created anonymously, it might not have a business attached
        if (!businessId) {
          const business = await prisma.business.create({
            data: {
              userId: user.userId,
              name: audit.businessName,
              websiteUrl: audit.url,
              industry: audit.industry,
              location: audit.location,
            }
          });
          businessId = business.id;
        }
        
        // Claim the audit for the logged-in user
        await prisma.audit.update({
          where: { id: auditId },
          data: { 
            userId: user.userId,
            businessId: businessId
          },
        });
      }
    }

    const targetTier: IntelligenceTier = tier || "GROWTH";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { checkoutUrl, isMock, finalPrice, isUpgrade } = await createCheckoutSession(
      auditId,
      targetTier,
      appUrl
    );

    return NextResponse.json({ checkoutUrl, isMock, finalPrice, isUpgrade, tier: targetTier });
  } catch (error: any) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
