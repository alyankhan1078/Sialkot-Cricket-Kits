/**
 * Sialkot Cricket Kits — Universal Checkout Validation Engine
 * 
 * Shared across:
 * - Frontend Real-Time Validation & Field UX (`app/checkout/page.tsx`)
 * - Manual Order Submission API (`app/api/checkout/submit-manual-order/route.ts`)
 * - Direct Order API (`app/api/checkout/order/route.ts`)
 */

import { isCountrySupported, resolveCountry, type CountryInfo } from "./countries.ts";
import {
  ALL_PHONE_CODES,
  getPhoneCountryByCode,
  getPhoneCountryByDialCode,
  extractDialCode,
  type PhoneCountryCode,
} from "./phone-codes.ts";
import { getAddressConfig, type CountryAddressConfig } from "./address-config.ts";

export interface ValidationResult<T = string> {
  valid: boolean;
  error?: string;
  normalized?: T;
}

export interface PhoneValidationResult {
  valid: boolean;
  error?: string;
  e164?: string; // Standard E.164 e.g. "+923275756188"
  display?: string; // Formatted display e.g. "+92 327 5756188"
  dialCode?: string; // e.g. "+92"
  nationalNumber?: string; // e.g. "3275756188"
  countryCode?: string; // e.g. "PK"
}

export interface CheckoutCustomerInput {
  fullName: string;
  email: string;
  phone: string;
  phoneDialCode?: string;
  country: string;
  countryCode?: string;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  deliveryInstructions?: string;
}

export interface CheckoutValidationOutcome {
  isValid: boolean;
  errors: Record<string, string>;
  normalized: {
    fullName: string;
    email: string;
    phoneE164: string;
    phoneDisplay: string;
    phoneDialCode: string;
    country: string;
    countryCode: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    deliveryInstructions: string;
  };
}

/**
 * 1. FULL NAME VALIDATION
 * - Required, trimmed, 2-80 characters.
 * - Must contain letters (Unicode supported: Arabic, Urdu, Latin, Chinese, accented).
 * - Allows spaces, apostrophes, hyphens, periods.
 * - Rejects numbers-only, emoji-only, HTML/script tags, control chars, whitespace-only.
 */
