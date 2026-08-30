/**
 * SIALKOT CRICKET KITS — CENTRALIZED DYNAMIC SHIPPING ENGINE
 * 
 * Multi-item, zone-based, product-class intelligent courier calculation.
 * Supports weight, volume, package combining rules, and real-time destination resolution.
 */

import { resolveCountry, type CountryInfo } from "./countries.ts";

export type ShippingClass =
  | "BAT"
  | "JUNIOR_BAT"
  | "GLOVES"
  | "PADS"
  | "HELMET"
  | "BAG"
  | "KEEPING_GLOVES"
  | "THIGH_PAD"
  | "ACCESSORY"
  | "CUSTOM_PRODUCT";

export type ShippingZoneKey =
  | "ZONE_PAKISTAN"
  | "ZONE_UK"
  | "ZONE_USA_CANADA"
  | "ZONE_AUSTRALIA_NZ"
  | "ZONE_GCC_MIDDLE_EAST"
  | "ZONE_EUROPE"
  | "ZONE_ASIA"
  | "ZONE_REST_OF_WORLD";

export interface ShippingZoneRate {
  zoneKey: ShippingZoneKey;
  zoneName: string;
  courierService: string;
  estimatedDelivery: string;
  basePkr: number;
  baseGbp: number; // Base fee for primary / heaviest item
  additionalBatGbp: number;
  additionalPadGbp: number;
  additionalHelmetGbp: number;
  additionalBagGbp: number;
  additionalGloveGbp: number;
  additionalAccessoryGbp: number;
}

/**
 * Standard Zone Rate Tables (GBP as master currency, PKR benchmark)
 */
export const SHIPPING_ZONES: Record<ShippingZoneKey, ShippingZoneRate> = {
  ZONE_PAKISTAN: {
    zoneKey: "ZONE_PAKISTAN",
    zoneName: "Pakistan (Domestic)",
    courierService: "TCS / Leopard Tracked Express",
    estimatedDelivery: "2-3 Working Days",
    basePkr: 1000,
    baseGbp: 3,
    additionalBatGbp: 1,
    additionalPadGbp: 1,
    additionalHelmetGbp: 1,
    additionalBagGbp: 2,
    additionalGloveGbp: 0.5,
    additionalAccessoryGbp: 0.3,
  },
  ZONE_UK: {
    zoneKey: "ZONE_UK",
    zoneName: "United Kingdom",
    courierService: "DHL Express / FedEx UK",
    estimatedDelivery: "3-5 Working Days",
    basePkr: 7500,
    baseGbp: 20,
    additionalBatGbp: 8,
    additionalPadGbp: 6,
    additionalHelmetGbp: 6,
    additionalBagGbp: 10,
    additionalGloveGbp: 3,
    additionalAccessoryGbp: 1.5,
  },
  ZONE_USA_CANADA: {
    zoneKey: "ZONE_USA_CANADA",
    zoneName: "USA & Canada",
    courierService: "DHL Express / FedEx Priority",
    estimatedDelivery: "4-6 Working Days",
    basePkr: 9500,
    baseGbp: 26,
    additionalBatGbp: 10,
    additionalPadGbp: 8,
    additionalHelmetGbp: 8,
    additionalBagGbp: 12,
    additionalGloveGbp: 4,
    additionalAccessoryGbp: 2,
  },
  ZONE_AUSTRALIA_NZ: {
    zoneKey: "ZONE_AUSTRALIA_NZ",
    zoneName: "Australia & New Zealand",
    courierService: "DHL Express / FedEx International",
    estimatedDelivery: "5-7 Working Days",
    basePkr: 11000,
    baseGbp: 30,
    additionalBatGbp: 12,
    additionalPadGbp: 9,
    additionalHelmetGbp: 9,
    additionalBagGbp: 14,
    additionalGloveGbp: 5,
    additionalAccessoryGbp: 2.5,
  },
  ZONE_GCC_MIDDLE_EAST: {
    zoneKey: "ZONE_GCC_MIDDLE_EAST",
    zoneName: "GCC & Middle East",
    courierService: "DHL / Aramex Express Tracked",
    estimatedDelivery: "3-5 Working Days",
    basePkr: 8000,
    baseGbp: 22,
    additionalBatGbp: 8,
    additionalPadGbp: 6,
    additionalHelmetGbp: 6,
    additionalBagGbp: 10,
    additionalGloveGbp: 3,
    additionalAccessoryGbp: 1.5,
  },
  ZONE_EUROPE: {
    zoneKey: "ZONE_EUROPE",
    zoneName: "Europe (EU)",
    courierService: "DHL Express Tracked",
    estimatedDelivery: "4-6 Working Days",
    basePkr: 8500,
    baseGbp: 23,
    additionalBatGbp: 9,
    additionalPadGbp: 7,
    additionalHelmetGbp: 7,
    additionalBagGbp: 11,
    additionalGloveGbp: 3.5,
    additionalAccessoryGbp: 1.8,
  },
  ZONE_ASIA: {
    zoneKey: "ZONE_ASIA",
    zoneName: "Asia & Far East",
    courierService: "DHL Express / Air Cargo Tracked",
    estimatedDelivery: "4-6 Working Days",
    basePkr: 9500,
    baseGbp: 26,
    additionalBatGbp: 10,
    additionalPadGbp: 7,
    additionalHelmetGbp: 7,
    additionalBagGbp: 12,
    additionalGloveGbp: 4,
    additionalAccessoryGbp: 2,
  },
  ZONE_REST_OF_WORLD: {
    zoneKey: "ZONE_REST_OF_WORLD",
    zoneName: "Rest of World",
    courierService: "DHL Express Worldwide Tracked",
    estimatedDelivery: "5-8 Working Days",
    basePkr: 11000,
    baseGbp: 30,
    additionalBatGbp: 12,
    additionalPadGbp: 9,
    additionalHelmetGbp: 9,
    additionalBagGbp: 14,
    additionalGloveGbp: 5,
    additionalAccessoryGbp: 2.5,
  },
};

