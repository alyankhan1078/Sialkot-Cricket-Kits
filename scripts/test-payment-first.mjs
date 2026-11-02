/**
 * Sialkot Cricket Kits — Payment-first custom bat order tests
 *
 * Part 1 (always): pure pricing / sanitising / resume-link logic.
 * Part 2 (with --base=URL): calls a RUNNING server and checks that the order API
 * refuses every request that is missing a payment requirement or tampers with
 * the price. Run part 2 only against a local or preview server, never against
 * production with real customer data.
 *
 *   node scripts/test-payment-first.mjs
 *   node scripts/test-payment-first.mjs --base=http://localhost:3000
 */

import {
  CUSTOM_BAT_CONFIG,
  resolveCustomBatPrice,
  customProductIdFor,
  sanitizeCustomBatSpec,
  buildResumeOrderFromLead,
  encodeResumePayload,
  decodeResumePayload,
} from "../src/lib/custom-bat-config.ts";

let passed = 0;
let failed = 0;
function assert(condition, name, details = "") {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.error(`  ❌ ${name} ${details}`);
    failed++;
  }
}

console.log("\n=== Part 1: server-trusted custom bat pricing ===");

for (const tier of CUSTOM_BAT_CONFIG.beautyProcessedTiers) {
  const id = customProductIdFor({ construction: "Beauty Processed", price: tier.price });
  assert(resolveCustomBatPrice(id)?.price === tier.price, `Beauty Processed £${tier.price} → ${id}`);
}
for (const tier of CUSTOM_BAT_CONFIG.bonafideTiers) {
  const id = customProductIdFor({ construction: "Bonafide", price: tier.price });
  assert(resolveCustomBatPrice(id)?.price === tier.price, `Bonafide £${tier.price} → ${id}`);
}
for (const tier of CUSTOM_BAT_CONFIG.budgetTiers) {
  const id = customProductIdFor({ construction: "", price: tier.price, budgetMode: true });
  assert(resolveCustomBatPrice(id)?.price === tier.price, `Budget £${tier.price} → ${id}`);
}

// IDs that the old configurator produced must still price correctly.
assert(resolveCustomBatPrice("custom-bat-bonafide-500-top-spec")?.price === 500, "Legacy ID bonafide-500-top-spec still £500");
assert(resolveCustomBatPrice("custom-bat-beauty-processed-250-top")?.price === 250, "Legacy ID beauty-processed-250-top still £250");

// Tampering attempts must be rejected.
assert(resolveCustomBatPrice("custom-bat-beauty-processed-1-essential") === null, "Rejects £1 tampered price");
assert(resolveCustomBatPrice("custom-bat-beauty-processed-140-elite") === null, "Rejects mismatched tier slug");
assert(resolveCustomBatPrice("custom-bat-bonafide-500-essential") === null, "Rejects wrong slug for £500");
assert(resolveCustomBatPrice("custom-bat-order") === null, "Rejects generic custom-bat-order");
assert(resolveCustomBatPrice("custom-bat-recommended-build-999") === null, "Rejects unknown budget");
assert(resolveCustomBatPrice("") === null, "Rejects empty ID");

console.log("\n=== Part 1: custom spec sanitising ===");
const spec = sanitizeCustomBatSpec({
  size: "Adult / Short Handle",
  construction: "Bonafide",
  tier: "Elite",
  handle: "Round Handle",
  weight: "1180 g",
  profile: "Mid Middle Profile",
  services: ["Knocking-In", 42, "x".repeat(500)],
  engravingText: "A".repeat(200),
  requirements: "line1\u0000line2",
  injected: "<script>",
});
assert(spec && !("injected" in spec), "Unknown fields are dropped");
assert(spec && spec.engravingText.length === 60, "Engraving text is capped at 60 characters");
assert(spec && spec.services.every((s) => typeof s === "string" && s.length <= 80), "Services are strings ≤ 80 chars");
assert(spec && !spec.requirements.includes("\u0000"), "Control characters are removed");
assert(sanitizeCustomBatSpec(null) === null && sanitizeCustomBatSpec("x") === null, "Non-objects return null");