export function validateFullName(rawName: string | null | undefined): ValidationResult<string> {
  if (!rawName || !rawName.trim()) {
    return { valid: false, error: "Please enter your full name." };
  }

  // Trim and collapse repeated internal spaces
  const name = rawName.trim().replace(/\s+/g, " ");

  if (name.length < 2) {
    return { valid: false, error: "Please enter your full name." };
  }

  if (name.length > 80) {
    return { valid: false, error: "Full name must not exceed 80 characters." };
  }

  // Reject HTML, scripts, or control characters
  if (/<[^>]*>/i.test(name) || /javascript:/i.test(name) || /[\x00-\x1F\x7F]/.test(name)) {
    return { valid: false, error: "Please enter a valid name using letters only." };
  }

  // Reject digits
  if (/\d/.test(name)) {
    return { valid: false, error: "Please enter a valid name using letters only." };
  }

  // Character allowlist: Unicode letters, marks, spaces, hyphens, apostrophes, periods
  const validNamePattern = /^[\p{L}\p{M}\s'’\.\-]+$/u;
  if (!validNamePattern.test(name)) {
    return { valid: false, error: "Please enter a valid name using letters only." };
  }

  // Must contain at least 2 meaningful Unicode letter characters
  const letters = name.match(/\p{L}/gu) || [];
  if (letters.length < 2) {
    return { valid: false, error: "Please enter a valid name using letters only." };
  }

  return { valid: true, normalized: name };
}

/**
 * 2. EMAIL ADDRESS VALIDATION
 * - Required, max 254 characters.
 * - Accepts ALL valid domains and providers (Gmail, Outlook, Hotmail, Yahoo, iCloud, business domains, .co.uk, .ae, university, etc.).
 * - Strict structural checks: single '@', non-empty local & domain, no consecutive dots, valid TLD.
 */
export function validateEmail(rawEmail: string | null | undefined): ValidationResult<string> {
  if (!rawEmail || !rawEmail.trim()) {
    return { valid: false, error: "Please enter your email address." };
  }

  const email = rawEmail.trim();

  if (email.length > 254) {
    return { valid: false, error: "Email address is too long." };
  }

  // Reject spaces anywhere in the email
  if (/\s/.test(email)) {
    return { valid: false, error: "Please enter a valid email address, for example name@example.com." };
  }

  // Reject HTML tags, script injection, or control characters
  if (/<[^>]*>/i.test(email) || /javascript:/i.test(email) || /[\x00-\x1F\x7F]/.test(email)) {
    return { valid: false, error: "Please enter a valid email address, for example name@example.com." };
  }

  // Must have exactly one '@'
  const atIndex = email.indexOf("@");
  if (atIndex === -1 || atIndex !== email.lastIndexOf("@")) {
    return { valid: false, error: "Please enter a valid email address, for example name@example.com." };
  }

  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex + 1);

  if (!localPart || !domainPart) {
    return { valid: false, error: "Please enter a valid email address, for example name@example.com." };
  }

  // Local part checks (1 to 64 chars)
  if (localPart.length > 64 || localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
    return { valid: false, error: "Please enter a valid email address, for example name@example.com." };
  }

  // Domain part checks (4 to 253 chars)
  if (
    domainPart.length < 3 ||
    domainPart.length > 253 ||
    domainPart.startsWith(".") ||
    domainPart.endsWith(".") ||
    domainPart.startsWith("-") ||
    domainPart.endsWith("-") ||
    domainPart.includes("..")
  ) {
    return { valid: false, error: "Please enter a valid email address, for example name@example.com." };
  }

  // Domain must have at least one dot separating name and TLD
  if (!domainPart.includes(".")) {
    return { valid: false, error: "Please enter a valid email address, for example name@example.com." };
  }

  const domainLabels = domainPart.split(".");
  for (const label of domainLabels) {
    if (!label || label.length > 63 || label.startsWith("-") || label.endsWith("-")) {
      return { valid: false, error: "Please enter a valid email address, for example name@example.com." };
    }
  }

  // Top-Level Domain (TLD) must be at least 2 alphabetic characters (e.g. .com, .uk, .pk, .ae, .org, .edu)
  const tld = domainLabels[domainLabels.length - 1];
  if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return { valid: false, error: "Please enter a valid email address, for example name@example.com." };
  }

  // Standard RFC 5322 pattern check
  const rfcPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!rfcPattern.test(email)) {
    return { valid: false, error: "Please enter a valid email address, for example name@example.com." };
  }

  const normalized = `${localPart}@${domainPart.toLowerCase()}`;
  return { valid: true, normalized };
}

/**
 * 3. PHONE / WHATSAPP VALIDATION
 * - Required, letters strictly rejected.
 * - Allows common formatting (+, spaces, hyphens, parens).
 * - Normalized to standard E.164 (+[country code][number]).
 * - Validates E.164 length (8 to 15 digits total).
 */
