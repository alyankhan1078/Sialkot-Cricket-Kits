import assert from "node:assert";
import {
  ALL_COUNTRIES,
  POPULAR_DESTINATIONS,
  REMAINING_COUNTRIES,
  searchCountries,
  resolveCountry,
  isCountrySupported,
} from "../src/lib/countries.ts";
import {
  calculateShippingFee,
  getShippingDestination,
  SHIPPING_DESTINATIONS,
} from "../src/lib/shipping.ts";

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ Passed [${total}/26]: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ Failed [${total}/26]: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

console.log("\n=======================================================");
console.log("  DESTINATION COUNTRY & CHECKOUT 26-POINT TEST SUITE");
console.log("=======================================================\n");

// 1. Initial State Checks
test("Test 1: Empty country input produces uncalculated shipping result", () => {
  const result = calculateShippingFee("", 1);
  assert.strictEqual(result.hasDestination, false);
  assert.strictEqual(result.shippingFee, 0);
  assert.strictEqual(result.displayLabel, "Select destination");
  assert.strictEqual(result.displayAmount, "—");
});

test("Test 2: Null country input produces uncalculated shipping result", () => {
  const result = calculateShippingFee(null, 1);
  assert.strictEqual(result.hasDestination, false);
  assert.strictEqual(result.shippingFee, 0);
  assert.strictEqual(result.displayAmount, "—");
});

test("Test 3: Undefined country input produces uncalculated shipping result", () => {
  const result = calculateShippingFee(undefined, 2);
  assert.strictEqual(result.hasDestination, false);
  assert.strictEqual(result.shippingFee, 0);
});

test("Test 4: Unselected country does not fall back to UK rate (£20)", () => {
  const result = calculateShippingFee("", 1);
  assert.notStrictEqual(result.shippingFee, 20);
  assert.strictEqual(result.shippingFee, 0);
  assert.strictEqual(result.destination, null);
});

test("Test 5: isCountrySupported('') returns error 'Please select your destination country.'", () => {
  const validation = isCountrySupported("");
  assert.strictEqual(validation.valid, false);
  assert.strictEqual(validation.error, "Please select your destination country.");
});

test("Test 6: isCountrySupported(null) returns error 'Please select your destination country.'", () => {
  const validation = isCountrySupported(null);
  assert.strictEqual(validation.valid, false);
  assert.strictEqual(validation.error, "Please select your destination country.");
});

// 2. Strict India Exclusion Checks
test("Test 7: India (IN) does NOT exist anywhere in ALL_COUNTRIES", () => {
  const foundByCode = ALL_COUNTRIES.find((c) => c.code.toUpperCase() === "IN");
  const foundByName = ALL_COUNTRIES.find((c) => c.name.toLowerCase().includes("india"));
  assert.strictEqual(foundByCode, undefined);
  assert.strictEqual(foundByName, undefined);
});

test("Test 8: India (IN) does NOT exist in POPULAR_DESTINATIONS", () => {
  const found = POPULAR_DESTINATIONS.find((c) => c.code.toUpperCase() === "IN");
  assert.strictEqual(found, undefined);
});

test("Test 9: India (IN) does NOT exist in REMAINING_COUNTRIES", () => {
  const found = REMAINING_COUNTRIES.find((c) => c.code.toUpperCase() === "IN");
  assert.strictEqual(found, undefined);
});

test("Test 10: Search for 'India' returns empty array []", () => {
  const results = searchCountries("India");
  assert.deepStrictEqual(results, []);
});

test("Test 11: Search for 'IN' returns empty array []", () => {
  const results = searchCountries("IN");
  assert.deepStrictEqual(results, []);
});

test("Test 12: isCountrySupported('IN') returns valid=false with polite unavailable message", () => {
  const validation = isCountrySupported("IN");
  assert.strictEqual(validation.valid, false);
  assert.strictEqual(validation.error, "Delivery to the selected destination is currently unavailable.");
});

