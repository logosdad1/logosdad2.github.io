import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const payment = await prisma.payment.findFirst({
      where: { transactionRef: sessionId },
      include: { audit: true }
    });

    if (!payment) {
      // Payment might still be pending webhook delivery
      return NextResponse.json({ status: "PENDING" });
    }

    if (payment.status === "FAILED") {
      return NextResponse.json({ status: "FAILED" });
    }

    // Since our webhook currently doesn't run a background job (no BullMQ installed),
    // it just marks the audit as PROCESSING. We'll automatically mock a completion after 
    // it reaches PROCESSING to simulate the asynchronous report generation.
    if (payment.audit.status === "PROCESSING") {
      // Auto-complete it for demo purposes. In production, a background worker would do this.
      await prisma.audit.update({
        where: { id: payment.auditId },
        data: { status: "COMPLETED" }
      });
      return NextResponse.json({ status: "COMPLETED", auditId: payment.auditId });
    }

    if (payment.audit.status === "COMPLETED") {
      return NextResponse.json({ status: "COMPLETED", auditId: payment.auditId });
    }

    return NextResponse.json({ status: payment.audit.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
