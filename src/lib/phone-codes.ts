/**
 * International Country Calling Codes Dataset
 * Sialkot Cricket Kits — Official Calling Code Directory
 * 
 * Rules:
 * - Comprehensive international dialing codes with ISO country codes, flags, and format hints.
 * - Prioritized popular cricket & international trade destinations at the top.
 * - Strict exclusion of India (IN / +91).
 */

export interface PhoneCountryCode {
  code: string; // ISO 3166-1 alpha-2 (e.g. "PK", "GB", "US", "AE")
  name: string; // Country name
  dialCode: string; // Calling prefix (e.g. "+92", "+44", "+1", "+971")
  flag: string; // Flag emoji
  example: string; // Local format placeholder example
  minNationalDigits: number; // Min length of national subscriber number
  maxNationalDigits: number; // Max length of national subscriber number
  isPopular?: boolean;
}

// Strictly excluding India (IN / +91)
const RAW_PHONE_CODES: PhoneCountryCode[] = [
  // 1. Popular Destinations (Prioritized Top)
  {
    code: "PK",
    name: "Pakistan",
    dialCode: "+92",
    flag: "🇵🇰",
    example: "300 1234567",
    minNationalDigits: 9,
    maxNationalDigits: 10,
    isPopular: true,
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    flag: "🇬🇧",
    example: "7700 900123",
    minNationalDigits: 9,
    maxNationalDigits: 11,
    isPopular: true,
  },
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flag: "🇺🇸",
    example: "202 555 0123",
    minNationalDigits: 10,
    maxNationalDigits: 10,
    isPopular: true,
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "+971",
    flag: "🇦🇪",
    example: "50 123 4567",
    minNationalDigits: 8,
    maxNationalDigits: 9,
    isPopular: true,
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "+61",
    flag: "🇦🇺",
    example: "412 345 678",
    minNationalDigits: 9,
    maxNationalDigits: 10,
    isPopular: true,
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    flag: "🇨🇦",
    example: "416 555 0123",
    minNationalDigits: 10,
    maxNationalDigits: 10,
    isPopular: true,
  },
  {
    code: "NZ",
    name: "New Zealand",
    dialCode: "+64",
    flag: "🇳🇿",
    example: "21 123 4567",
    minNationalDigits: 8,
    maxNationalDigits: 10,
    isPopular: true,
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    dialCode: "+966",
    flag: "🇸🇦",
    example: "50 123 4567",
    minNationalDigits: 9,
    maxNationalDigits: 9,
    isPopular: true,
  },
  {
    code: "QA",
    name: "Qatar",
    dialCode: "+974",
    flag: "🇶🇦",
    example: "3312 3456",
    minNationalDigits: 8,
    maxNationalDigits: 8,
    isPopular: true,
  },
  {
    code: "OM",
    name: "Oman",
    dialCode: "+968",
    flag: "🇴🇲",
    example: "9123 4567",
    minNationalDigits: 8,
    maxNationalDigits: 8,
    isPopular: true,
  },
  {
    code: "KW",
    name: "Kuwait",
    dialCode: "+965",
    flag: "🇰🇼",
    example: "9123 4567",
    minNationalDigits: 8,
    maxNationalDigits: 8,
    isPopular: true,
  },
  {
    code: "BH",
    name: "Bahrain",
    dialCode: "+973",
    flag: "🇧🇭",
    example: "3600 1234",
    minNationalDigits: 8,
    maxNationalDigits: 8,
    isPopular: true,
  },
  {
    code: "IE",
    name: "Ireland",
    dialCode: "+353",
    flag: "🇮🇪",
    example: "85 123 4567",
    minNationalDigits: 9,
    maxNationalDigits: 10,
    isPopular: true,
  },
  {
    code: "DE",
    name: "Germany",
    dialCode: "+49",
    flag: "🇩🇪",
    example: "151 12345678",
    minNationalDigits: 10,
    maxNationalDigits: 11,
    isPopular: true,
  },
  {
    code: "ZA",
    name: "South Africa",
    dialCode: "+27",
    flag: "🇿🇦",
    example: "71 123 4567",
    minNationalDigits: 9,
    maxNationalDigits: 10,
    isPopular: true,
  },
  {
    code: "LK",
    name: "Sri Lanka",
    dialCode: "+94",
    flag: "🇱🇰",
    example: "71 234 5678",
    minNationalDigits: 9,
    maxNationalDigits: 9,
    isPopular: true,
  },
  {
    code: "BD",
    name: "Bangladesh",
    dialCode: "+880",
    flag: "🇧🇩",
    example: "1712 345678",
    minNationalDigits: 10,
    maxNationalDigits: 10,
    isPopular: true,
  },
  {
    code: "MY",
    name: "Malaysia",
    dialCode: "+60",
    flag: "🇲🇾",
    example: "12 345 6789",
    minNationalDigits: 9,
    maxNationalDigits: 10,
    isPopular: true,
  },
  {
    code: "SG",
    name: "Singapore",
    dialCode: "+65",
    flag: "🇸🇬",
    example: "8123 4567",
    minNationalDigits: 8,
    maxNationalDigits: 8,
    isPopular: true,
  },
  {
    code: "NL",
    name: "Netherlands",
    dialCode: "+31",
    flag: "🇳🇱",
    example: "6 12345678",
    minNationalDigits: 9,
    maxNationalDigits: 9,
    isPopular: true,
  },
  {
    code: "FR",
    name: "France",
    dialCode: "+33",
    flag: "🇫🇷",
    example: "6 12 34 56 78",
    minNationalDigits: 9,
    maxNationalDigits: 9,
    isPopular: true,
  },
  {
    code: "IT",
    name: "Italy",
    dialCode: "+39",
    flag: "🇮🇹",
    example: "312 345 6789",
    minNationalDigits: 9,
    maxNationalDigits: 10,
    isPopular: true,
  },
  {
    code: "CH",
    name: "Switzerland",
    dialCode: "+41",
    flag: "🇨🇭",
    example: "78 123 45 67",
    minNationalDigits: 9,
    maxNationalDigits: 9,
    isPopular: true,
  },
  {
    code: "BE",
    name: "Belgium",
    dialCode: "+32",
    flag: "🇧🇪",
    example: "470 12 34 56",
    minNationalDigits: 9,
    maxNationalDigits: 9,
    isPopular: true,
  },
  {
    code: "ES",
    name: "Spain",
    dialCode: "+34",
    flag: "🇪🇸",
    example: "612 34 56 78",
    minNationalDigits: 9,
    maxNationalDigits: 9,
    isPopular: true,
  },
  {
    code: "PT",
    name: "Portugal",
    dialCode: "+351",
    flag: "🇵🇹",
    example: "912 345 678",
    minNationalDigits: 9,
    maxNationalDigits: 9,
    isPopular: true,
  },
  {
    code: "NO",
    name: "Norway",
    dialCode: "+47",
    flag: "🇳🇴",
    example: "412 34 567",
    minNationalDigits: 8,
    maxNationalDigits: 8,
    isPopular: true,
  },
  {
    code: "SE",
    name: "Sweden",
    dialCode: "+46",
    flag: "🇸🇪",
    example: "70 123 45 67",
    minNationalDigits: 9,
    maxNationalDigits: 9,
    isPopular: true,
  },
  {
    code: "DK",
    name: "Denmark",
    dialCode: "+45",
    flag: "🇩🇰",
    example: "20 12 34 56",
    minNationalDigits: 8,
    maxNationalDigits: 8,
    isPopular: true,
  },
  {
    code: "JP",
    name: "Japan",
    dialCode: "+81",
    flag: "🇯🇵",
    example: "90 1234 5678",
    minNationalDigits: 10,
    maxNationalDigits: 10,
    isPopular: true,
  },
  {
    code: "CN",
    name: "China",
    dialCode: "+86",
    flag: "🇨🇳",
    example: "138 0013 8000",
    minNationalDigits: 11,
    maxNationalDigits: 11,
    isPopular: true,
  },
  {
    code: "HK",
    name: "Hong Kong",
    dialCode: "+852",
    flag: "🇭🇰",
    example: "9123 4567",
    minNationalDigits: 8,
    maxNationalDigits: 8,
    isPopular: true,
  },

  // 2. All Other International Calling Codes (Alphabetical)
  { code: "AF", name: "Afghanistan", dialCode: "+93", flag: "🇦🇫", example: "70 123 4567", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "AL", name: "Albania", dialCode: "+355", flag: "🇦🇱", example: "67 123 4567", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "DZ", name: "Algeria", dialCode: "+213", flag: "🇩🇿", example: "551 23 45 67", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "AD", name: "Andorra", dialCode: "+376", flag: "🇦🇩", example: "312 345", minNationalDigits: 6, maxNationalDigits: 6 },
  { code: "AO", name: "Angola", dialCode: "+244", flag: "🇦🇴", example: "923 123 456", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷", example: "9 11 1234 5678", minNationalDigits: 10, maxNationalDigits: 11 },
  { code: "AM", name: "Armenia", dialCode: "+374", flag: "🇦🇲", example: "77 123456", minNationalDigits: 8, maxNationalDigits: 8 },
  { code: "AT", name: "Austria", dialCode: "+43", flag: "🇦🇹", example: "664 1234567", minNationalDigits: 10, maxNationalDigits: 11 },
  { code: "AZ", name: "Azerbaijan", dialCode: "+994", flag: "🇦🇿", example: "50 123 45 67", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "BS", name: "Bahamas", dialCode: "+1242", flag: "🇧🇸", example: "359 1234", minNationalDigits: 7, maxNationalDigits: 7 },
  { code: "BB", name: "Barbados", dialCode: "+1246", flag: "🇧🇧", example: "230 1234", minNationalDigits: 7, maxNationalDigits: 7 },
  { code: "BY", name: "Belarus", dialCode: "+375", flag: "🇧🇾", example: "29 123 45 67", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "BZ", name: "Belize", dialCode: "+501", flag: "🇧🇿", example: "612 3456", minNationalDigits: 7, maxNationalDigits: 7 },
  { code: "BM", name: "Bermuda", dialCode: "+1441", flag: "🇧🇲", example: "300 1234", minNationalDigits: 7, maxNationalDigits: 7 },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷", example: "11 91234 5678", minNationalDigits: 10, maxNationalDigits: 11 },
  { code: "BN", name: "Brunei", dialCode: "+673", flag: "🇧🇳", example: "712 3456", minNationalDigits: 7, maxNationalDigits: 7 },
  { code: "BG", name: "Bulgaria", dialCode: "+359", flag: "🇧🇬", example: "87 123 4567", minNationalDigits: 8, maxNationalDigits: 9 },
  { code: "KH", name: "Cambodia", dialCode: "+855", flag: "🇰🇭", example: "12 345 678", minNationalDigits: 8, maxNationalDigits: 9 },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱", example: "9 1234 5678", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴", example: "300 123 4567", minNationalDigits: 10, maxNationalDigits: 10 },
  { code: "CR", name: "Costa Rica", dialCode: "+506", flag: "🇨🇷", example: "8312 3456", minNationalDigits: 8, maxNationalDigits: 8 },
  { code: "HR", name: "Croatia", dialCode: "+385", flag: "🇭🇷", example: "91 123 4567", minNationalDigits: 8, maxNationalDigits: 9 },
  { code: "CY", name: "Cyprus", dialCode: "+357", flag: "🇨🇾", example: "96 123456", minNationalDigits: 8, maxNationalDigits: 8 },
  { code: "CZ", name: "Czech Republic", dialCode: "+420", flag: "🇨🇿", example: "601 123 456", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬", example: "100 123 4567", minNationalDigits: 10, maxNationalDigits: 10 },
  { code: "EE", name: "Estonia", dialCode: "+372", flag: "🇪🇪", example: "5123 4567", minNationalDigits: 7, maxNationalDigits: 8 },
  { code: "ET", name: "Ethiopia", dialCode: "+251", flag: "🇪🇹", example: "91 123 4567", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "FI", name: "Finland", dialCode: "+358", flag: "🇫🇮", example: "40 123 4567", minNationalDigits: 9, maxNationalDigits: 10 },
  { code: "GE", name: "Georgia", dialCode: "+995", flag: "🇬🇪", example: "599 12 34 56", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "GH", name: "Ghana", dialCode: "+233", flag: "🇬🇭", example: "24 123 4567", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "GR", name: "Greece", dialCode: "+30", flag: "🇬🇷", example: "691 234 5678", minNationalDigits: 10, maxNationalDigits: 10 },
  { code: "GY", name: "Guyana", dialCode: "+592", flag: "🇬🇾", example: "612 3456", minNationalDigits: 7, maxNationalDigits: 7 },
  { code: "HU", name: "Hungary", dialCode: "+36", flag: "🇭🇺", example: "20 123 4567", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "IS", name: "Iceland", dialCode: "+354", flag: "🇮🇸", example: "612 3456", minNationalDigits: 7, maxNationalDigits: 7 },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩", example: "812 3456 789", minNationalDigits: 9, maxNationalDigits: 11 },
  { code: "IQ", name: "Iraq", dialCode: "+964", flag: "🇮🇶", example: "790 123 4567", minNationalDigits: 10, maxNationalDigits: 10 },
  { code: "JM", name: "Jamaica", dialCode: "+1876", flag: "🇯🇲", example: "301 2345", minNationalDigits: 7, maxNationalDigits: 7 },
  { code: "JO", name: "Jordan", dialCode: "+962", flag: "🇯🇴", example: "7 9012 3456", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "KZ", name: "Kazakhstan", dialCode: "+7", flag: "🇰🇿", example: "701 123 4567", minNationalDigits: 10, maxNationalDigits: 10 },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪", example: "712 345678", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷", example: "10 1234 5678", minNationalDigits: 9, maxNationalDigits: 10 },
  { code: "LV", name: "Latvia", dialCode: "+371", flag: "🇱🇻", example: "21 234 567", minNationalDigits: 8, maxNationalDigits: 8 },
  { code: "LB", name: "Lebanon", dialCode: "+961", flag: "🇱🇧", example: "70 123 456", minNationalDigits: 8, maxNationalDigits: 8 },
  { code: "LT", name: "Lithuania", dialCode: "+370", flag: "🇱🇹", example: "612 34567", minNationalDigits: 8, maxNationalDigits: 8 },
  { code: "LU", name: "Luxembourg", dialCode: "+352", flag: "🇱🇺", example: "621 123 456", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "MV", name: "Maldives", dialCode: "+960", flag: "🇲🇻", example: "771 2345", minNationalDigits: 7, maxNationalDigits: 7 },
  { code: "MT", name: "Malta", dialCode: "+356", flag: "🇲🇹", example: "9912 3456", minNationalDigits: 8, maxNationalDigits: 8 },
  { code: "MU", name: "Mauritius", dialCode: "+230", flag: "🇲🇺", example: "5123 4567", minNationalDigits: 8, maxNationalDigits: 8 },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽", example: "55 1234 5678", minNationalDigits: 10, maxNationalDigits: 10 },
  { code: "MA", name: "Morocco", dialCode: "+212", flag: "🇲🇦", example: "661 23 45 67", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "NP", name: "Nepal", dialCode: "+977", flag: "🇳🇵", example: "984 1234567", minNationalDigits: 10, maxNationalDigits: 10 },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬", example: "802 123 4567", minNationalDigits: 10, maxNationalDigits: 10 },
  { code: "PA", name: "Panama", dialCode: "+507", flag: "🇵🇦", example: "6123 4567", minNationalDigits: 8, maxNationalDigits: 8 },
  { code: "PE", name: "Peru", dialCode: "+51", flag: "🇵🇪", example: "912 345 678", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭", example: "917 123 4567", minNationalDigits: 10, maxNationalDigits: 10 },
  { code: "PL", name: "Poland", dialCode: "+48", flag: "🇵🇱", example: "512 345 678", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "RO", name: "Romania", dialCode: "+40", flag: "🇷🇴", example: "712 345 678", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "RU", name: "Russia", dialCode: "+7", flag: "🇷🇺", example: "912 345 67 89", minNationalDigits: 10, maxNationalDigits: 10 },
  { code: "RS", name: "Serbia", dialCode: "+381", flag: "🇷🇸", example: "60 123 4567", minNationalDigits: 8, maxNationalDigits: 9 },
  { code: "SK", name: "Slovakia", dialCode: "+421", flag: "🇸🇰", example: "912 345 678", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "SI", name: "Slovenia", dialCode: "+386", flag: "🇸🇮", example: "31 123 456", minNationalDigits: 8, maxNationalDigits: 8 },
  { code: "TT", name: "Trinidad and Tobago", dialCode: "+1868", flag: "🇹🇹", example: "301 2345", minNationalDigits: 7, maxNationalDigits: 7 },
  { code: "TN", name: "Tunisia", dialCode: "+216", flag: "🇹🇳", example: "20 123 456", minNationalDigits: 8, maxNationalDigits: 8 },
  { code: "TR", name: "Turkey", dialCode: "+90", flag: "🇹🇷", example: "532 123 45 67", minNationalDigits: 10, maxNationalDigits: 10 },
  { code: "UA", name: "Ukraine", dialCode: "+380", flag: "🇺🇦", example: "50 123 4567", minNationalDigits: 9, maxNationalDigits: 9 },
  { code: "VN", name: "Vietnam", dialCode: "+84", flag: "🇻🇳", example: "91 234 56 78", minNationalDigits: 9, maxNationalDigits: 10 },
  { code: "ZW", name: "Zimbabwe", dialCode: "+263", flag: "🇿🇼", example: "77 123 4567", minNationalDigits: 9, maxNationalDigits: 9 },
];

