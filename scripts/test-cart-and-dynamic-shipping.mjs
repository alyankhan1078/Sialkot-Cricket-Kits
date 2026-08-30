import assert from "node:assert";
import { calculateShippingFee, getProductShippingClass, SHIPPING_ZONES, SHIPPING_DESTINATIONS } from "../src/lib/shipping.ts";

console.log("\n=======================================================");
console.log("  DYNAMIC SHIPPING & CART COMBINATION TEST SUITE");
console.log("=======================================================\n");

// Test 1: Category Mapping
console.log("📁 Group 1: Product Shipping Class Resolution");
assert.strictEqual(getProductShippingClass("Beauty Processed Bats"), "BAT");
assert.strictEqual(getProductShippingClass("Bonafide Bats"), "BAT");
assert.strictEqual(getProductShippingClass("Junior & Harrow Bats"), "JUNIOR_BAT");
assert.strictEqual(getProductShippingClass("Batting Pads"), "PADS");
assert.strictEqual(getProductShippingClass("Batting Gloves"), "GLOVES");
assert.strictEqual(getProductShippingClass("Keeping Gloves"), "KEEPING_GLOVES");
assert.strictEqual(getProductShippingClass("Kit & Duffle Bags"), "BAG");
assert.strictEqual(getProductShippingClass("Helmets"), "HELMET");
assert.strictEqual(getProductShippingClass("Thigh Pads"), "THIGH_PAD");
assert.strictEqual(getProductShippingClass("Other Accessories"), "ACCESSORY");
console.log("  ✅ [PASS] 1. All 10 product categories correctly mapped to shipping classes");

// Test 2: Single-Item Shipping per Zone
console.log("\n📁 Group 2: Single-Item Shipping per Destination Zone");
const pkSingleBat = calculateShippingFee("Pakistan", [{ category: "Beauty Processed Bats", quantity: 1 }]);
assert.strictEqual(pkSingleBat.shippingFee, 3); // £3 ~ Rs 1000

const ukSingleBat = calculateShippingFee("United Kingdom", [{ category: "Beauty Processed Bats", quantity: 1 }]);
assert.strictEqual(ukSingleBat.shippingFee, 20); // £20

const usSingleBat = calculateShippingFee("United States", [{ category: "Beauty Processed Bats", quantity: 1 }]);
assert.strictEqual(usSingleBat.shippingFee, 26); // £26

const auSingleBat = calculateShippingFee("Australia", [{ category: "Beauty Processed Bats", quantity: 1 }]);
assert.strictEqual(auSingleBat.shippingFee, 30); // £30
console.log("  ✅ [PASS] 2. Single item base rates calculate accurately across PK, UK, US, AU");

// Test 3: Multiple Bats Increments
console.log("\n📁 Group 3: Multi-Bat Tiered Increments");
const ukTwoBats = calculateShippingFee("United Kingdom", [{ category: "Beauty Processed Bats", quantity: 2 }]);
assert.strictEqual(ukTwoBats.shippingFee, 28); // 20 + 8 = 28

const ukThreeBats = calculateShippingFee("United Kingdom", [{ category: "Beauty Processed Bats", quantity: 3 }]);
assert.strictEqual(ukThreeBats.shippingFee, 36); // 20 + 8 + 8 = 36
console.log("  ✅ [PASS] 3. Multi-bat increments applied correctly");

// Test 4: Dynamic Item Combinations (Bat + Gloves vs Bat + Pads vs Bat + Helmet vs Bat + Bag)
console.log("\n📁 Group 4: Dynamic Multi-Item Combinations (Bat + Gear)");
// 1 Bat (£20) + 1 Batting Gloves (add £3) = £23
const ukBatAndGloves = calculateShippingFee("United Kingdom", [
  { category: "Beauty Processed Bats", quantity: 1 },
  { category: "Batting Gloves", quantity: 1 },
]);
assert.strictEqual(ukBatAndGloves.shippingFee, 23);
console.log(`  • 1 Bat + Gloves to UK: £${ukBatAndGloves.shippingFee} (Base £20 + £3 glove add-on)`);

// 1 Bat (£20) + 1 Batting Pads (add £6) = £26
const ukBatAndPads = calculateShippingFee("United Kingdom", [
  { category: "Beauty Processed Bats", quantity: 1 },
  { category: "Batting Pads", quantity: 1 },
]);
assert.strictEqual(ukBatAndPads.shippingFee, 26);
console.log(`  • 1 Bat + Pads to UK: £${ukBatAndPads.shippingFee} (Base £20 + £6 pad add-on)`);

// 1 Bat (£20) + 1 Helmet (add £6) = £26
const ukBatAndHelmet = calculateShippingFee("United Kingdom", [
  { category: "Beauty Processed Bats", quantity: 1 },
  { category: "Helmets", quantity: 1 },
]);
assert.strictEqual(ukBatAndHelmet.shippingFee, 26);
console.log(`  • 1 Bat + Helmet to UK: £${ukBatAndHelmet.shippingFee} (Base £20 + £6 helmet add-on)`);

// Full Match Kit: 2 Bats + 1 Pads + 1 Gloves + 1 Helmet
// Base (£20) + 1 extra bat (£8) + pads (£6) + gloves (£3) + helmet (£6) = £43 (vs £94 uncombined!)
const ukFullKit = calculateShippingFee("United Kingdom", [
  { category: "Beauty Processed Bats", quantity: 2 },
  { category: "Batting Pads", quantity: 1 },
  { category: "Batting Gloves", quantity: 1 },
  { category: "Helmets", quantity: 1 },
]);
assert.strictEqual(ukFullKit.shippingFee, 43);
assert.strictEqual(ukFullKit.totalSaved, 57); // 5 items * 20 = 100 -> 100 - 43 = 57 saved!
console.log(`  • Full Cricket Kit to UK (2 Bats, Pads, Gloves, Helmet): £${ukFullKit.shippingFee} (Combined savings: £${ukFullKit.totalSaved})`);
console.log("  ✅ [PASS] 4. Dynamic item combinations calculated with accurate packing discounts");

// Test 5: Empty destination handling
console.log("\n📁 Group 5: Empty Destination Safety");
const emptyDest = calculateShippingFee("", [{ category: "Beauty Processed Bats", quantity: 1 }]);
assert.strictEqual(emptyDest.hasDestination, false);
assert.strictEqual(emptyDest.shippingFee, 0);
assert.strictEqual(emptyDest.displayAmount, "—");
console.log("  ✅ [PASS] 5. Empty destination safely returns hasDestination: false and shippingFee: 0");

console.log("\n=======================================================");
console.log("📊 ALL DYNAMIC SHIPPING TESTS PASSED (100%)");
console.log("=======================================================\n");
