// Multi-currency rates, formatting, and automated geolocation detection

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rateFromGbp: number; // 1 GBP = X in this currency
  decimals: number;
  prefix: boolean; // true = "$100", false = "100 PKR"
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  GBP: {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    flag: "🇬🇧",
    rateFromGbp: 1.0,
    decimals: 0,
    prefix: true,
  },
  USD: {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    flag: "🇺🇸",
    rateFromGbp: 1.30,
    decimals: 0,
    prefix: true,
  },
  PKR: {
    code: "PKR",
    name: "Pakistani Rupee",
    symbol: "Rs",
    flag: "🇵🇰",
    rateFromGbp: 370,
    decimals: 0,
    prefix: true,
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    flag: "🇪🇺",
    rateFromGbp: 1.18,
    decimals: 0,
    prefix: true,
  },
  AUD: {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    flag: "🇦🇺",
    rateFromGbp: 1.98,
    decimals: 0,
    prefix: true,
  },
  CAD: {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "C$",
    flag: "🇨🇦",
    rateFromGbp: 1.78,
    decimals: 0,
    prefix: true,
  },
  AED: {
    code: "AED",
    name: "UAE Dirham",
    symbol: "AED",
    flag: "🇦🇪",
    rateFromGbp: 4.77,
    decimals: 0,
    prefix: false,
  },
  SAR: {
    code: "SAR",
    name: "Saudi Riyal",
    symbol: "SAR",
    flag: "🇸🇦",
    rateFromGbp: 4.87,
    decimals: 0,
    prefix: false,
  },
  NZD: {
    code: "NZD",
    name: "New Zealand Dollar",
    symbol: "NZ$",
    flag: "🇳🇿",
    rateFromGbp: 2.18,
    decimals: 0,
    prefix: true,
  },
};

export const DEFAULT_CURRENCY = "GBP";

// Convert GBP amount to target currency amount
export function convertGbpToCurrency(amountInGbp: number, currencyCode: string = "GBP"): number {
  const config = CURRENCIES[currencyCode] || CURRENCIES.GBP;
  const converted = amountInGbp * config.rateFromGbp;
  return config.decimals === 0 ? Math.round(converted) : Number(converted.toFixed(config.decimals));
}

// Format price with proper currency symbol and formatting
export function formatCurrencyPrice(
  amountInGbp: number,
  currencyCode: string = "GBP",
  options?: { showGbpSubtext?: boolean }
): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.GBP;
  const converted = convertGbpToCurrency(amountInGbp, currencyCode);

  const formattedNumber = converted.toLocaleString(
    currencyCode === "PKR" ? "en-PK" : "en-US",
    {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }
  );

  let formattedPrice = "";
  if (config.prefix) {
    formattedPrice = `${config.symbol} ${formattedNumber}`;
  } else {
    formattedPrice = `${formattedNumber} ${config.symbol}`;
  }

  if (options?.showGbpSubtext && currencyCode !== "GBP") {
    formattedPrice += ` (£${amountInGbp.toLocaleString("en-GB")})`;
  }

  return formattedPrice;
}

// Map Country Code (ISO 3166-1 alpha-2) to Currency Code
export const COUNTRY_TO_CURRENCY_MAP: Record<string, string> = {
  PK: "GBP", // Pakistani customers see Pounds (£ / GBP)
  GB: "GBP", // United Kingdom
  UK: "GBP",
  US: "USD", // United States
  CA: "CAD", // Canada
  AU: "AUD", // Australia
  NZ: "NZD", // New Zealand
  AE: "AED", // United Arab Emirates
  SA: "SAR", // Saudi Arabia
  // Eurozone countries
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  IE: "EUR",
  BE: "EUR",
  AT: "EUR",
  PT: "EUR",
  GR: "EUR",
  FI: "EUR",
  CY: "EUR",
};

// Map Timezones to default currency when offline / fast client-side check
export function detectCurrencyFromTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Karachi") || tz.includes("Pakistan")) return "GBP";
    if (
      tz.includes("New_York") ||
      tz.includes("Chicago") ||
      tz.includes("Los_Angeles") ||
      tz.includes("Denver") ||
      tz.includes("Phoenix") ||
      tz.includes("Anchorage") ||
      tz.includes("Honolulu") ||
      tz.startsWith("America/Indiana") ||
      tz.startsWith("America/Kentucky") ||
      tz.startsWith("US/")
    ) {
      return "USD";
    }
    if (tz.includes("London")) return "GBP";
    if (
      tz.includes("Sydney") ||
      tz.includes("Melbourne") ||
      tz.includes("Brisbane") ||
      tz.includes("Perth") ||
      tz.includes("Adelaide") ||
      tz.includes("Hobart") ||
      tz.includes("Darwin") ||
      tz.startsWith("Australia/")
    ) {
      return "AUD";
    }
    if (
      tz.includes("Toronto") ||
      tz.includes("Vancouver") ||
      tz.includes("Montreal") ||
      tz.includes("Edmonton") ||
      tz.includes("Winnipeg") ||
      tz.startsWith("Canada/")
    ) {
      return "CAD";
    }
    if (tz.includes("Auckland") || tz.includes("Wellington") || tz.includes("Chatham")) return "NZD";
    if (tz.includes("Dubai")) return "AED";
    if (tz.includes("Riyadh")) return "SAR";
    if (
      tz.includes("Paris") ||
      tz.includes("Berlin") ||
      tz.includes("Rome") ||
      tz.includes("Madrid") ||
      tz.includes("Amsterdam") ||
      tz.includes("Dublin") ||
      tz.includes("Brussels") ||
      tz.includes("Vienna")
    ) {
      return "EUR";
    }
  } catch {
    // fallback
  }
  return DEFAULT_CURRENCY;
}
