// Shipping rate configuration and tiered multi-item calculation (PKR -> GBP)
import { resolveCountry, type CountryInfo } from "./countries.ts";

export interface ShippingDestination {
  country: string;
  code: string;
  basePkr: number;
  baseGbp: number; // 1st item shipping cost
  additionalItemGbp: number; // Additional cost per extra item (volume discount)
  estimatedDelivery: string;
  requiresQuotation?: boolean;
}

export const SHIPPING_DESTINATIONS: Record<string, ShippingDestination> = {
  "United Kingdom": {
    country: "United Kingdom",
    code: "GB",
    basePkr: 7500,
    baseGbp: 20,
    additionalItemGbp: 8,
    estimatedDelivery: "3-5 Working Days (DHL Express / FedEx)",
  },
  "United States": {
    country: "United States",
    code: "US",
    basePkr: 9500,
    baseGbp: 26,
    additionalItemGbp: 10,
    estimatedDelivery: "4-6 Working Days (DHL Express / FedEx)",
  },
  "Canada": {
    country: "Canada",
    code: "CA",
    basePkr: 9500,
    baseGbp: 26,
    additionalItemGbp: 10,
    estimatedDelivery: "4-6 Working Days (DHL Express / FedEx)",
  },
  "Australia": {
    country: "Australia",
    code: "AU",
    basePkr: 11000,
    baseGbp: 30,
    additionalItemGbp: 12,
    estimatedDelivery: "5-7 Working Days (DHL Express / FedEx)",
  },
  "New Zealand": {
    country: "New Zealand",
    code: "NZ",
    basePkr: 12000,
    baseGbp: 33,
    additionalItemGbp: 12,
    estimatedDelivery: "5-7 Working Days (DHL Express / FedEx)",
  },
  "Pakistan": {
    country: "Pakistan",
    code: "PK",
    basePkr: 1000,
    baseGbp: 3,
    additionalItemGbp: 1,
    estimatedDelivery: "2-3 Working Days (TCS / Leopard Tracked)",
  },
  "United Arab Emirates": {
    country: "United Arab Emirates",
    code: "AE",
    basePkr: 8000,
    baseGbp: 22,
    additionalItemGbp: 8,
    estimatedDelivery: "3-4 Working Days (DHL / Aramex Express)",
  },
  "Saudi Arabia": {
    country: "Saudi Arabia",
    code: "SA",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "3-5 Working Days (DHL / Aramex Express)",
  },
  "Qatar": {
    country: "Qatar",
    code: "QA",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "3-5 Working Days (DHL / Aramex Express)",
  },
  "Oman": {
    country: "Oman",
    code: "OM",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "3-5 Working Days (DHL / Aramex Express)",
  },
  "Kuwait": {
    country: "Kuwait",
    code: "KW",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "3-5 Working Days (DHL / Aramex Express)",
  },
  "Bahrain": {
    country: "Bahrain",
    code: "BH",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "3-5 Working Days (DHL / Aramex Express)",
  },
  "Ireland": {
    country: "Ireland",
    code: "IE",
    basePkr: 8000,
    baseGbp: 22,
    additionalItemGbp: 8,
    estimatedDelivery: "3-5 Working Days (DHL Express)",
  },
  "Germany": {
    country: "Germany",
    code: "DE",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "4-6 Working Days (DHL Express)",
  },
  "Netherlands": {
    country: "Netherlands",
    code: "NL",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "4-6 Working Days (DHL Express)",
  },
  "France": {
    country: "France",
    code: "FR",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "4-6 Working Days (DHL Express)",
  },
  "Italy": {
    country: "Italy",
    code: "IT",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "4-6 Working Days (DHL Express)",
  },
  "Switzerland": {
    country: "Switzerland",
    code: "CH",
    basePkr: 9500,
    baseGbp: 26,
    additionalItemGbp: 10,
    estimatedDelivery: "4-6 Working Days (DHL Express)",
  },
  "South Africa": {
    country: "South Africa",
    code: "ZA",
    basePkr: 11000,
    baseGbp: 30,
    additionalItemGbp: 12,
    estimatedDelivery: "5-7 Working Days (DHL Express)",
  },
  "Sri Lanka": {
    country: "Sri Lanka",
    code: "LK",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "4-6 Working Days (DHL Express / Air Cargo)",
  },
  "Bangladesh": {
    country: "Bangladesh",
    code: "BD",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "4-6 Working Days (DHL Express / Air Cargo)",
  },
  "Malaysia": {
    country: "Malaysia",
    code: "MY",
    basePkr: 9500,
    baseGbp: 26,
    additionalItemGbp: 10,
    estimatedDelivery: "4-6 Working Days (DHL Express)",
  },
  "Singapore": {
    country: "Singapore",
    code: "SG",
    basePkr: 9500,
    baseGbp: 26,
    additionalItemGbp: 10,
    estimatedDelivery: "4-6 Working Days (DHL Express)",
  },
  "Hong Kong": {
    country: "Hong Kong",
    code: "HK",
    basePkr: 9500,
    baseGbp: 26,
    additionalItemGbp: 10,
    estimatedDelivery: "4-6 Working Days (DHL Express)",
  },
  "Japan": {
    country: "Japan",
    code: "JP",
    basePkr: 11000,
    baseGbp: 30,
    additionalItemGbp: 12,
    estimatedDelivery: "5-7 Working Days (DHL Express)",
  },
  "China": {
    country: "China",
    code: "CN",
    basePkr: 11000,
    baseGbp: 30,
    additionalItemGbp: 12,
    estimatedDelivery: "5-7 Working Days (DHL Express)",
  },
  "Other International": {
    country: "Other International",
    code: "OTHER",
    basePkr: 11000,
    baseGbp: 30,
    additionalItemGbp: 12,
    estimatedDelivery: "5-8 Working Days (Tracked Worldwide Express)",
  },
};

