import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST() {
  await insforge.auth.signOut().catch(() => {});

  const response = NextResponse.json({ success: true });
  response.cookies.set("ordigit_token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("insforge_token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return response;
}
