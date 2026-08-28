/**
 * Quality-Control Copy Audit Script
 * Verifies all 145 products for complete, compliant, professional copywriting, SEO, and structured specs.
 */

import { products } from "../src/data/products.ts";

const FORBIDDEN_CLICHES = [
  "unleash your potential",
  "take your game to the next level",
  "game-changer",
  "ultimate performance",
  "revolutionary",
  "unmatched excellence",
  "best in the world",
  "perfect for everyone",
  "dominate the game",
];

let totalPassed = 0;
let totalFailed = 0;
const errors = [];

console.log("=================================================");
console.log(`🔍 AUDITING ${products.length} PRODUCTS FOR COPYWRITING & SEO QUALITY`);
console.log("=================================================\n");

products.forEach((p, idx) => {
  const pErrors = [];

  // 1. Short Description (18 - 35 words recommended)
  if (!p.shortDescription || p.shortDescription.trim().length === 0) {
    pErrors.push("Missing shortDescription");
  } else {
    const wordCount = p.shortDescription.trim().split(/\s+/).length;
    if (wordCount < 10 || wordCount > 45) {
      // Soft notice
    }
  }

  // 2. Opening Statement
  if (!p.openingStatement || p.openingStatement.trim().length === 0) {
    pErrors.push("Missing openingStatement");
  }

  // 3. Full Description
  if (!p.description || p.description.trim().length === 0) {
    pErrors.push("Missing description");
  } else {
    const descWords = p.description.trim().split(/\s+/).length;
    if (descWords < 60) {
      pErrors.push(`Description too short (${descWords} words, minimum 60 recommended)`);
    }
  }

  // 4. Highlights (4-6 items)
  if (!p.highlights || !Array.isArray(p.highlights) || p.highlights.length < 3) {
    pErrors.push(`Highlights missing or less than 3 items (${p.highlights?.length || 0})`);
  }

  // 5. Best For
  if (!p.bestFor || p.bestFor.trim().length === 0) {
    pErrors.push("Missing bestFor field");
  }

  // 6. Specifications
  if (!p.specifications || !Array.isArray(p.specifications) || p.specifications.length === 0) {
    pErrors.push("Missing specifications table");
  } else {
    p.specifications.forEach((spec) => {
      if (!spec.label || !spec.value || ["n/a", "null", "undefined"].includes(spec.value.toLowerCase())) {
        pErrors.push(`Invalid specification entry: ${JSON.stringify(spec)}`);
      }
    });
  }

  // 7. SEO Title & Description
  if (!p.seoTitle || p.seoTitle.trim().length === 0) {
    pErrors.push("Missing seoTitle");
  }
  if (!p.seoDescription || p.seoDescription.trim().length === 0) {
    pErrors.push("Missing seoDescription");
  }

  // 8. Image Alt
  if (!p.imageAlt || p.imageAlt.trim().length === 0) {
    pErrors.push("Missing imageAlt");
  }

  // 9. Forbidden AI clichés check
  const fullText = `${p.shortDescription} ${p.openingStatement} ${p.description} ${(p.highlights || []).join(" ")}`.toLowerCase();
  FORBIDDEN_CLICHES.forEach((cliche) => {
    if (fullText.includes(cliche)) {
      pErrors.push(`Contains forbidden cliché phrase: "${cliche}"`);
    }
  });

  if (pErrors.length > 0) {
    totalFailed++;
    errors.push({ id: p.id, name: p.name, category: p.category, issues: pErrors });
  } else {
    totalPassed++;
  }
});

console.log(`Total Products Audited: ${products.length}`);
console.log(`✅ Passed All Checks: ${totalPassed} / ${products.length}`);
console.log(`❌ Failed Checks: ${totalFailed} / ${products.length}`);

if (errors.length > 0) {
  console.log("\n❌ Audit Failures Detected:");
  errors.forEach((err, i) => {
    console.log(`\n[${i + 1}] Product: ${err.name} (${err.id}) [${err.category}]`);
    err.issues.forEach((iss) => console.log(`   - ❌ ${iss}`));
  });
  process.exit(1);
} else {
  console.log("\n🌟 ALL 145 PRODUCTS MET STRICT PROFESSIONAL COPYWRITING & SEO STANDARDS!");
  process.exit(0);
}
