import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/lib/payments/service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reference =
    searchParams.get("reference") ||
    searchParams.get("trxref") ||
    searchParams.get("session_id");

  if (!reference) {
    return NextResponse.json({ error: "Missing transaction reference or session_id" }, { status: 400 });
  }

  try {
    const result = await paymentService.verifyPaymentStatus(reference);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Payment status verification error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