/**
 * Resolves a destination rate for a given country code or name.
 * Never defaults to United Kingdom when input is empty!
 */
export function getShippingDestination(countryInput: string | null | undefined): ShippingDestination | null {
  if (!countryInput || !countryInput.trim()) {
    return null;
  }

  const resolved = resolveCountry(countryInput);
  if (!resolved) {
    return null;
  }

  // Check direct name match in rate table
  if (SHIPPING_DESTINATIONS[resolved.name]) {
    return SHIPPING_DESTINATIONS[resolved.name];
  }

  // Check by code
  const byCode = Object.values(SHIPPING_DESTINATIONS).find((d) => d.code === resolved.code);
  if (byCode) {
    return byCode;
  }

  // Generic international rate for recognized international destination
  return {
    country: resolved.name,
    code: resolved.code,
    basePkr: 11000,
    baseGbp: 30,
    additionalItemGbp: 12,
    estimatedDelivery: "5-8 Working Days (Tracked Worldwide Express)",
  };
}

export interface ShippingCalculationResult {
  hasDestination: boolean;
  countryName: string;
  countryCode: string;
  flag: string;
  shippingFee: number;
  baseFee: number;
  additionalFee: number;
  totalSaved: number;
  perItemRate: number;
  requiresQuotation: boolean;
  destination: ShippingDestination | null;
  displayLabel: string;
  displayAmount: string;
}

/**
 * Calculates tiered shipping fee with combined box volume discounts.
 * When no country is selected, shipping fee is 0 and hasDestination is false.
 */
export function calculateShippingFee(
  countryInput: string | null | undefined,
  totalItemCount: number
): ShippingCalculationResult {
  if (!countryInput || !countryInput.trim()) {
    return {
      hasDestination: false,
      countryName: "",
      countryCode: "",
      flag: "",
      shippingFee: 0,
      baseFee: 0,
      additionalFee: 0,
      totalSaved: 0,
      perItemRate: 0,
      requiresQuotation: false,
      destination: null,
      displayLabel: "Select destination",
      displayAmount: "—",
    };
  }

  const destination = getShippingDestination(countryInput);
  const resolved = resolveCountry(countryInput);
  const flag = resolved?.flag || "🌍";

  if (!destination) {
    return {
      hasDestination: true,
      countryName: resolved?.name || countryInput,
      countryCode: resolved?.code || "",
      flag,
      shippingFee: 0,
      baseFee: 0,
      additionalFee: 0,
      totalSaved: 0,
      perItemRate: 0,
      requiresQuotation: true,
      destination: null,
      displayLabel: resolved?.name ? `Delivery (${resolved.name})` : "Delivery Quotation Required",
      displayAmount: "Quotation required",
    };
  }

  const count = Math.max(1, totalItemCount);

  if (count === 1) {
    return {
      hasDestination: true,
      countryName: destination.country,
      countryCode: destination.code,
      flag,
      shippingFee: destination.baseGbp,
      baseFee: destination.baseGbp,
      additionalFee: 0,
      totalSaved: 0,
      perItemRate: destination.baseGbp,
      requiresQuotation: false,
      destination,
      displayLabel: `Delivery (${destination.country})`,
      displayAmount: `£${destination.baseGbp}`,
    };
  }

  // Multi-item discounted calculation
  const additionalItems = count - 1;
  const additionalFee = additionalItems * destination.additionalItemGbp;
  const shippingFee = destination.baseGbp + additionalFee;

  // What they would have paid if charged full base per bat
  const uncombinedTotal = count * destination.baseGbp;
  const totalSaved = uncombinedTotal - shippingFee;
  const perItemRate = Math.round((shippingFee / count) * 10) / 10;

  return {
    hasDestination: true,
    countryName: destination.country,
    countryCode: destination.code,
    flag,
    shippingFee,
    baseFee: destination.baseGbp,
    additionalFee,
    totalSaved,
    perItemRate,
    requiresQuotation: false,
    destination,
    displayLabel: `Delivery (${destination.country})`,
    displayAmount: `£${shippingFee}`,
  };
}

export function getCountryFlag(countryInput: string | null | undefined): string {
  if (!countryInput) return "🌍";
  const resolved = resolveCountry(countryInput);
  return resolved?.flag || "🌍";
}