// Strict filter to guarantee India (IN / +91) is never present
export const ALL_PHONE_CODES: PhoneCountryCode[] = RAW_PHONE_CODES.filter(
  (p) => p.code !== "IN" && p.dialCode !== "+91" && !p.name.toLowerCase().includes("india")
);

export const POPULAR_PHONE_CODES: PhoneCountryCode[] = ALL_PHONE_CODES.filter((p) => p.isPopular);

const DIAL_MAP = new Map<string, PhoneCountryCode>();
const CODE_MAP = new Map<string, PhoneCountryCode>();

ALL_PHONE_CODES.forEach((p) => {
  if (!DIAL_MAP.has(p.dialCode)) {
    DIAL_MAP.set(p.dialCode, p);
  }
  CODE_MAP.set(p.code.toUpperCase(), p);
});

export function getPhoneCountryByCode(code: string | null | undefined): PhoneCountryCode | null {
  if (!code) return null;
  const clean = code.trim().toUpperCase();
  if (clean === "IN") return null;
  return CODE_MAP.get(clean) || null;
}

export function getPhoneCountryByDialCode(dialCode: string | null | undefined): PhoneCountryCode | null {
  if (!dialCode) return null;
  const clean = dialCode.trim();
  if (clean === "+91") return null;
  return DIAL_MAP.get(clean) || null;
}

/**
 * Parses any raw phone string and attempts to match a dial code
 */
export function extractDialCode(phone: string): { country: PhoneCountryCode | null; nationalNumber: string } {
  const clean = phone.trim();
  if (!clean.startsWith("+")) {
    return { country: null, nationalNumber: clean };
  }

  // Reject India immediately
  if (clean.startsWith("+91")) {
    return { country: null, nationalNumber: clean };
  }

  // Sort dial codes by length descending (e.g. +1876, +880, +971, +44, +1)
  const sorted = [...ALL_PHONE_CODES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const p of sorted) {
    if (clean.startsWith(p.dialCode)) {
      const remainder = clean.slice(p.dialCode.length).trim();
      return { country: p, nationalNumber: remainder };
    }
  }

  return { country: null, nationalNumber: clean };
}
