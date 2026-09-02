/**
 * International Address Configuration & Regional Datasets
 * Sialkot Cricket Kits — Destination Addressing Rules
 */

export interface StateInfo {
  code: string;
  name: string;
}

export interface CountryAddressConfig {
  code: string; // ISO 3166-1 alpha-2
  requiresState: boolean;
  stateLabel: string;
  states?: StateInfo[];
  requiresPostalCode: boolean;
  postalCodeLabel: string;
  postalCodePlaceholder: string;
  postalCodePattern?: RegExp;
  postalCodeHelp?: string;
}

// 1. Pakistan Provinces & Administrative Territories
export const PAKISTAN_PROVINCES: StateInfo[] = [
  { code: "PB", name: "Punjab" },
  { code: "SD", name: "Sindh" },
  { code: "KP", name: "Khyber Pakhtunkhwa" },
  { code: "BA", name: "Balochistan" },
  { code: "ICT", name: "Islamabad Capital Territory" },
  { code: "GB", name: "Gilgit-Baltistan" },
  { code: "AJK", name: "Azad Jammu and Kashmir" },
];

export function inferProvinceFromCity(cityName?: string | null): string | null {
  if (!cityName) return null;
  const c = cityName.trim().toLowerCase();
  
  if (/sialkot|lahore|rawalpindi|faisalabad|multan|gujranwala|bahawalpur|sargodha|sahiwal|sheikhupura|jhelum|gujrat|kasur|rahim yar khan|okara|ch определя|attock|mianwali|chakwal/i.test(c)) {
    return "Punjab";
  }
  if (/karachi|hyderabad|sukkur|larkana|nawabshah|mirpur khas|thatta|jacobabad|shikarpur/i.test(c)) {
    return "Sindh";
  }
  if (/peshawar|abbottabad|mardan|swat|kohat|dera ismail khan|haripur|nowshera|charsadda|bannu/i.test(c)) {
    return "Khyber Pakhtunkhwa";
  }
  if (/quetta|gwadar|turbat|khuzdar|chaman|sibi|hub|zhob/i.test(c)) {
    return "Balochistan";
  }
  if (/islamabad/i.test(c)) {
    return "Islamabad Capital Territory";
  }
  if (/muzaffarabad|mirpur|rawalakot|kotli|bhimber/i.test(c)) {
    return "Azad Jammu and Kashmir";
  }
  if (/gilgit|skardu|hunza|diamer/i.test(c)) {
    return "Gilgit-Baltistan";
  }
  return null;
}


// 2. United States 50 States + DC
export const US_STATES: StateInfo[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN_US", name: "Indiana" }, // differentiated key for US State Indiana
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
];

// 3. Canada Provinces & Territories
export const CANADA_PROVINCES: StateInfo[] = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "YT", name: "Yukon" },
];

// 4. Australia States & Territories
export const AUSTRALIA_STATES: StateInfo[] = [
  { code: "NSW", name: "New South Wales" },
  { code: "VIC", name: "Victoria" },
  { code: "QLD", name: "Queensland" },
  { code: "WA", name: "Western Australia" },
  { code: "SA", name: "South Australia" },
  { code: "TAS", name: "Tasmania" },
  { code: "ACT", name: "Australian Capital Territory" },
  { code: "NT", name: "Northern Territory" },
];

// 5. UAE Emirates
export const UAE_EMIRATES: StateInfo[] = [
  { code: "DXB", name: "Dubai" },
  { code: "AUH", name: "Abu Dhabi" },
  { code: "SHJ", name: "Sharjah" },
  { code: "AJM", name: "Ajman" },
  { code: "RAK", name: "Ras Al Khaimah" },
  { code: "FUJ", name: "Fujairah" },
  { code: "UAQ", name: "Umm Al Quwain" },
];

