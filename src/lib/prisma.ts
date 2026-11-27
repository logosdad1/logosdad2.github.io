import { PrismaClient } from "@prisma/client";

const INSFORGE_DATABASE_URL =
  "postgresql://postgres:f8e932d901ff6e1aab0156655266eb25@9jd3n6uj.us-east.database.insforge.app:5432/insforge?sslmode=require";

// Fall back to InsForge if DATABASE_URL is missing or still pointing to obsolete Supabase project
const rawUrl = process.env.DATABASE_URL || "";
const effectiveDatabaseUrl =
  rawUrl && !rawUrl.includes("supabase.com") && !rawUrl.includes("slgqmokdcthatskeczqk")
    ? rawUrl
    : INSFORGE_DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: effectiveDatabaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