export function validatePhone(
  rawPhone: string | null | undefined,
  defaultDialCode?: string | null
): PhoneValidationResult {
  if (!rawPhone || !rawPhone.trim()) {
    return { valid: false, error: "Please enter your WhatsApp or phone number." };
  }

  const raw = rawPhone.trim();

  // Reject any letters
  if (/[a-zA-Z]/.test(raw)) {
    return { valid: false, error: "Phone numbers cannot contain letters." };
  }

  // Allow only valid phone formatting characters (+, digits, spaces, -, (, ), .)
  if (/[^0-9+\s\-().]/.test(raw)) {
    return { valid: false, error: "Please enter a valid international phone number." };
  }

  // Reject India prefix explicitly
  if (raw.startsWith("+91") || (defaultDialCode === "+91")) {
    return { valid: false, error: "Delivery to the selected destination is currently unavailable." };
  }

  let dialCode = "";
  let nationalNumber = "";
  let matchedCountry: PhoneCountryCode | null = null;

  if (raw.startsWith("+")) {
    const extracted = extractDialCode(raw);
    if (!extracted.country) {
      // Missing or unrecognised international code
      return { valid: false, error: "Please include or select a valid international country code." };
    }
    matchedCountry = extracted.country;
    dialCode = extracted.country.dialCode;
    nationalNumber = extracted.nationalNumber;
  } else {
    // If no leading '+', use the provided default calling code
    if (defaultDialCode && defaultDialCode.startsWith("+")) {
      matchedCountry = getPhoneCountryByDialCode(defaultDialCode);
      dialCode = defaultDialCode;
      nationalNumber = raw;
    } else {
      return { valid: false, error: "Please include or select the international country code." };
    }
  }

  // Extract purely digits of national part
  let nationalDigits = nationalNumber.replace(/\D/g, "");

  // Strip leading trunk zero if user typed e.g. 0300 or 07700 with a country code
  if (nationalDigits.startsWith("0") && nationalDigits.length > 7) {
    nationalDigits = nationalDigits.slice(1);
  }

  // Verify national number length
  const minDigits = matchedCountry ? matchedCountry.minNationalDigits : 7;
  const maxDigits = matchedCountry ? matchedCountry.maxNationalDigits : 12;

  if (nationalDigits.length < minDigits || nationalDigits.length > maxDigits + 2) {
    return { valid: false, error: "Please enter a valid international phone number." };
  }

  // Verify total E.164 length (standard ITU-T E.164: 8 to 15 digits total)
  const totalDigits = (dialCode + nationalDigits).replace(/\D/g, "");
  if (totalDigits.length < 8 || totalDigits.length > 15) {
    return { valid: false, error: "Please enter a valid international phone number." };
  }

  // Reject clearly dummy/repetitive numbers (e.g. 00000000, 11111111)
  if (/^(\d)\1{6,}$/.test(nationalDigits)) {
    return { valid: false, error: "Please enter a valid international phone number." };
  }

  const e164 = `${dialCode}${nationalDigits}`;
  
  // Format friendly display e.g. "+92 327 5756188"
  let display = `${dialCode} ${nationalDigits}`;
  if (nationalDigits.length >= 9) {
    display = `${dialCode} ${nationalDigits.slice(0, 3)} ${nationalDigits.slice(3, 6)} ${nationalDigits.slice(6)}`;
  } else if (nationalDigits.length >= 7) {
    display = `${dialCode} ${nationalDigits.slice(0, 3)} ${nationalDigits.slice(3)}`;
  }

  return {
    valid: true,
    e164,
    display,
    dialCode,
    nationalNumber: nationalDigits,
    countryCode: matchedCountry?.code || "",
  };
}

/**
 * 4. DESTINATION COUNTRY VALIDATION
 */
export function validateDestinationCountry(
  country: string | null | undefined,
  countryCode?: string | null | undefined
): { valid: boolean; error?: string; country: CountryInfo | null } {
  return isCountrySupported(country || countryCode);
}

/**
 * 5. STREET ADDRESS VALIDATION
 * - Required, 5 to 150 characters.
 * - Must contain letters/numbers, whitespace-only/symbols rejected.
 */