console.log("\n=== Part 1: 'complete your order' links for unpaid leads ===");
// Shapes copied from real unpaid leads saved by the old configurator.
const leadFull = {
  size: "Adult / Short Handle", sizeId: "adult-sh", price: 140, tierLabel: "Essential Custom",
  construction: "Beauty Processed", handle: "Round Handle", weight: "1140 g (2.8 lbs)",
  profile: "Full Profile (No Concaving)", services: ["Professional Knocking-In & Oiling"],
  engraving: { text: "niazi", selected: true, confirmed: true }, advancePercent: 30, notes: "",
};
const leadBonafide = { ...leadFull, price: 500, tierLabel: "Signature / Top Class", construction: "Bonafide", advancePercent: 50 };
const leadMinimal = { size: "Adult / Long Handle", price: 230, tierLabel: "Premium", advancePercent: 30 };

const r1 = buildResumeOrderFromLead(leadFull, { name: "Customer", country: "Unspecified" });
assert(r1 && r1.payment.orderValue === 140 && r1.payment.amountDueNow === 42, "Full lead → £140, £42 due at 30%");
assert(r1 && r1.customer.country === "", "'Unspecified' country is not carried over");
assert(r1 && r1.services.engravingText === "niazi", "Engraving text carried over");
const r2 = buildResumeOrderFromLead(leadBonafide, { name: "Hassan", country: "Pakistan" });
assert(r2 && r2.payment.orderValue === 500 && r2.payment.amountDueNow === 250, "Bonafide lead → £500, £250 due at 50%");
assert(buildResumeOrderFromLead(leadMinimal, { name: "Max" }) === null, "Lead without construction falls back to configurator");

const encoded = encodeResumePayload(r1);
assert(/^[A-Za-z0-9_-]+$/.test(encoded), "Resume payload is URL-safe");
const decoded = decodeResumePayload(encoded);
assert(decoded && decoded.payment.orderValue === 140, "Resume payload round-trips");

const tampered = encodeResumePayload({ ...r1, payment: { ...r1.payment, orderValue: 1, amountDueNow: 0.3 } });
const decodedTampered = decodeResumePayload(tampered);
assert(decodedTampered && decodedTampered.payment.orderValue === 140, "Tampered link price is re-priced to £140");
assert(decodeResumePayload("not-base64!!") === null, "Garbage resume value is ignored");

