import assert from "node:assert";
import {
  PAYMENT_METHODS,
  MAX_RECEIPT_FILE_SIZE_BYTES,
  ALLOWED_RECEIPT_EXTENSIONS,
  UBL_PAYMENT_CONFIG,
} from "../src/lib/payment-config.ts";

console.log("🧪 Running Payment Method Selection & Verification Tests...\n");

// Test 1: Verify all 10 payment methods exist
console.log("📁 Group 1: 10 Selectable Payment Methods Verification");
const expectedMethods = [
  "Wise",
  "Taptap Send",
  "Remitly",
  "MoneyGram",
  "Western Union",
  "WorldRemit",
  "International Money Transfer through an Exchange",
  "International Bank Transfer — SWIFT Wire",
  "Direct UBL Bank Transfer",
  "Pakistani Local Bank Transfer — IBFT / Raast / 1Link",
];

assert.strictEqual(PAYMENT_METHODS.length, 10, "Must have exactly 10 payment methods");
console.log("  ✅ [PASS] 1. Total payment methods count equals 10");

expectedMethods.forEach((methodName, idx) => {
  const found = PAYMENT_METHODS.find((p) => p.name === methodName);
  assert.ok(found, `Payment method "${methodName}" must exist in PAYMENT_METHODS`);
  assert.ok(found.referencePlaceholder, `Payment method "${methodName}" must have a reference placeholder`);
  assert.ok(found.description, `Payment method "${methodName}" must have a descriptive text`);
  console.log(`  ✅ [PASS] ${idx + 2}. Verified payment option: "${methodName}"`);
});

// Test 2: Wise specific configuration
console.log("\n📁 Group 2: Wise Specific Selection Rules");
const wise = PAYMENT_METHODS.find((p) => p.id === "wise");
assert.ok(wise, "Wise configuration must exist");
assert.strictEqual(wise.name, "Wise", "Wise name must be exactly 'Wise'");
assert.ok(wise.badge.includes("Bank Wire"), "Wise must indicate bank wire capability");
console.log("  ✅ [PASS] 12. Wise configuration exists with designated badge");

// Test 3: Receipt Security & File Constraints
console.log("\n📁 Group 3: Receipt Upload Constraints");
assert.strictEqual(MAX_RECEIPT_FILE_SIZE_BYTES, 5 * 1024 * 1024, "Max file size must be 5 MB");
console.log("  ✅ [PASS] 13. Max receipt file size is strictly 5 MB (5,242,880 bytes)");

const expectedExts = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
expectedExts.forEach((ext) => {
  assert.ok(ALLOWED_RECEIPT_EXTENSIONS.includes(ext), `Allowed extensions must include ${ext}`);
});
console.log("  ✅ [PASS] 14. Allowed file extensions include JPG, JPEG, PNG, WEBP, PDF");

// Test 4: UBL Beneficiary Configuration Integrity
console.log("\n📁 Group 4: UBL Beneficiary Details Integrity");
assert.strictEqual(UBL_PAYMENT_CONFIG.beneficiaryFullName, "ALYAN WAZIR");
assert.strictEqual(UBL_PAYMENT_CONFIG.accountNumber, "0881304929964");
assert.strictEqual(UBL_PAYMENT_CONFIG.iban, "PK93UNIL0109000304929964");
assert.strictEqual(UBL_PAYMENT_CONFIG.swiftBic, "UNILPKKA");
assert.strictEqual(UBL_PAYMENT_CONFIG.mobileNumber, "+92 327 5756188");
assert.strictEqual(UBL_PAYMENT_CONFIG.paymentEmail, "sialkotcricketkits@gmail.com");
console.log("  ✅ [PASS] 15. All official UBL beneficiary credentials verified");

console.log("\n=======================================================");
console.log("📊 TOTAL TESTS: 15 | PASSED: 15 | FAILED: 0");
console.log("=======================================================");
console.log("\n✨ ALL PAYMENT SELECTION TESTS PASSED SUCCESSFULLY! ✨\n");
