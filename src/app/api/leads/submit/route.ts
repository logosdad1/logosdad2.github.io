import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { auditId, name, email, phone, company, service, message } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const lead = await prisma.agencyLead.create({
      data: {
        auditId: auditId || null,
        name,
        email,
        phone,
        company,
        service: service || "General Agency Inquiry",
        message,
        status: "NEW",
      },
    });

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error: any) {
    console.error("Lead submission error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
