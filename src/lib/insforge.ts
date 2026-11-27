import { createClient } from "@insforge/sdk";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || "https://9jd3n6uj.us-east.insforge.app";
const anonKey = process.env.INSFORGE_API_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "ik_7d4c48efc1ca011cbf549a3fb7ac4df8";

export const insforge = createClient({
  baseUrl,
  anonKey,
});
