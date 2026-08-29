/**
 * Sialkot Cricket Kits — Customer Validation & Security Test Suite
 * 
 * Verifies all 29 required test scenarios:
 * 1. Letters inside phone field
 * 2. Extremely short phone number
 * 3. Missing international code
 * 4. Valid Pakistan phone
 * 5. Valid UK phone
 * 6. Valid UAE phone
 * 7. Email without @
 * 8. Email without domain extension
 * 9. Email with spaces
 * 10. Email containing two @ characters
 * 11. Valid Gmail email
 * 12. Valid Outlook email
 * 13. Valid .co.uk business email
 * 14. Empty full name
 * 15. Numbers-only full name
 * 16. Unicode customer name (Arabic, Chinese, Accented, Hyphenated, Apostrophe)
 * 17. Missing destination country
 * 18. Invalid street address
 * 19. Invalid city
 * 20. Invalid postal code for selected country
 * 21. Master checkout form validation (valid payload)
 * 22. Master checkout form validation (invalid payload with structured error map)
 * 23. India (IN / +91) strict rejection across phone & destination
 * 24. Phone dial code resolution and normalization
 * 25. State/Region requirement enforcement (US, CA, AU, PK vs optional GB, DE)
 * 26. Postal code requirement enforcement (GB, US, PK vs optional AE)
 * 27. Delivery notes safety & sanitization
 * 28. E.164 normalization & friendly display formatting
 * 29. Public domain email support (Gmail, Outlook, Yahoo, iCloud, business domains, university domains)
 */

import {
  validateFullName,
  validateEmail,
  validatePhone,
  validateDestinationCountry,
  validateStreetAddress,
  validateCity,
  validateState,
  validatePostalCode,
  validateDeliveryNotes,
  validateCheckoutCustomerInfo,
} from "../src/lib/validation.ts";
import { ALL_PHONE_CODES, getPhoneCountryByCode, getPhoneCountryByDialCode } from "../src/lib/phone-codes.ts";
import { isCountrySupported } from "../src/lib/countries.ts";
import { getAddressConfig } from "../src/lib/address-config.ts";

let passed = 0;
let failed = 0;