export interface ShippingDestination {
  country: string;
  code: string;
  zone: ShippingZoneKey;
  basePkr: number;
  baseGbp: number;
  additionalItemGbp: number;
  estimatedDelivery: string;
  requiresQuotation?: boolean;
}

export const SHIPPING_DESTINATIONS: Record<string, ShippingDestination> = {
  "Pakistan": {
    country: "Pakistan",
    code: "PK",
    zone: "ZONE_PAKISTAN",
    basePkr: 1000,
    baseGbp: 3,
    additionalItemGbp: 1,
    estimatedDelivery: "2-3 Working Days (TCS / Leopard Tracked)",
  },
  "United Kingdom": {
    country: "United Kingdom",
    code: "GB",
    zone: "ZONE_UK",
    basePkr: 7500,
    baseGbp: 20,
    additionalItemGbp: 8,
    estimatedDelivery: "3-5 Working Days (DHL Express / FedEx)",
  },
  "United States": {
    country: "United States",
    code: "US",
    zone: "ZONE_USA_CANADA",
    basePkr: 9500,
    baseGbp: 26,
    additionalItemGbp: 10,
    estimatedDelivery: "4-6 Working Days (DHL Express / FedEx)",
  },
  "Canada": {
    country: "Canada",
    code: "CA",
    zone: "ZONE_USA_CANADA",
    basePkr: 9500,
    baseGbp: 26,
    additionalItemGbp: 10,
    estimatedDelivery: "4-6 Working Days (DHL Express / FedEx)",
  },
  "Australia": {
    country: "Australia",
    code: "AU",
    zone: "ZONE_AUSTRALIA_NZ",
    basePkr: 11000,
    baseGbp: 30,
    additionalItemGbp: 12,
    estimatedDelivery: "5-7 Working Days (DHL Express / FedEx)",
  },
  "New Zealand": {
    country: "New Zealand",
    code: "NZ",
    zone: "ZONE_AUSTRALIA_NZ",
    basePkr: 12000,
    baseGbp: 33,
    additionalItemGbp: 12,
    estimatedDelivery: "5-7 Working Days (DHL Express / FedEx)",
  },
  "United Arab Emirates": {
    country: "United Arab Emirates",
    code: "AE",
    zone: "ZONE_GCC_MIDDLE_EAST",
    basePkr: 8000,
    baseGbp: 22,
    additionalItemGbp: 8,
    estimatedDelivery: "3-4 Working Days (DHL / Aramex Express)",
  },
  "Saudi Arabia": {
    country: "Saudi Arabia",
    code: "SA",
    zone: "ZONE_GCC_MIDDLE_EAST",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "3-5 Working Days (DHL / Aramex Express)",
  },
  "Qatar": {
    country: "Qatar",
    code: "QA",
    zone: "ZONE_GCC_MIDDLE_EAST",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "3-5 Working Days (DHL / Aramex Express)",
  },
  "Oman": {
    country: "Oman",
    code: "OM",
    zone: "ZONE_GCC_MIDDLE_EAST",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "3-5 Working Days (DHL / Aramex Express)",
  },
  "Kuwait": {
    country: "Kuwait",
    code: "KW",
    zone: "ZONE_GCC_MIDDLE_EAST",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "3-5 Working Days (DHL / Aramex Express)",
  },
  "Bahrain": {
    country: "Bahrain",
    code: "BH",
    zone: "ZONE_GCC_MIDDLE_EAST",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "3-5 Working Days (DHL / Aramex Express)",
  },
  "Ireland": {
    country: "Ireland",
    code: "IE",
    zone: "ZONE_EUROPE",
    basePkr: 8000,
    baseGbp: 22,
    additionalItemGbp: 8,
    estimatedDelivery: "3-5 Working Days (DHL Express)",
  },
  "Germany": {
    country: "Germany",
    code: "DE",
    zone: "ZONE_EUROPE",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "4-6 Working Days (DHL Express)",
  },
  "Netherlands": {
    country: "Netherlands",
    code: "NL",
    zone: "ZONE_EUROPE",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "4-6 Working Days (DHL Express)",
  },
  "France": {
    country: "France",
    code: "FR",
    zone: "ZONE_EUROPE",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "4-6 Working Days (DHL Express)",
  },
  "Italy": {
    country: "Italy",
    code: "IT",
    zone: "ZONE_EUROPE",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "4-6 Working Days (DHL Express)",
  },
  "Switzerland": {
    country: "Switzerland",
    code: "CH",
    zone: "ZONE_EUROPE",
    basePkr: 9500,
    baseGbp: 26,
    additionalItemGbp: 10,
    estimatedDelivery: "4-6 Working Days (DHL Express)",
  },
  "South Africa": {
    country: "South Africa",
    code: "ZA",
    zone: "ZONE_REST_OF_WORLD",
    basePkr: 11000,
    baseGbp: 30,
    additionalItemGbp: 12,
    estimatedDelivery: "5-7 Working Days (DHL Express)",
  },
  "Sri Lanka": {
    country: "Sri Lanka",
    code: "LK",
    zone: "ZONE_ASIA",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "4-6 Working Days (DHL Express / Air Cargo)",
  },
  "Bangladesh": {
    country: "Bangladesh",
    code: "BD",
    zone: "ZONE_ASIA",
    basePkr: 8500,
    baseGbp: 23,
    additionalItemGbp: 9,
    estimatedDelivery: "4-6 Working Days (DHL Express / Air Cargo)",
  },
  "Malaysia": {
    country: "Malaysia",
    code: "MY",
    zone: "ZONE_ASIA",
    basePkr: 9500,
    baseGbp: 26,
    additionalItemGbp: 10,
    estimatedDelivery: "4-6 Working Days (DHL Express)",
  },
  "Singapore": {
    country: "Singapore",
    code: "SG",
    zone: "ZONE_ASIA",
    basePkr: 9500,
    baseGbp: 26,
    additionalItemGbp: 10,
    estimatedDelivery: "4-6 Working Days (DHL Express)",
  },
  "Hong Kong": {
    country: "Hong Kong",
    code: "HK",
    zone: "ZONE_ASIA",
    basePkr: 9500,
    baseGbp: 26,
    additionalItemGbp: 10,
    estimatedDelivery: "4-6 Working Days (DHL Express)",
  },
  "Japan": {
    country: "Japan",
    code: "JP",
    zone: "ZONE_ASIA",
    basePkr: 11000,
    baseGbp: 30,
    additionalItemGbp: 12,
    estimatedDelivery: "5-7 Working Days (DHL Express)",
  },
  "China": {
    country: "China",
    code: "CN",
    zone: "ZONE_ASIA",
    basePkr: 11000,
    baseGbp: 30,
    additionalItemGbp: 12,
    estimatedDelivery: "5-7 Working Days (DHL Express)",
  },
  "Other International": {
    country: "Other International",
    code: "OTHER",
    zone: "ZONE_REST_OF_WORLD",
    basePkr: 11000,
    baseGbp: 30,
    additionalItemGbp: 12,
    estimatedDelivery: "5-8 Working Days (Tracked Worldwide Express)",
  },
};

