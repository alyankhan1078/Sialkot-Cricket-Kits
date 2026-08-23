// Shipping rate configuration and tiered multi-item calculation (PKR -> GBP)

export interface ShippingDestination {
  country: string;
  code: string;
  basePkr: number;
  baseGbp: number; // 1st item shipping cost
  additionalItemGbp: number; // Additional cost per extra item (volume discount)
  estimatedDelivery: string;
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
  "South Africa": {
    country: "South Africa",
    code: "ZA",
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

export function getShippingDestination(countryName: string): ShippingDestination {
  return SHIPPING_DESTINATIONS[countryName] || SHIPPING_DESTINATIONS["United Kingdom"];
}

/**
 * Calculates tiered shipping fee with combined box volume discounts.
 * 1st item pays base country shipping.
 * Each additional item receives a massive discounted combined shipping fee.
 */
export function calculateShippingFee(countryName: string, totalItemCount: number): {
  shippingFee: number;
  baseFee: number;
  additionalFee: number;
  totalSaved: number;
  perItemRate: number;
  destination: ShippingDestination;
} {
  const destination = getShippingDestination(countryName);
  const count = Math.max(1, totalItemCount);

  if (count === 1) {
    return {
      shippingFee: destination.baseGbp,
      baseFee: destination.baseGbp,
      additionalFee: 0,
      totalSaved: 0,
      perItemRate: destination.baseGbp,
      destination,
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
    shippingFee,
    baseFee: destination.baseGbp,
    additionalFee,
    totalSaved,
    perItemRate,
    destination,
  };
}

export function getCountryFlag(countryName: string): string {
  switch (countryName) {
    case "United Kingdom": return "🇬🇧";
    case "United States": return "🇺🇸";
    case "Canada": return "🇨🇦";
    case "Australia": return "🇦🇺";
    case "New Zealand": return "🇳🇿";
    case "Pakistan": return "🇵🇰";
    case "United Arab Emirates": return "🇦🇪";
    case "Saudi Arabia": return "🇸🇦";
    case "Ireland": return "🇮🇪";
    case "Germany": return "🇩🇪";
    case "Netherlands": return "🇳🇱";
    case "South Africa": return "🇿🇦";
    default: return "🌍";
  }
}