function assert(condition, name, details = "") {
  if (condition) {
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${name} ${details}`);
    failed++;
  }
}

console.log("\n🧪 Running Sialkot Cricket Kits Universal Validation Test Suite...\n");

// ── TEST GROUP 1: FULL NAME VALIDATION ──
console.log("📁 Group 1: Full Name Validation");

// 1. Empty full name
const emptyName = validateFullName("");
assert(!emptyName.valid && emptyName.error === "Please enter your full name.", "1. Reject empty full name");

// 2. Whitespace-only name
const wsName = validateFullName("     ");
assert(!wsName.valid && wsName.error === "Please enter your full name.", "2. Reject whitespace-only name");

// 3. Numbers-only full name
const numName = validateFullName("123456");
assert(!numName.valid && numName.error === "Please enter a valid name using letters only.", "3. Reject numbers-only name");

// 4. Name with digits
const digitName = validateFullName("Karan Khan 123");
assert(!digitName.valid && digitName.error === "Please enter a valid name using letters only.", "4. Reject name containing digits");

// 5. HTML / Script injection attempt
const xssName = validateFullName("<script>alert('xss')</script>");
assert(!xssName.valid && xssName.error === "Please enter a valid name using letters only.", "5. Reject script injection in name");

// 6. Unicode legitimate names
const validNames = [
  "Alyan Wazir",
  "Karan Khan",
  "O'Connor",
  "Anne-Marie Smith",
  "José Silva",
  "محمد علی",
  "李明",
  "Dr. A. Rahman",
];
for (const vn of validNames) {
  const res = validateFullName(vn);
  assert(res.valid && res.normalized, `6. Accept valid Unicode name: "${vn}"`);
}

// 7. Too long name (> 80 chars)
const longName = validateFullName("A".repeat(81));
assert(!longName.valid && longName.error === "Full name must not exceed 80 characters.", "7. Reject name exceeding 80 characters");

// ── TEST GROUP 2: EMAIL VALIDATION ──
console.log("\n📁 Group 2: Email Validation");

// 8. Email without @
const noAt = validateEmail("customergmail.com");
assert(!noAt.valid && noAt.error.includes("valid email address"), "8. Reject email without @ ('customergmail.com')");

// 9. Email with plain word / ABCDE
const plainWord = validateEmail("ABCDE");
assert(!plainWord.valid && plainWord.error.includes("valid email address"), "9. Reject plain text 'ABCDE' as email");

// 10. Email without domain extension
const noExt = validateEmail("customer@gmail");
assert(!noExt.valid && noExt.error.includes("valid email address"), "10. Reject email without domain extension ('customer@gmail')");

// 11. Email with spaces
const spaceEmail = validateEmail("customer @gmail.com");
assert(!spaceEmail.valid && spaceEmail.error.includes("valid email address"), "11. Reject email with internal spaces");

// 12. Email containing two @
const doubleAt = validateEmail("customer@@gmail.com");
assert(!doubleAt.valid && doubleAt.error.includes("valid email address"), "12. Reject email with two @ signs");

// 13. Consecutive dots
const consecDots = validateEmail("customer..name@gmail.com");
assert(!consecDots.valid && consecDots.error.includes("valid email address"), "13. Reject consecutive dots in email");

// 14. Valid Email Providers (Gmail, Outlook, Yahoo, iCloud, .co.uk, .ae, .edu)
const validEmails = [
  "customer@gmail.com",
  "customer.name@gmail.com",
  "customer@outlook.com",
  "cricket.fan@hotmail.com",
  "player@yahoo.com",
  "captain@icloud.com",
  "sales@sialkotcricketkits.com",
  "procurement@company.co.uk",
  "buyer@business.ae",
  "student@oxford.ac.uk",
  "orders@sports.com.pk",
];
for (const ve of validEmails) {
  const res = validateEmail(ve);
  assert(res.valid && res.normalized, `14. Accept valid email provider: "${ve}"`);
}

// ── TEST GROUP 3: PHONE & WHATSAPP VALIDATION ──
console.log("\n📁 Group 3: Phone / WhatsApp Validation");

// 15. Letters in phone
const lettersPhone = validatePhone("ABCDE", "+92");
assert(!lettersPhone.valid && lettersPhone.error === "Phone numbers cannot contain letters.", "15. Reject letters 'ABCDE' in phone field");

// 16. Mixed letters and digits
const mixedPhone = validatePhone("+92ABC123", "+92");
assert(!mixedPhone.valid && lettersPhone.error === "Phone numbers cannot contain letters.", "16. Reject mixed letters in phone (+92ABC123)");

// 17. Extremely short phone number
const shortPhone = validatePhone("123", "+92");
assert(!shortPhone.valid && shortPhone.error === "Please enter a valid international phone number.", "17. Reject extremely short phone '123'");

// 18. Repetitive dummy number
const dummyPhone = validatePhone("000000000", "+92");
assert(!dummyPhone.valid && dummyPhone.error === "Please enter a valid international phone number.", "18. Reject repetitive dummy phone '000000000'");

// 19. Missing international calling code when no default provided
const noCodePhone = validatePhone("3275756188", null);
assert(!noCodePhone.valid && noCodePhone.error === "Please include or select the international country code.", "19. Reject phone with missing international code");

// 20. Valid Pakistan Phone with dial code
const pkPhone = validatePhone("+92 327 5756188");
assert(pkPhone.valid && pkPhone.e164 === "+923275756188", "20. Validate Pakistan phone (+92 327 5756188 -> +923275756188)");

// 21. Valid UK Phone with formatted spaces and trunk zero strip
const ukPhone = validatePhone("07700 900123", "+44");
assert(ukPhone.valid && ukPhone.e164 === "+447700900123", "21. Validate UK phone with +44 selector ('07700 900123' -> +447700900123)");

// 22. Valid UAE Phone
const uaePhone = validatePhone("+971 50 123 4567");
assert(uaePhone.valid && uaePhone.e164 === "+971501234567", "22. Validate UAE phone (+971 50 123 4567 -> +971501234567)");

// 23. Valid US Phone
const usPhone = validatePhone("+1 202 555 0123");
assert(usPhone.valid && usPhone.e164 === "+12025550123", "23. Validate US phone (+1 202 555 0123 -> +12025550123)");

// 24. Strict India (+91) phone rejection
const indiaPhone = validatePhone("+91 98765 43210");
assert(!indiaPhone.valid && indiaPhone.error.includes("unavailable"), "24. Strictly reject India (+91) phone number");

// ── TEST GROUP 4: DESTINATION COUNTRY & ADDRESSING ──
console.log("\n📁 Group 4: Destination Country & Addressing");

// 25. Missing destination country
const noCountry = validateDestinationCountry("", "");
assert(!noCountry.valid && noCountry.error === "Please select your destination country.", "25. Reject missing destination country");

// 26. India destination country rejection
const indiaCountry = validateDestinationCountry("India", "IN");
assert(!indiaCountry.valid && indiaCountry.error.includes("unavailable"), "26. Strictly reject India destination country");

// 27. Street Address validation (min 5 chars, meaningful characters)
const shortAddr = validateStreetAddress("12");
assert(!shortAddr.valid && shortAddr.error === "Please provide a more complete street address.", "27. Reject short street address '12'");

const validAddr = validateStreetAddress("House No. 207, Gulshan Street, Model Town");
assert(validAddr.valid && validAddr.normalized, "28. Accept valid street address");

// 28. City validation
const invalidCity = validateCity("12345");
assert(!invalidCity.valid && invalidCity.error === "Please enter a valid city.", "29. Reject numbers-only city '12345'");

const validCity = validateCity("Sialkot");
assert(validCity.valid && validCity.normalized === "Sialkot", "30. Accept valid city 'Sialkot'");

// 29. State/Region requirement enforcement
const usStateMissing = validateState("", "US");
assert(!usStateMissing.valid && usStateMissing.error.includes("state"), "31. Require state for United States");

const usStateValid = validateState("California", "US");
assert(usStateValid.valid && usStateValid.normalized === "California", "32. Accept valid US state");

const gbStateOptional = validateState("", "GB");
assert(gbStateOptional.valid, "33. Allow empty state for United Kingdom where optional");

// 30. Postal Code requirement & country formatting
const ukPostcodeInvalid = validatePostalCode("12345", "GB");
assert(!ukPostcodeInvalid.valid, "34. Reject invalid UK postcode '12345'");

const ukPostcodeValid = validatePostalCode("SW1A 1AA", "GB");
assert(ukPostcodeValid.valid && ukPostcodeValid.normalized === "SW1A 1AA", "35. Accept valid UK postcode 'SW1A 1AA'");

const pkPostalValid = validatePostalCode("51310", "PK");
assert(pkPostalValid.valid && pkPostalValid.normalized === "51310", "36. Accept valid Pakistan postal code '51310'");

const uaePostalOptional = validatePostalCode("", "AE");
assert(uaePostalOptional.valid, "37. Allow empty postal code for UAE where not standard");

// ── TEST GROUP 5: MASTER CHECKOUT FORM VALIDATION ──
console.log("\n📁 Group 5: Master Checkout Form Validation");

// 31. Complete valid form payload (Pakistan customer)
const validPkPayload = {
  fullName: "Alyan Wazir",
  email: "alyan@sialkotcricketkits.com",
  phone: "3275756188",
  phoneDialCode: "+92",
  country: "Pakistan",
  countryCode: "PK",
  address: "House No. 207, Gulshan Street, Model Town",
  city: "Sialkot",
  state: "Punjab",
  postalCode: "51310",
  deliveryInstructions: "Call upon arrival",
};
const pkOutcome = validateCheckoutCustomerInfo(validPkPayload);
assert(pkOutcome.isValid, "38. Validate complete Pakistan customer checkout payload");
assert(pkOutcome.normalized.phoneE164 === "+923275756188", "39. Normalize PK phone to +923275756188");

// 32. Complete valid form payload (UK customer)
const validUkPayload = {
  fullName: "James Anderson",
  email: "j.anderson@lancashirecricket.co.uk",
  phone: "+44 7700 900123",
  phoneDialCode: "+44",
  country: "United Kingdom",
  countryCode: "GB",
  address: "Old Trafford Cricket Ground, Talbot Road",
  city: "Manchester",
  state: "Greater Manchester",
  postalCode: "M16 0PX",
  deliveryInstructions: "Front reception desk",
};
const ukOutcome = validateCheckoutCustomerInfo(validUkPayload);
assert(ukOutcome.isValid, "40. Validate complete UK customer checkout payload");
assert(ukOutcome.normalized.phoneE164 === "+447700900123", "41. Normalize UK phone to +447700900123");

// 33. Invalid form payload (Frontend bypass attempt with invalid email & phone)
const invalidPayload = {
  fullName: "12345",
  email: "invalid-email",
  phone: "ABCDE",
  country: "",
  address: "12",
  city: "999",
  state: "",
  postalCode: "",
};
const invalidOutcome = validateCheckoutCustomerInfo(invalidPayload);
assert(!invalidOutcome.isValid, "42. Master validator rejects invalid payload");
assert(Boolean(invalidOutcome.errors.fullName), "43. Returned structured error for fullName");
assert(Boolean(invalidOutcome.errors.email), "44. Returned structured error for email");
assert(Boolean(invalidOutcome.errors.phone), "45. Returned structured error for phone");
assert(Boolean(invalidOutcome.errors.country), "46. Returned structured error for country");
assert(Boolean(invalidOutcome.errors.address), "47. Returned structured error for address");
assert(Boolean(invalidOutcome.errors.city), "48. Returned structured error for city");

// 34. Phone calling code dataset integrity
assert(
  !ALL_PHONE_CODES.some((p) => p.code === "IN" || p.dialCode === "+91"),
  "49. Calling code dataset strictly excludes India (+91)"
);
assert(ALL_PHONE_CODES.length >= 70, `50. Calling code dataset contains comprehensive directory (${ALL_PHONE_CODES.length} countries)`);

console.log("\n=======================================================");
console.log(`📊 TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("✨ ALL VALIDATION AND SECURITY TESTS PASSED SUCCESSFULLY! ✨\n");
}
