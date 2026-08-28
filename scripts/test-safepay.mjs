import crypto from "crypto";
import { verifySafepayWebhookSignature, buildSafepayCheckoutUrl } from "../src/lib/safepay.ts";
import { convertGbpToCurrency } from "../src/lib/currency.ts";
import { calculateShippingFee } from "../src/lib/shipping.ts";

async function runTests() {
  console.log("=================================================");
  console.log("🧪 RUNNING SAFEPAY PAKISTAN PAYMENT TEST SUITE");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  }

  // ── Test 1: Webhook HMAC SHA256 Signature Verification ──
  const testSecret = "whsec_test_secret_key_1234567890";
  const testPayload = JSON.stringify({
    event: "payment.completed",
    data: {
      token: "track_test_123",
      order_id: "SCK-2026-999",
      amount: 55500,
      currency: "PKR",
      state: "PAID",
      reference: "TXN-987654321",
    },
  });

  const validSignature = crypto
    .createHmac("sha256", testSecret)
    .update(testPayload)
    .digest("hex");

  const isSigValid = verifySafepayWebhookSignature(testPayload, validSignature, testSecret);
  assert(isSigValid === true, "Valid webhook signature is accepted");

  const isTamperedSigValid = verifySafepayWebhookSignature(
    testPayload + "tampered",
    validSignature,
    testSecret
  );
  assert(isTamperedSigValid === false, "Tampered payload is rejected");

  const isWrongSecretValid = verifySafepayWebhookSignature(
    testPayload,
    validSignature,
    "wrong_secret"
  );
  assert(isWrongSecretValid === false, "Invalid secret rejects signature");

  // ── Test 2: Hosted Checkout URL Generation ──
  const checkoutUrl = buildSafepayCheckoutUrl(
    "track_tok_abc123",
    "SCK-2026-001",
    "https://sialkotcricketkits.co.uk/checkout/success?orderId=SCK-2026-001",
    "https://sialkotcricketkits.co.uk/checkout?cancelled=true"
  );
  assert(checkoutUrl.includes("beacon=track_tok_abc123"), "Checkout URL includes beacon parameter");
  assert(checkoutUrl.includes("order_id=SCK-2026-001"), "Checkout URL includes order_id parameter");
  assert(checkoutUrl.includes("redirect_url="), "Checkout URL includes redirect_url parameter");

  // ── Test 3: Currency Conversion (GBP to PKR) ──
  const priceGbp = 150;
  const pricePkr = convertGbpToCurrency(priceGbp, "PKR");
  assert(pricePkr === 150 * 370, `Currency conversion accurate (£150 = Rs ${pricePkr})`);

  // ── Test 4: Deposit Calculations ──
  const subtotal = 300;
  const shipping = calculateShippingFee("United Kingdom", 2).shippingFee; // 20 + 8 = 28
  const grandTotal = subtotal + shipping; // 328

  // 50% deposit
  const dep50 = Math.round(grandTotal * 0.5 * 100) / 100;
  const bal50 = Math.round((grandTotal - dep50) * 100) / 100;
  assert(dep50 === 164 && bal50 === 164, "50% deposit and balance calculated accurately");

  // 35% deposit
  const dep35 = Math.round(grandTotal * 0.35 * 100) / 100;
  const bal35 = Math.round((grandTotal - dep35) * 100) / 100;
  assert(dep35 === 114.8 && bal35 === 213.2, "35% deposit and balance calculated accurately");

  // 100% full payment
  const dep100 = grandTotal;
  const bal100 = 0;
  assert(dep100 === 328 && bal100 === 0, "100% full payment leaves 0 balance");

  // ── Test 5: Shipping Fee Calculation for International & Domestic ──
  const pkShipping = calculateShippingFee("Pakistan", 1);
  assert(pkShipping.shippingFee === 3, "Domestic Pakistan shipping rate applied");

  const ukShipping = calculateShippingFee("United Kingdom", 1);
  assert(ukShipping.shippingFee === 20, "UK Express Courier rate applied");

  console.log("\n=================================================");
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