// ─── Part 2: live API checks ────────────────────────────────────────────────
const baseArg = process.argv.find((a) => a.startsWith("--base="));
if (baseArg) {
  const base = baseArg.slice("--base=".length).replace(/\/$/, "");
  console.log(`\n=== Part 2: order API at ${base} ===`);

  const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const customer = {
    customerName: "John Smith",
    customerEmail: "john.smith@example.com",
    customerPhone: "+447911123456",
    phoneDialCode: "+44",
    country: "United Kingdom",
    countryCode: "GB",
    address: "10 Example Street",
    city: "London",
    state: "",
    postalCode: "SW1A 2AA",
  };

  let ipCounter = 10;
  async function submit(overrides = {}, { receipt = new Blob([PNG], { type: "image/png" }), receiptName = "receipt.png", omit = [] } = {}) {
    const fields = {
      ...customer,
      depositPercent: "30",
      policiesAccepted: "true",
      policyVersion: "1.0",
      senderName: "John Smith",
      provider: "UBL Bank Transfer",
      transferReference: "TXN-TEST-001",
      amountSent: "42",
      currencySent: "GBP",
      transferDate: "2026-11-02",
      orderId: "SCK-2026-123456",
      items: JSON.stringify([
        {
          productId: "custom-bat-beauty-processed-140-essential",
          name: "Custom Cricket Bat",
          price: 140,
          quantity: 1,
          customSpec: { size: "Adult / Short Handle", construction: "Beauty Processed", tier: "Essential Custom", profile: "Duckbill Profile" },
        },
      ]),
      ...overrides,
    };
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) if (!omit.includes(k)) fd.append(k, v);
    if (receipt && !omit.includes("receipt")) fd.append("receipt", receipt, receiptName);
    // Different fake IPs so the rate limiter does not interfere with these checks.
    const res = await fetch(`${base}/api/checkout/submit-manual-order`, {
      method: "POST",
      body: fd,
      headers: { "x-forwarded-for": `198.51.100.${ipCounter++}` },
    });
    return { status: res.status, body: await res.json().catch(() => ({})) };
  }

  let r = await submit({}, { omit: ["receipt"] });
  assert(r.status === 400 && /receipt/i.test(r.body.error), "No receipt → rejected", JSON.stringify(r));

  r = await submit({ policiesAccepted: "false" });
  assert(r.status === 400 && /polic/i.test(r.body.error), "Terms not accepted → rejected", JSON.stringify(r));

  r = await submit({ transferReference: "" });
  assert(r.status === 400 && /reference/i.test(r.body.error), "No transfer reference → rejected", JSON.stringify(r));

  r = await submit({ amountSent: "0" });
  assert(r.status === 400 && /amount/i.test(r.body.error), "No amount paid → rejected", JSON.stringify(r));

  r = await submit({}, { receipt: new Blob([new Uint8Array([1, 2, 3, 4])], { type: "application/zip" }), receiptName: "x.zip" });
  assert(r.status === 400 && /format/i.test(r.body.error), "Wrong file type → rejected", JSON.stringify(r));

  r = await submit({}, { receipt: new Blob([new Uint8Array(5 * 1024 * 1024 + 10)], { type: "image/png" }) });
  assert(r.status === 400 && /5 MB/i.test(r.body.error), "Receipt over 5 MB → rejected", JSON.stringify(r));

  r = await submit({
    items: JSON.stringify([{ productId: "custom-bat-beauty-processed-1-essential", name: "Custom", price: 1, quantity: 1 }]),
  });
  assert(r.status === 400 && /could not be priced/i.test(r.body.error), "Tampered £1 custom price → rejected", JSON.stringify(r));

  r = await submit({
    items: JSON.stringify([{ productId: "custom-bat-order", name: "Custom bat", price: 5, quantity: 1 }]),
  });
  assert(r.status === 400, "Generic custom-bat-order ID → rejected", JSON.stringify(r));

  // A fully valid request passes every check. Without a database configured
  // (local test) it then stops at the receipt upload; with a database it succeeds.
  r = await submit();
  assert(
    r.status === 200 || (r.status === 500 && /(receipt|database|supabase|configured|storage)/i.test(r.body.error || "")),
    "Complete, paid request passes all validation",
    JSON.stringify(r)
  );

  const legacy = await fetch(`${base}/api/checkout/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerName: "x", items: [{ name: "y", price: 1 }] }),
  });
  assert(legacy.status === 410, "Retired unpaid-order endpoint returns 410");

  console.log(`\n=== Part 2: enquiry spam protection ===`);
  async function enquiry(body, ip) {
    const res = await fetch(`${base}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(body),
    });
    return { status: res.status, body: await res.json().catch(() => ({})) };
  }
  const human = { type: "contact", name: "Ali", email: "ali@example.com", message: "Do you ship to Dubai?", elapsedMs: 15000 };
  let e = await enquiry({ ...human, website: "http://spam.example" }, "203.0.113.1");
  assert(e.status === 200 && e.body.success, "Honeypot filled → silently accepted (not stored)");
  e = await enquiry({ ...human, elapsedMs: 300 }, "203.0.113.2");
  assert(e.status === 200 && e.body.success, "Submitted in 0.3 s → silently accepted (not stored)");
  e = await enquiry({ ...human, email: "not-an-email" }, "203.0.113.3");
  assert(e.status === 400, "Invalid email → rejected");
  let last;
  for (let i = 0; i < 6; i++) last = await enquiry({ ...human, message: `Question ${i}` }, "203.0.113.9");
  assert(last.status === 429, "6th message in 10 minutes from one IP → rate limited", JSON.stringify(last));

  const settings = await (await fetch(`${base}/api/settings`)).json();
  const keys = Object.keys(settings.data || {});
  assert(
    !keys.some((k) => /secret|webhook/i.test(k)) && !keys.includes("accountNumber"),
    "Public settings expose no secrets",
    keys.join(",")
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
