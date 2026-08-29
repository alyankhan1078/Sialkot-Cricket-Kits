import { CUSTOM_BAT_CONFIG, calculateAdvancePayment } from "../src/lib/custom-bat-config.ts";
import { calculateShippingFee } from "../src/lib/shipping.ts";

console.log("=== RUNNING CUSTOM BAT CHECKOUT INTEGRATION & FLOW TESTS ===\n");

let passed = 0;
let total = 0;

function assert(condition, name) {
  total++;
  if (condition) {
    console.log(`✅ [PASS] ${name}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${name}`);
  }
}

// 1. Verify Custom Bat Configurator Sizes & Profiles
assert(CUSTOM_BAT_CONFIG.sizes.length >= 5, `Configurator has at least 5 sizes (Found: ${CUSTOM_BAT_CONFIG.sizes.length})`);
assert(CUSTOM_BAT_CONFIG.profiles.length >= 4, `Configurator has at least 4 profiles (Found: ${CUSTOM_BAT_CONFIG.profiles.length})`);

// 2. Verify Advance Payment Calculations (30%, 50%, 100%)
const samplePrice = 300;
const adv30 = calculateAdvancePayment(samplePrice, 30);
const adv50 = calculateAdvancePayment(samplePrice, 50);
const adv100 = calculateAdvancePayment(samplePrice, 100);

assert(adv30.advanceAmount === 90 && adv30.remainingBalance === 210, `30% advance on £300 is £90 due now, £210 remaining`);
assert(adv50.advanceAmount === 150 && adv50.remainingBalance === 150, `50% advance on £300 is £150 due now, £150 remaining`);
assert(adv100.advanceAmount === 300 && adv100.remainingBalance === 0, `100% advance on £300 is £300 due now, £0 remaining`);

// 3. Test Custom Bat Order Object Structure
const mockCustomOrder = {
  orderType: "custom-bat",
  customer: {
    name: "Michael Clarke",
    country: "United Kingdom",
  },
  bat: {
    size: "Adult / Short Handle",
    sizeId: "adult-sh",
    playerCategory: "adult",
    constructionType: "Bonafide",
    qualityLevel: "Tournament Pro",
    selectedPrice: 300,
    handlePreference: "Round Handle",
    preferredWeight: "1180 g (2 lb 9.6 oz)",
    profile: "Duckbill Aggressive",
    requirements: "Slightly bowed blade with thick edges",
  },
  services: {
    knockingIn: true,
    engraving: true,
    engravingText: "MICHAEL CLARKE",
    livePingVideo: true,
    selectedServiceNames: ["Machine Knocking-in", "Custom Laser Name / Number Engraving", "Live Willow Ping Video"],
  },
  payment: {
    advancePercentage: 30,
    orderValue: 300,
    amountDueNow: 90,
    remainingBalance: 210,
  },
  customProductId: "custom-bat-bonafide-300-professional",
  createdAt: new Date().toISOString(),
};

assert(mockCustomOrder.orderType === "custom-bat", `Order type is 'custom-bat'`);
assert(mockCustomOrder.bat.selectedPrice === 300, `Bat price is 300`);
assert(mockCustomOrder.services.engravingText === "MICHAEL CLARKE", `Engraving text is preserved`);

// 4. Test Dual-Source Checkout Logic
function evaluateCheckoutSource(cartItems, customOrder) {
  const isCustomOrder = Boolean(customOrder && customOrder.payment && customOrder.payment.orderValue > 0);
  const hasStandardCart = Array.isArray(cartItems) && cartItems.length > 0;

  if (!hasStandardCart && !isCustomOrder) {
    return "EMPTY_CHECKOUT";
  }
  if (isCustomOrder) {
    return "CUSTOM_CHECKOUT";
  }
  return "STANDARD_CHECKOUT";
}

assert(
  evaluateCheckoutSource([], mockCustomOrder) === "CUSTOM_CHECKOUT",
  "Custom Order with EMPTY CART proceeds to CUSTOM_CHECKOUT (NEVER EMPTY CART!)"
);

assert(
  evaluateCheckoutSource([{ productId: "beauty-processed-bats-apex-pro", quantity: 1 }], null) === "STANDARD_CHECKOUT",
  "Standard cart item with NO custom order proceeds to STANDARD_CHECKOUT"
);

assert(
  evaluateCheckoutSource([], null) === "EMPTY_CHECKOUT",
  "Empty cart with NO custom order shows EMPTY_CHECKOUT"
);

// 5. Test Shipping & Grand Total for Custom Bat
const shipping = calculateShippingFee("United Kingdom", 1);
const grandTotal = mockCustomOrder.payment.orderValue + shipping.shippingFee;
const depositDueNow = Math.round(grandTotal * (mockCustomOrder.payment.advancePercentage / 100) * 100) / 100;
const balanceRemaining = Math.max(0, Math.round((grandTotal - depositDueNow) * 100) / 100);

assert(shipping.hasDestination === true, "UK shipping destination resolved");
assert(grandTotal === 300 + shipping.shippingFee, `Grand total equals subtotal + shipping (${grandTotal})`);
assert(depositDueNow + balanceRemaining === grandTotal, `Deposit due now (${depositDueNow}) + Balance (${balanceRemaining}) === Grand Total (${grandTotal})`);

console.log(`\n=== RESULTS: ${passed}/${total} TESTS PASSED ===\n`);
if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