/**
 * Resolves product category to standardized shipping class
 */
export function getProductShippingClass(categoryName?: string, productName?: string): ShippingClass {
  if (!categoryName && !productName) return "ACCESSORY";
  const cat = (categoryName || "").toLowerCase();
  const name = (productName || "").toLowerCase();

  if (cat.includes("junior") || cat.includes("harrow") || name.includes("junior") || name.includes("harrow")) {
    return "JUNIOR_BAT";
  }
  if (
    cat.includes("bat") &&
    !cat.includes("pad") &&
    !cat.includes("glove") &&
    !cat.includes("bag")
  ) {
    return "BAT";
  }
  if (cat.includes("thigh") || name.includes("thigh")) {
    return "THIGH_PAD";
  }
  if (cat.includes("pad") || name.includes("pad")) {
    return "PADS";
  }
  if (cat.includes("keeping glove") || name.includes("keeping glove")) {
    return "KEEPING_GLOVES";
  }
  if (cat.includes("batting glove") || cat.includes("glove") || name.includes("glove")) {
    return "GLOVES";
  }
  if (cat.includes("bag") || cat.includes("duffle") || name.includes("bag") || name.includes("duffle") || name.includes("wheelie")) {
    return "BAG";
  }
  if (cat.includes("helmet") || name.includes("helmet")) {
    return "HELMET";
  }
  if (cat.includes("custom") || name.includes("custom")) {
    return "CUSTOM_PRODUCT";
  }
  return "ACCESSORY";
}