export function validateStreetAddress(rawAddress: string | null | undefined): ValidationResult<string> {
  if (!rawAddress || !rawAddress.trim()) {
    return { valid: false, error: "Please enter your complete delivery address." };
  }

  const address = rawAddress.trim().replace(/\s+/g, " ");

  if (address.length < 5) {
    return { valid: false, error: "Please provide a more complete street address." };
  }

  if (address.length > 150) {
    return { valid: false, error: "Street address must not exceed 150 characters." };
  }

  // Reject HTML/scripts or control chars
  if (/<[^>]*>/i.test(address) || /javascript:/i.test(address) || /[\x00-\x1F\x7F]/.test(address)) {
    return { valid: false, error: "Please enter your complete delivery address." };
  }

  // Must contain at least some meaningful alphanumeric characters
  const alphanumeric = address.match(/[\p{L}\p{N}]/gu) || [];
  if (alphanumeric.length < 3) {
    return { valid: false, error: "Please provide a more complete street address." };
  }

  return { valid: true, normalized: address };
}

/**
 * 6. CITY VALIDATION
 * - Required, 2 to 80 characters.
 * - Must contain letters, numbers-only rejected.
 */
export function validateCity(rawCity: string | null | undefined): ValidationResult<string> {
  if (!rawCity || !rawCity.trim()) {
    return { valid: false, error: "Please enter a valid city." };
  }

  const city = rawCity.trim().replace(/\s+/g, " ");

  if (city.length < 2 || city.length > 80) {
    return { valid: false, error: "Please enter a valid city." };
  }

  // Reject HTML/scripts or control chars
  if (/<[^>]*>/i.test(city) || /javascript:/i.test(city) || /[\x00-\x1F\x7F]/.test(city)) {
    return { valid: false, error: "Please enter a valid city." };
  }

  // Must contain letters
  const letters = city.match(/\p{L}/gu) || [];
  if (letters.length < 2) {
    return { valid: false, error: "Please enter a valid city." };
  }

  return { valid: true, normalized: city };
}

/**
 * 7. STATE / REGION / COUNTY VALIDATION
 * - Required for countries that require administrative divisions (US, Canada, Australia, Pakistan).
 */
export function validateState(
  rawState: string | null | undefined,
  countryCode?: string | null | undefined
): ValidationResult<string> {
  const config = getAddressConfig(countryCode);
  const state = (rawState || "").trim().replace(/\s+/g, " ");

  if (config.requiresState) {
    if (!state) {
      return { valid: false, error: "Please enter or select your state, region or county." };
    }
    if (state.length < 2 || state.length > 80) {
      return { valid: false, error: "Please enter or select your state, region or county." };
    }
    if (/<[^>]*>/i.test(state) || /javascript:/i.test(state) || /[\x00-\x1F\x7F]/.test(state)) {
      return { valid: false, error: "Please enter or select your state, region or county." };
    }
    return { valid: true, normalized: state };
  }

  // Optional state
  if (state) {
    if (state.length > 80 || /<[^>]*>/i.test(state)) {
      return { valid: false, error: "State/Region is invalid or too long." };
    }
    return { valid: true, normalized: state };
  }

  return { valid: true, normalized: "" };
}

/**
 * 8. POSTAL / ZIP CODE VALIDATION
 * - Country-aware formatting and requirement checks.
 */
export function validatePostalCode(
  rawPostalCode: string | null | undefined,
  countryCode?: string | null | undefined
): ValidationResult<string> {
  const config = getAddressConfig(countryCode);
  const postalCode = (rawPostalCode || "").trim();

  if (config.requiresPostalCode) {
    if (!postalCode) {
      return { valid: false, error: "Please enter a valid postal or ZIP code for the selected country." };
    }

    if (postalCode.length < 2 || postalCode.length > 20) {
      return { valid: false, error: "Please enter a valid postal or ZIP code for the selected country." };
    }

    if (/<[^>]*>/i.test(postalCode) || /[\x00-\x1F\x7F]/.test(postalCode)) {
      return { valid: false, error: "Please enter a valid postal or ZIP code for the selected country." };
    }

    if (config.postalCodePattern && !config.postalCodePattern.test(postalCode)) {
      return { valid: false, error: "Please enter a valid postal or ZIP code for the selected country." };
    }

    return { valid: true, normalized: postalCode.toUpperCase() };
  }

  // Optional postal code (e.g. UAE)
  if (postalCode) {
    if (postalCode.length > 20 || /<[^>]*>/i.test(postalCode)) {
      return { valid: false, error: "Please enter a valid postal code." };
    }
    return { valid: true, normalized: postalCode };
  }

  return { valid: true, normalized: "" };
}

