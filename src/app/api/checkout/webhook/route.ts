// Deprecated endpoint: Forwarding cleanly to /api/stripe/webhook to ensure a single canonical webhook handler
import { NextRequest } from "next/server";
import { POST as stripePost } from "@/app/api/stripe/webhook/route";

export async function POST(req: NextRequest) {
  return stripePost(req);
}
