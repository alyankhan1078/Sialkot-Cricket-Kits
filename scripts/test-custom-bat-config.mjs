import { CUSTOM_BAT_CONFIG, calculateAdvancePayment, generateCustomBatWhatsAppMessage } from "../src/lib/custom-bat-config.ts";
import { products } from "../src/data/products.ts";

console.log("=== RUNNING CUSTOM BAT CONFIGURATOR VERIFICATION SUITE ===\n");

let passed = 0;
let total = 0;

function assert(condition, testName) {
  total++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
  }
}

// 1. Check Adult Beauty Processed Tiers
const bpPrices = CUSTOM_BAT_CONFIG.beautyProcessedTiers.map(t => t.price);
assert(
  JSON.stringify(bpPrices) === JSON.stringify([140, 190, 220, 230, 250]),
  `Beauty Processed tiers match £140, £190, £220, £230, £250 (Found: ${bpPrices.join(", ")})`
);

// 2. Check Adult Bonafide Tiers
const bonafidePrices = CUSTOM_BAT_CONFIG.bonafideTiers.map(t => t.price);
assert(
  JSON.stringify(bonafidePrices) === JSON.stringify([220, 250, 300, 400, 500]),
  `Bonafide tiers match £220, £250, £300, £400, £500 (Found: ${bonafidePrices.join(", ")})`
);

// 3. Check Bonafide Top Spec Badge
const topSpecTier = CUSTOM_BAT_CONFIG.bonafideTiers.find(t => t.price === 500);
assert(
  topSpecTier && topSpecTier.isTopSpec && topSpecTier.badge === "TOP SPEC",
  "Bonafide £500 tier has TOP SPEC badge"
);

// 4. Check Budget Recommendation Tiers
const budgetPrices = CUSTOM_BAT_CONFIG.budgetTiers.map(t => t.price);
assert(
  JSON.stringify(budgetPrices) === JSON.stringify([150, 200, 300, 400, 500]),
  `Budget tiers match £150, £200, £300, £400, £500 (Found: ${budgetPrices.join(", ")})`
);

// 5. Check Advance Payment Calculations (30%, 50%, 100%)
const testPrice = 300;
const calc30 = calculateAdvancePayment(testPrice, 30);
assert(
  calc30.advanceAmount === 90 && calc30.remainingBalance === 210 && calc30.percent === 30,
  `30% advance on £300 equals £90 deposit and £210 remaining balance (Got: ${calc30.advanceAmount} / ${calc30.remainingBalance})`
);

const calc50 = calculateAdvancePayment(testPrice, 50);
assert(
  calc50.advanceAmount === 150 && calc50.remainingBalance === 150 && calc50.percent === 50,
  `50% advance on £300 equals £150 deposit and £150 remaining balance (Got: ${calc50.advanceAmount} / ${calc50.remainingBalance})`
);

const calc100 = calculateAdvancePayment(testPrice, 100);
assert(
  calc100.advanceAmount === 300 && calc100.remainingBalance === 0 && calc100.percent === 100,
  `100% advance on £300 equals £300 deposit and £0 remaining balance (Got: ${calc100.advanceAmount} / ${calc100.remainingBalance})`
);

// 6. Minimum 30% enforcement
const calcUnder30 = calculateAdvancePayment(testPrice, 10);
assert(
  calcUnder30.percent === 30 && calcUnder30.advanceAmount === 90,
  "Selecting less than 30% safely defaults to 30% minimum advance"
);

// 7. Verify Junior Bat Single-Source of Truth Pricing
const size4 = products.find(p => p.id === "junior-and-harrow-bats-size-4");
const size5 = products.find(p => p.id === "junior-and-harrow-bats-size-5");
const size6 = products.find(p => p.id === "junior-and-harrow-bats-size-6");
const harrow = products.find(p => p.id === "junior-and-harrow-bats-harrow-size");

assert(size4 && size4.price === 70, `Size 4 catalogue price is £70 (Found: £${size4?.price})`);
assert(size5 && size5.price === 85, `Size 5 catalogue price is £85 (Found: £${size5?.price})`);
assert(size6 && size6.price === 105, `Size 6 catalogue price is £105 (Found: £${size6?.price})`);
assert(harrow && harrow.price === 110, `Harrow size catalogue price is £110 (Found: £${harrow?.price})`);

// 8. Verify Custom Bat Products in products.ts
const customBatBeauty140 = products.find(p => p.id.includes("custom-bat-beauty-processed-140"));
const customBatBonafide300 = products.find(p => p.id.includes("custom-bat-bonafide-300"));
const customBatBonafide500 = products.find(p => p.id.includes("custom-bat-bonafide-500"));

assert(Boolean(customBatBeauty140), "Custom Bat Beauty Processed £140 is in products catalogue");
assert(Boolean(customBatBonafide300), "Custom Bat Bonafide £300 is in products catalogue");
assert(Boolean(customBatBonafide500), "Custom Bat Bonafide £500 is in products catalogue");

// 9. Verify Profiles & Services
assert(CUSTOM_BAT_CONFIG.profiles.length === 6, "All 6 profiles (Duckbill, Mid, High, Full, Concave, Traditional) are defined");
assert(CUSTOM_BAT_CONFIG.services.length === 3, "All 3 additional services are defined");

// 10. Verify WhatsApp Message Generator
const waMsg = generateCustomBatWhatsAppMessage({
  name: "Test User",
  country: "United Kingdom",
  size: "Adult / Short Handle",
  construction: "Bonafide",
  priceLevel: 300,
  priceLabel: "Professional",
  handle: "Short Handle",
  weight: "1180 g",
  profile: "Duckbill Profile",
  services: ["Professional Knocking-In & Oiling", "Live Ping Video Approval"],
  notes: "Thick 40mm edges please",
  advancePercent: 30,
  advanceAmount: 90,
  remainingBalance: 210,
});

assert(waMsg.includes("Custom Bat Enquiry"), "WhatsApp message contains custom bat heading");
assert(waMsg.includes("Bonafide"), "WhatsApp message contains construction");
assert(waMsg.includes("£300"), "WhatsApp message contains total price");
assert(waMsg.includes("30%"), "WhatsApp message contains advance percentage");
assert(waMsg.includes("£90 due now"), "WhatsApp message contains advance amount due now");
assert(waMsg.includes("£210"), "WhatsApp message contains remaining balance");

console.log(`\n=== RESULTS: ${passed}/${total} TESTS PASSED ===\n`);
if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