/**
 * 9. DELIVERY NOTES VALIDATION
 */
export function validateDeliveryNotes(rawNotes: string | null | undefined): ValidationResult<string> {
  if (!rawNotes) {
    return { valid: true, normalized: "" };
  }

  const notes = rawNotes.trim();
  if (notes.length > 500) {
    return { valid: false, error: "Delivery notes must not exceed 500 characters." };
  }

  // Sanitize HTML
  const sanitized = notes.replace(/<[^>]*>/g, "").replace(/[\x00-\x1F\x7F]/g, "");
  return { valid: true, normalized: sanitized };
}

/**
 * MASTER CHECKOUT FORM VALIDATION
 * Executes complete field validation and aggregates errors.
 */
export function validateCheckoutCustomerInfo(data: CheckoutCustomerInput): CheckoutValidationOutcome {
  const errors: Record<string, string> = {};

  // 1. Full Name
  const nameRes = validateFullName(data.fullName);
  if (!nameRes.valid && nameRes.error) {
    errors.fullName = nameRes.error;
  }

  // 2. Email Address
  const emailRes = validateEmail(data.email);
  if (!emailRes.valid && emailRes.error) {
    errors.email = emailRes.error;
  }

  // 3. Destination Country
  const countryRes = validateDestinationCountry(data.country, data.countryCode);
  if (!countryRes.valid && countryRes.error) {
    errors.country = countryRes.error;
  }
  const resolvedCountryCode = countryRes.country?.code || data.countryCode || "";
  const resolvedCountryName = countryRes.country?.name || data.country || "";

  // 4. Phone / WhatsApp
  const phoneRes = validatePhone(data.phone, data.phoneDialCode);
  if (!phoneRes.valid && phoneRes.error) {
    errors.phone = phoneRes.error;
  }

  // 5. Street Address
  const addressRes = validateStreetAddress(data.address);
  if (!addressRes.valid && addressRes.error) {
    errors.address = addressRes.error;
  }

  // 6. City
  const cityRes = validateCity(data.city);
  if (!cityRes.valid && cityRes.error) {
    errors.city = cityRes.error;
  }

  // 7. State / Region
  const stateRes = validateState(data.state, resolvedCountryCode);
  if (!stateRes.valid && stateRes.error) {
    errors.state = stateRes.error;
  }

  // 8. Postal Code
  const postalRes = validatePostalCode(data.postalCode, resolvedCountryCode);
  if (!postalRes.valid && postalRes.error) {
    errors.postalCode = postalRes.error;
  }

  // 9. Delivery Notes
  const notesRes = validateDeliveryNotes(data.deliveryInstructions);
  if (!notesRes.valid && notesRes.error) {
    errors.deliveryInstructions = notesRes.error;
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    normalized: {
      fullName: nameRes.normalized || (data.fullName || "").trim(),
      email: emailRes.normalized || (data.email || "").trim(),
      phoneE164: phoneRes.e164 || (data.phone || "").trim(),
      phoneDisplay: phoneRes.display || (data.phone || "").trim(),
      phoneDialCode: phoneRes.dialCode || data.phoneDialCode || "+92",
      country: resolvedCountryName,
      countryCode: resolvedCountryCode,
      address: addressRes.normalized || (data.address || "").trim(),
      city: cityRes.normalized || (data.city || "").trim(),
      state: stateRes.normalized || (data.state || "").trim(),
      postalCode: postalRes.normalized || (data.postalCode || "").trim(),
      deliveryInstructions: notesRes.normalized || "",
    },
  };
}
