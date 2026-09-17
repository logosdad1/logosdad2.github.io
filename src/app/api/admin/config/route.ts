import { NextRequest, NextResponse } from "next/server";
import { getSystemSettings, updateSystemSetting } from "@/lib/config";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await getSystemSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    if (body.tierPrices !== undefined) {
      await updateSystemSetting("tierPrices", JSON.stringify(body.tierPrices));
    }
    if (body.scoreWeights) {
      await updateSystemSetting("scoreWeights", JSON.stringify(body.scoreWeights));
    }
    if (body.aiProvider) {
      await updateSystemSetting("aiProvider", body.aiProvider);
    }
    if (body.allowMockCheckout !== undefined) {
      await updateSystemSetting("allowMockCheckout", String(body.allowMockCheckout));
    }

    const updated = await getSystemSettings();
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