test("Test 13: isCountrySupported('India') returns valid=false with polite unavailable message", () => {
  const validation = isCountrySupported("India");
  assert.strictEqual(validation.valid, false);
  assert.strictEqual(validation.error, "Delivery to the selected destination is currently unavailable.");
});

test("Test 14: resolveCountry('India') returns null", () => {
  const resolved = resolveCountry("India");
  assert.strictEqual(resolved, null);
});

// 3. Search & Alias Matching Checks
test("Test 15: Search for 'Dubai' matches United Arab Emirates (AE)", () => {
  const results = searchCountries("Dubai");
  assert.ok(results.length > 0);
  assert.strictEqual(results[0].code, "AE");
  assert.strictEqual(results[0].name, "United Arab Emirates");
});

test("Test 16: Search for 'Abu Dhabi' matches United Arab Emirates (AE)", () => {
  const results = searchCountries("Abu Dhabi");
  assert.ok(results.length > 0);
  assert.strictEqual(results[0].code, "AE");
});

test("Test 17: Search for 'UAE' matches United Arab Emirates (AE)", () => {
  const results = searchCountries("UAE");
  assert.ok(results.length > 0);
  assert.strictEqual(results[0].code, "AE");
});

test("Test 18: Search for 'England' matches United Kingdom (GB)", () => {
  const results = searchCountries("England");
  assert.ok(results.length > 0);
  assert.strictEqual(results[0].code, "GB");
  assert.strictEqual(results[0].name, "United Kingdom");
});

test("Test 19: Search for 'Scotland' matches United Kingdom (GB)", () => {
  const results = searchCountries("Scotland");
  assert.ok(results.length > 0);
  assert.strictEqual(results[0].code, "GB");
});

test("Test 20: Search for 'USA' matches United States (US)", () => {
  const results = searchCountries("USA");
  assert.ok(results.length > 0);
  assert.strictEqual(results[0].code, "US");
  assert.strictEqual(results[0].name, "United States");
});

test("Test 21: Search for 'America' matches United States (US)", () => {
  const results = searchCountries("America");
  assert.ok(results.length > 0);
  assert.strictEqual(results[0].code, "US");
});

// 4. Shipping Calculation & Rate Checks
test("Test 22: Valid country United Arab Emirates (AE) resolves correctly and is supported", () => {
  const validation = isCountrySupported("United Arab Emirates");
  assert.strictEqual(validation.valid, true);
  assert.strictEqual(validation.country.code, "AE");
  assert.strictEqual(validation.country.name, "United Arab Emirates");
});

test("Test 23: Single bat to United Arab Emirates calculates base rate of £22", () => {
  const result = calculateShippingFee("United Arab Emirates", 1);
  assert.strictEqual(result.hasDestination, true);
  assert.strictEqual(result.shippingFee, 22);
  assert.strictEqual(result.countryCode, "AE");
});

test("Test 24: Single bat to Australia calculates base rate of £30", () => {
  const result = calculateShippingFee("Australia", 1);
  assert.strictEqual(result.hasDestination, true);
  assert.strictEqual(result.shippingFee, 30);
  assert.strictEqual(result.countryCode, "AU");
});

test("Test 25: 2 bats to Australia calculates tiered discounted rate of £42 (£30 + £12)", () => {
  const result = calculateShippingFee("Australia", 2);
  assert.strictEqual(result.hasDestination, true);
  assert.strictEqual(result.shippingFee, 42);
  assert.strictEqual(result.additionalFee, 12);
  assert.strictEqual(result.totalSaved, 18); // (£60 - £42)
});

test("Test 26: 3 bats to United Kingdom calculates tiered discounted rate of £36 (£20 + 2*£8)", () => {
  const result = calculateShippingFee("United Kingdom", 3);
  assert.strictEqual(result.hasDestination, true);
  assert.strictEqual(result.shippingFee, 36);
  assert.strictEqual(result.totalSaved, 24); // (£60 - £36)
});

console.log("\n=======================================================");
console.log(`  RESULT: ${passed} / ${total} Tests Passed Successfully (${Math.round((passed / total) * 100)}%)`);
console.log("=======================================================\n");

if (passed !== total) {
  process.exit(1);
}
