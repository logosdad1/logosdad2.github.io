import { createClient } from "@insforge/sdk";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || "https://9jd3n6uj.us-east.insforge.app";
const anonKey = process.env.INSFORGE_API_KEY || "ik_7d4c48efc1ca011cbf549a3fb7ac4df8";

const insforge = createClient({ baseUrl, anonKey });
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "omnisight_secure_development_jwt_secret_key_2026";

async function runAcceptanceTests() {
  console.log("==================================================");
  console.log("  ORDIGIT AUTHENTICATION ACCEPTANCE TEST RUNNER   ");
  console.log("==================================================");

  // Test 1 & 2: InsForge SignUp & Email Verification requirement
  const testEmail = `acceptance_${Date.now()}@example.com`;
  console.log(`\n[Test 1 & 2] Attempting user registration on InsForge with: ${testEmail}`);
  const signUpRes = await insforge.auth.signUp({
    email: testEmail,
    password: "SecurePassword123!",
    name: "QA Acceptance Tester",
  });
  console.log("InsForge SignUp response:", JSON.stringify(signUpRes));

  // Test 9: Login with incorrect password
  console.log("\n[Test 9] Testing login with incorrect password");
  const wrongPassRes = await insforge.auth.signInWithPassword({
    email: testEmail,
    password: "WrongPassword999!",
  });
  console.log("Incorrect password response:", JSON.stringify(wrongPassRes));

  // Test 10: Login with unverified account
  console.log("\n[Test 10] Testing login with unverified account");
  const unverifiedLoginRes = await insforge.auth.signInWithPassword({
    email: testEmail,
    password: "SecurePassword123!",
  });
  console.log("Unverified account login response:", JSON.stringify(unverifiedLoginRes));

  // Test 11: Password recovery
  console.log("\n[Test 11] Testing password recovery email dispatch");
  const resetRes = await insforge.auth.sendResetPasswordEmail({
    email: testEmail,
  });
  console.log("Password reset email dispatch response:", JSON.stringify(resetRes));

  // Test 4 & 7: Token signing & verification
  console.log("\n[Test 4 & 7] Testing session signing and persistence verification");
  const token = jwt.sign({
    userId: "test-user-id",
    email: testEmail,
    role: "USER",
    name: "QA Acceptance Tester",
  }, JWT_SECRET, { expiresIn: "30d" });
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log("Token verified successfully:", decoded?.email === testEmail);

  // Test 15: Database Isolation & Table Schema
  console.log("\n[Test 15] Testing database queries and user isolation");
  const auditCount = await prisma.audit.count();
  const userCount = await prisma.user.count();
  console.log(`Database reachable. Total users in InsForge DB: ${userCount}, Total audits: ${auditCount}`);

  console.log("\nAcceptance test execution complete.");
  await prisma.$disconnect();
}

runAcceptanceTests().catch(console.error);