/**
 * Resolves a destination rate for a given country code or name.
 */
export function getShippingDestination(countryInput: string | null | undefined): ShippingDestination | null {
  if (!countryInput || !countryInput.trim()) {
    return null;
  }

  const resolved = resolveCountry(countryInput);
  if (!resolved) {
    return null;
  }

  if (SHIPPING_DESTINATIONS[resolved.name]) {
    return SHIPPING_DESTINATIONS[resolved.name];
  }

  const byCode = Object.values(SHIPPING_DESTINATIONS).find((d) => d.code === resolved.code);
  if (byCode) {
    return byCode;
  }

  return {
    country: resolved.name,
    code: resolved.code,
    zone: "ZONE_REST_OF_WORLD",
    basePkr: 11000,
    baseGbp: 30,
    additionalItemGbp: 12,
    estimatedDelivery: "5-8 Working Days (Tracked Worldwide Express)",
  };
}

export interface CartItemLike {
  productId?: string;
  product?: {
    id: string;
    name: string;
    category?: string;
    price?: number;
  };
  category?: string;
  name?: string;
  quantity: number;
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
  totalWeightKg: number;
  shipmentBreakdownNote?: string;
}

/**
 * Dynamic Shipping Calculation Engine
 * Calculates multi-item, combined-package, and volumetric courier rates based on destination zone and item types.
 */