// Country configuration map
export const ADDRESS_CONFIGS: Record<string, CountryAddressConfig> = {
  // United Kingdom
  GB: {
    code: "GB",
    requiresState: false,
    stateLabel: "County / Region",
    requiresPostalCode: true,
    postalCodeLabel: "Postcode *",
    postalCodePlaceholder: "e.g. SW1A 1AA / EC1A 1BB",
    postalCodePattern: /^[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2}$/i,
    postalCodeHelp: "Standard UK Postcode (e.g. SW1A 1AA)",
  },
  // Pakistan
  PK: {
    code: "PK",
    requiresState: true,
    stateLabel: "Province *",
    states: PAKISTAN_PROVINCES,
    requiresPostalCode: true,
    postalCodeLabel: "Postal Code *",
    postalCodePlaceholder: "e.g. 51310 / 54000",
    postalCodePattern: /^[0-9]{5}$/,
    postalCodeHelp: "5-digit Pakistan Postal Code (e.g. 51310 for Sialkot)",
  },
  // United States
  US: {
    code: "US",
    requiresState: true,
    stateLabel: "State *",
    states: US_STATES,
    requiresPostalCode: true,
    postalCodeLabel: "ZIP Code *",
    postalCodePlaceholder: "e.g. 10001 or 90210-1234",
    postalCodePattern: /^[0-9]{5}(?:-[0-9]{4})?$/,
    postalCodeHelp: "5-digit ZIP Code or ZIP+4 (e.g. 10001)",
  },
  // Canada
  CA: {
    code: "CA",
    requiresState: true,
    stateLabel: "Province *",
    states: CANADA_PROVINCES,
    requiresPostalCode: true,
    postalCodeLabel: "Postal Code *",
    postalCodePlaceholder: "e.g. M5V 3A8",
    postalCodePattern: /^[A-Z][0-9][A-Z]\s*[0-9][A-Z][0-9]$/i,
    postalCodeHelp: "Canadian Postal Code (e.g. M5V 3A8)",
  },
  // Australia
  AU: {
    code: "AU",
    requiresState: true,
    stateLabel: "State / Territory *",
    states: AUSTRALIA_STATES,
    requiresPostalCode: true,
    postalCodeLabel: "Postcode *",
    postalCodePlaceholder: "e.g. 2000 / 3000",
    postalCodePattern: /^[0-9]{4}$/,
    postalCodeHelp: "4-digit Australian Postcode (e.g. 2000 for Sydney)",
  },
  // United Arab Emirates
  AE: {
    code: "AE",
    requiresState: false,
    stateLabel: "Emirate (Optional)",
    states: UAE_EMIRATES,
    requiresPostalCode: false,
    postalCodeLabel: "PO Box / Postal Code (Optional)",
    postalCodePlaceholder: "e.g. 00000 or PO Box 12345",
  },
  // Germany
  DE: {
    code: "DE",
    requiresState: false,
    stateLabel: "State / Region",
    requiresPostalCode: true,
    postalCodeLabel: "Postal Code *",
    postalCodePlaceholder: "e.g. 10115 / 80331",
    postalCodePattern: /^[0-9]{5}$/,
    postalCodeHelp: "5-digit German PLZ (e.g. 10115 for Berlin)",
  },
  // France
  FR: {
    code: "FR",
    requiresState: false,
    stateLabel: "Region / Department",
    requiresPostalCode: true,
    postalCodeLabel: "Postal Code *",
    postalCodePlaceholder: "e.g. 75001 / 69001",
    postalCodePattern: /^[0-9]{5}$/,
    postalCodeHelp: "5-digit French Code Postal (e.g. 75001)",
  },
  // Ireland
  IE: {
    code: "IE",
    requiresState: false,
    stateLabel: "County",
    requiresPostalCode: false,
    postalCodeLabel: "Eircode / Postal Code (Optional)",
    postalCodePlaceholder: "e.g. D02 X285",
    postalCodePattern: /^[A-Z0-9]{3}\s*[A-Z0-9]{4}$/i,
    postalCodeHelp: "7-character Irish Eircode (e.g. D02 X285)",
  },
  // New Zealand
  NZ: {
    code: "NZ",
    requiresState: false,
    stateLabel: "Region",
    requiresPostalCode: true,
    postalCodeLabel: "Postcode *",
    postalCodePlaceholder: "e.g. 1010 / 6011",
    postalCodePattern: /^[0-9]{4}$/,
    postalCodeHelp: "4-digit New Zealand Postcode",
  },
  // South Africa
  ZA: {
    code: "ZA",
    requiresState: false,
    stateLabel: "Province",
    requiresPostalCode: true,
    postalCodeLabel: "Postal Code *",
    postalCodePlaceholder: "e.g. 2000 / 8001",
    postalCodePattern: /^[0-9]{4}$/,
    postalCodeHelp: "4-digit South African Postal Code",
  },
  // Saudi Arabia
  SA: {
    code: "SA",
    requiresState: false,
    stateLabel: "Province / Region",
    requiresPostalCode: false,
    postalCodeLabel: "Postal Code (Optional)",
    postalCodePlaceholder: "e.g. 12271",
    postalCodePattern: /^[0-9]{5}$/,
  },
};

export function getAddressConfig(countryCode: string | null | undefined): CountryAddressConfig {
  if (!countryCode) {
    return {
      code: "DEFAULT",
      requiresState: false,
      stateLabel: "State / Region / County",
      requiresPostalCode: false,
      postalCodeLabel: "Postal / ZIP Code (Optional)",
      postalCodePlaceholder: "e.g. SW1A 1AA / 51310 / 10001",
    };
  }

  const upper = countryCode.trim().toUpperCase();
  if (ADDRESS_CONFIGS[upper]) {
    return ADDRESS_CONFIGS[upper];
  }

  return {
    code: upper,
    requiresState: false,
    stateLabel: "State / Region / County",
    requiresPostalCode: false,
    postalCodeLabel: "Postal / ZIP Code (Optional)",
    postalCodePlaceholder: "e.g. Postal / ZIP code",
  };
}
