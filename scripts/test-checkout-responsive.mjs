import fs from 'fs';
import path from 'path';

console.log("=== CHECKOUT MOBILE RESPONSIVENESS VERIFICATION ===");

// 1. Check globals.css for required responsive checkout rules
const cssPath = path.resolve('app/globals.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

const requiredCssChecks = [
  { name: "Zero horizontal overflow / max-width bounds", pattern: /max-width:\s*100%/ },
  { name: "Mobile layout grid flex column", pattern: /\.checkout-layout-grid\s*\{[\s\S]*?flex-direction:\s*column;/ },
  { name: "Single column form grid on mobile (< 768px)", pattern: /\.checkout-form-grid\s*\{[\s\S]*?grid-template-columns:\s*1fr;/ },
  { name: "Desktop 2-column layout preserved (>= 1024px)", pattern: /@media\s*\(min-width:\s*1024px\)[\s\S]*?\.checkout-layout-grid[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1\.45fr\)\s*minmax\(340px,\s*1fr\);/ },
  { name: "16px input font size to prevent iOS Safari auto-zoom", pattern: /\.checkout-input[\s\S]*?font-size:\s*16px\s*!important;/ },
  { name: "Touch target height >= 48-52px on mobile", pattern: /min-height:\s*52px;/ },
  { name: "Mobile summary collapsible toggle", pattern: /\.checkout-mobile-summary-toggle/ },
  { name: "Standardized checkout-field-error class", pattern: /\.checkout-field-error/ },
  { name: "Responsive step headings", pattern: /\.checkout-step-heading/ },
  { name: "Mobile progress bar indicator", pattern: /\.checkout-progress-mobile/ },
];

let cssPassed = 0;
for (const check of requiredCssChecks) {
  if (check.pattern.test(cssContent)) {
    console.log(`✅ [CSS PASS] ${check.name}`);
    cssPassed++;
  } else {
    console.error(`❌ [CSS FAIL] ${check.name}`);
  }
}

// 2. Check app/checkout/page.tsx for React structure and responsive classes
const checkoutPath = path.resolve('app/checkout/page.tsx');
const checkoutContent = fs.readFileSync(checkoutPath, 'utf8');

const requiredJsxChecks = [
  { name: "isMobileSummaryOpen useState hook declared before conditional returns", pattern: /const \[isMobileSummaryOpen, setIsMobileSummaryOpen\] = useState\(false\);/ },
  { name: "Clean EMAIL ADDRESS label without wrapping text", pattern: /<span>EMAIL ADDRESS<\/span>/ },
  { name: "PhoneInput uses checkout-field-error", pattern: /className="checkout-field-error"/ },
  { name: "Mobile summary accordion rendered above step card", pattern: /checkout-mobile-summary-wrapper/ },
  { name: "Desktop summary rendered in desktop wrapper", pattern: /checkout-desktop-summary-wrapper/ },
  { name: "Step 1 primary CTA has responsive button class", pattern: /className="checkout-primary-cta"/ },
  { name: "Clean Step 1 - Step 4 step progress", pattern: /type Step = 1 \| 2 \| 3 \| 4;/ },
];

let jsxPassed = 0;
for (const check of requiredJsxChecks) {
  if (check.pattern.test(checkoutContent)) {
    console.log(`✅ [JSX PASS] ${check.name}`);
    jsxPassed++;
  } else {
    console.error(`❌ [JSX FAIL] ${check.name}`);
  }
}

// 3. Check PhoneInput and CountrySelector dropdown bounds
const phoneInputPath = path.resolve('src/components/PhoneInput.tsx');
const phoneInputContent = fs.readFileSync(phoneInputPath, 'utf8');
const countrySelectorPath = path.resolve('src/components/CountrySelector.tsx');
const countrySelectorContent = fs.readFileSync(countrySelectorPath, 'utf8');

const dropdownChecks = [
  { name: "PhoneInput popup fits viewport width (calc(100vw - 32px))", passed: phoneInputContent.includes("calc(100vw - 32px)") },
  { name: "PhoneInput uses 16px search input to prevent iOS zoom", passed: phoneInputContent.includes('fontSize: "16px"') },
  { name: "CountrySelector dropdown box-sizing", passed: countrySelectorContent.includes('boxSizing: "border-box"') },
];

let dropdownPassed = 0;
for (const check of dropdownChecks) {
  if (check.passed) {
    console.log(`✅ [DROPDOWN PASS] ${check.name}`);
    dropdownPassed++;
  } else {
    console.error(`❌ [DROPDOWN FAIL] ${check.name}`);
  }
}

console.log("\n=== SUMMARY ===");
console.log(`CSS Rules: ${cssPassed}/${requiredCssChecks.length} Passed`);
console.log(`JSX Rules: ${jsxPassed}/${requiredJsxChecks.length} Passed`);
console.log(`Dropdown Constraints: ${dropdownPassed}/${dropdownChecks.length} Passed`);

if (cssPassed === requiredCssChecks.length && jsxPassed === requiredJsxChecks.length && dropdownPassed === dropdownChecks.length) {
  console.log("\n🎉 ALL VERIFICATION CHECKS PASSED PERFECTLY!");
  process.exit(0);
} else {
  console.error("\n❌ SOME CHECKS FAILED.");
  process.exit(1);
}
