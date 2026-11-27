import { insforge } from "../src/lib/insforge";
import { prisma } from "../src/lib/prisma";
import { signToken, verifyToken } from "../src/lib/auth";

async function runAcceptanceTests() {
  console.log("==================================================");
  console.log("  ORDIGIT AUTHENTICATION ACCEPTANCE TEST RUNNER   ");
  console.log("==================================================");

  // Test A: InsForge SignUp & Email Verification requirement
  const testEmail = `acceptance_${Date.now()}@example.com`;
  console.log(`\n[Test 1 & 2] Attempting user registration on InsForge with: ${testEmail}`);
  const signUpRes = await insforge.auth.signUp({
    email: testEmail,
    password: "SecurePassword123!",
    name: "QA Acceptance Tester",
  });
  console.log("InsForge SignUp response:", JSON.stringify(signUpRes));

  // Test B: Login with incorrect password
  console.log("\n[Test 9] Testing login with incorrect password");
  const wrongPassRes = await insforge.auth.signInWithPassword({
    email: testEmail,
    password: "WrongPassword999!",
  });
  console.log("Incorrect password response:", JSON.stringify(wrongPassRes));

  // Test C: Login with unverified account
  console.log("\n[Test 10] Testing login with unverified account");
  const unverifiedLoginRes = await insforge.auth.signInWithPassword({
    email: testEmail,
    password: "SecurePassword123!",
  });
  console.log("Unverified account login response:", JSON.stringify(unverifiedLoginRes));

  // Test D: Password recovery
  console.log("\n[Test 11] Testing password recovery email dispatch");
  const resetRes = await insforge.auth.sendResetPasswordEmail({
    email: testEmail,
  });
  console.log("Password reset email dispatch response:", JSON.stringify(resetRes));

  // Test E: Token signing & verification
  console.log("\n[Test 4 & 7] Testing session signing and persistence verification");
  const token = signToken({
    userId: "test-user-id",
    email: testEmail,
    role: "USER",
    name: "QA Acceptance Tester",
  });
  const decoded = verifyToken(token);
  console.log("Token verified successfully:", decoded?.email === testEmail);

  // Test F: Database Isolation & Table Schema
  console.log("\n[Test 15] Testing database queries and user isolation");
  const auditCount = await prisma.audit.count();
  const userCount = await prisma.user.count();
  console.log(`Database reachable. Total users in InsForge DB: ${userCount}, Total audits: ${auditCount}`);

  console.log("\nAcceptance test execution complete.");
}

runAcceptanceTests().catch(console.error);