export function calculateShippingFee(
  countryInput: string | null | undefined,
  cartOrCount: CartItemLike[] | number
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
      totalWeightKg: 0,
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
      totalWeightKg: 0,
    };
  }

  const zoneConfig = SHIPPING_ZONES[destination.zone] || SHIPPING_ZONES.ZONE_REST_OF_WORLD;

  // Flatten items list to individual item shipping classes
  let itemsList: { shippingClass: ShippingClass; weightKg: number }[] = [];

  if (typeof cartOrCount === "number") {
    const count = Math.max(1, cartOrCount);
    for (let i = 0; i < count; i++) {
      itemsList.push({ shippingClass: "BAT", weightKg: 1.25 });
    }
  } else if (Array.isArray(cartOrCount) && cartOrCount.length > 0) {
    cartOrCount.forEach((it) => {
      const cat = it.category || it.product?.category || "";
      const name = it.name || it.product?.name || "";
      const sClass = getProductShippingClass(cat, name);
      const qty = Math.max(1, it.quantity || 1);

      let weight = 1.25;
      if (sClass === "JUNIOR_BAT") weight = 0.95;
      else if (sClass === "PADS") weight = 1.5;
      else if (sClass === "BAG") weight = 3.0;
      else if (sClass === "HELMET") weight = 0.9;
      else if (sClass === "GLOVES" || sClass === "KEEPING_GLOVES") weight = 0.45;
      else if (sClass === "THIGH_PAD") weight = 0.35;
      else if (sClass === "ACCESSORY") weight = 0.15;

      for (let q = 0; q < qty; q++) {
        itemsList.push({ shippingClass: sClass, weightKg: weight });
      }
    });
  } else {
    itemsList.push({ shippingClass: "BAT", weightKg: 1.25 });
  }

  const totalItems = itemsList.length;
  const totalWeightKg = Math.round(itemsList.reduce((acc, curr) => acc + curr.weightKg, 0) * 100) / 100;

  if (totalItems === 1) {
    const singleClass = itemsList[0].shippingClass;
    let singleFee = destination.baseGbp;

    // Small standalone accessory discount
    if (singleClass === "ACCESSORY" && destination.baseGbp > 10) {
      singleFee = Math.max(8, Math.round(destination.baseGbp * 0.5));
    } else if (singleClass === "GLOVES" && destination.baseGbp > 12) {
      singleFee = Math.max(10, Math.round(destination.baseGbp * 0.7));
    }

    return {
      hasDestination: true,
      countryName: destination.country,
      countryCode: destination.code,
      flag,
      shippingFee: singleFee,
      baseFee: singleFee,
      additionalFee: 0,
      totalSaved: 0,
      perItemRate: singleFee,
      requiresQuotation: false,
      destination,
      displayLabel: `Delivery (${destination.country})`,
      displayAmount: `£${singleFee}`,
      totalWeightKg,
    };
  }

  // Combined packaging calculation:
  // Sort items so primary / largest item sets the base fee
  const classPriority: Record<ShippingClass, number> = {
    BAG: 10,
    BAT: 9,
    CUSTOM_PRODUCT: 9,
    PADS: 8,
    HELMET: 7,
    JUNIOR_BAT: 6,
    KEEPING_GLOVES: 5,
    GLOVES: 4,
    THIGH_PAD: 3,
    ACCESSORY: 2,
  };

  itemsList.sort((a, b) => classPriority[b.shippingClass] - classPriority[a.shippingClass]);

  const baseItem = itemsList[0];
  const primaryBaseGbp = destination.baseGbp;

  let totalAdditionalFee = 0;
  for (let i = 1; i < itemsList.length; i++) {
    const item = itemsList[i];
    switch (item.shippingClass) {
      case "BAT":
      case "CUSTOM_PRODUCT":
        totalAdditionalFee += zoneConfig.additionalBatGbp;
        break;
      case "JUNIOR_BAT":
        totalAdditionalFee += zoneConfig.additionalBatGbp * 0.8;
        break;
      case "PADS":
        totalAdditionalFee += zoneConfig.additionalPadGbp;
        break;
      case "HELMET":
        totalAdditionalFee += zoneConfig.additionalHelmetGbp;
        break;
      case "BAG":
        totalAdditionalFee += zoneConfig.additionalBagGbp;
        break;
      case "GLOVES":
      case "KEEPING_GLOVES":
      case "THIGH_PAD":
        totalAdditionalFee += zoneConfig.additionalGloveGbp;
        break;
      case "ACCESSORY":
      default:
        totalAdditionalFee += zoneConfig.additionalAccessoryGbp;
        break;
    }
  }

  totalAdditionalFee = Math.round(totalAdditionalFee * 10) / 10;
  const shippingFee = Math.round((primaryBaseGbp + totalAdditionalFee) * 10) / 10;

  // Comparison if shipped as separate isolated parcels
  const uncombinedTotal = totalItems * destination.baseGbp;
  const totalSaved = Math.max(0, Math.round((uncombinedTotal - shippingFee) * 10) / 10);
  const perItemRate = Math.round((shippingFee / totalItems) * 10) / 10;

  return {
    hasDestination: true,
    countryName: destination.country,
    countryCode: destination.code,
    flag,
    shippingFee,
    baseFee: primaryBaseGbp,
    additionalFee: totalAdditionalFee,
    totalSaved,
    perItemRate,
    requiresQuotation: false,
    destination,
    displayLabel: `Delivery (${destination.country})`,
    displayAmount: `£${shippingFee}`,
    totalWeightKg,
  };
}

export function getCountryFlag(countryInput: string | null | undefined): string {
  if (!countryInput) return "🌍";
  const resolved = resolveCountry(countryInput);
  return resolved?.flag || "🌍";
}
