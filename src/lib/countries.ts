/**
 * ISO 3166-1 Country and Destination Dataset
 * Sialkot Cricket Kits — Official International Destinations
 *
 * Requirements:
 * - Full international coverage with ISO-3166-1 alpha-2 codes and emoji flags.
 * - Popular destinations prioritized near the top.
 * - Robust search supporting common aliases (e.g. "Dubai" -> UAE, "England" -> UK, "USA" -> United States).
 * - Strict exclusion of India (IN) across all lists, searches, and backend validations.
 */

export interface CountryInfo {
  code: string; // ISO 3166-1 alpha-2 (e.g. "GB", "US", "AE", "PK")
  name: string; // Official display name
  flag: string; // Unicode flag emoji
  aliases?: string[]; // Alternate search terms & city/region aliases
  isPopular?: boolean;
}

// 34 Official Popular Destinations (strictly excluding India)
export const POPULAR_COUNTRY_CODES: string[] = [
  "PK", // Pakistan
  "GB", // United Kingdom
  "US", // United States
  "AE", // United Arab Emirates
  "AU", // Australia
  "CA", // Canada
  "NZ", // New Zealand
  "DE", // Germany
  "FR", // France
  "IT", // Italy
  "IE", // Ireland
  "CH", // Switzerland
  "ZA", // South Africa
  "LK", // Sri Lanka
  "BD", // Bangladesh
  "SA", // Saudi Arabia
  "QA", // Qatar
  "OM", // Oman
  "KW", // Kuwait
  "BH", // Bahrain
  "MY", // Malaysia
  "SG", // Singapore
  "VN", // Vietnam
  "ID", // Indonesia
  "JP", // Japan
  "CN", // China
  "HK", // Hong Kong
  "NL", // Netherlands
  "BE", // Belgium
  "ES", // Spain
  "PT", // Portugal
  "NO", // Norway
  "SE", // Sweden
  "DK", // Denmark
];

// Complete ISO 3166-1 dataset (excluding India / IN)
const RAW_COUNTRIES: CountryInfo[] = [
  // Popular Destinations (Flagged)
  {
    code: "PK",
    name: "Pakistan",
    flag: "🇵🇰",
    aliases: ["PK", "PAK", "Islamabad", "Lahore", "Karachi", "Sialkot", "Rawalpindi", "Peshawar", "Quetta"],
    isPopular: true,
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    aliases: ["UK", "Great Britain", "Britain", "England", "Scotland", "Wales", "Northern Ireland", "London", "Birmingham", "Manchester", "Leeds", "Glasgow"],
    isPopular: true,
  },
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    aliases: ["USA", "US", "America", "United States of America", "New York", "California", "Texas", "Florida"],
    isPopular: true,
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    aliases: ["UAE", "Emirates", "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"],
    isPopular: true,
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    aliases: ["AUS", "Aussie", "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
    isPopular: true,
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    aliases: ["CAN", "Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
    isPopular: true,
  },
  {
    code: "NZ",
    name: "New Zealand",
    flag: "🇳🇿",
    aliases: ["NZ", "Aotearoa", "Auckland", "Wellington", "Christchurch"],
    isPopular: true,
  },
  {
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    aliases: ["Deutschland", "Berlin", "Munich", "Frankfurt", "Hamburg"],
    isPopular: true,
  },
  {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    aliases: ["French Republic", "Paris", "Lyon", "Marseille"],
    isPopular: true,
  },
  {
    code: "IT",
    name: "Italy",
    flag: "🇮🇹",
    aliases: ["Italia", "Rome", "Milan", "Naples", "Turin"],
    isPopular: true,
  },
  {
    code: "IE",
    name: "Ireland",
    flag: "🇮🇪",
    aliases: ["Republic of Ireland", "Eire", "Dublin", "Cork", "Galway"],
    isPopular: true,
  },
  {
    code: "CH",
    name: "Switzerland",
    flag: "🇨🇭",
    aliases: ["Swiss", "Helvetia", "Zurich", "Geneva", "Bern", "Basel"],
    isPopular: true,
  },
  {
    code: "ZA",
    name: "South Africa",
    flag: "🇿🇦",
    aliases: ["RSA", "Johannesburg", "Cape Town", "Durban", "Pretoria"],
    isPopular: true,
  },
  {
    code: "LK",
    name: "Sri Lanka",
    flag: "🇱🇰",
    aliases: ["Ceylon", "Colombo", "Kandy", "Galle"],
    isPopular: true,
  },
  {
    code: "BD",
    name: "Bangladesh",
    flag: "🇧🇩",
    aliases: ["Dhaka", "Chittagong", "Sylhet"],
    isPopular: true,
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    aliases: ["KSA", "Kingdom of Saudi Arabia", "Riyadh", "Jeddah", "Dammam", "Mecca", "Medina"],
    isPopular: true,
  },
  {
    code: "QA",
    name: "Qatar",
    flag: "🇶🇦",
    aliases: ["Doha", "Al Rayyan"],
    isPopular: true,
  },
  {
    code: "OM",
    name: "Oman",
    flag: "🇴🇲",
    aliases: ["Sultanate of Oman", "Muscat", "Salalah"],
    isPopular: true,
  },
  {
    code: "KW",
    name: "Kuwait",
    flag: "🇰🇼",
    aliases: ["Kuwait City"],
    isPopular: true,
  },
  {
    code: "BH",
    name: "Bahrain",
    flag: "🇧🇭",
    aliases: ["Manama"],
    isPopular: true,
  },
  {
    code: "MY",
    name: "Malaysia",
    flag: "🇲🇾",
    aliases: ["Kuala Lumpur", "Penang", "Johor Bahru"],
    isPopular: true,
  },
  {
    code: "SG",
    name: "Singapore",
    flag: "🇸🇬",
    aliases: ["Lion City"],
    isPopular: true,
  },
  {
    code: "VN",
    name: "Vietnam",
    flag: "🇻🇳",
    aliases: ["Viet Nam", "Hanoi", "Ho Chi Minh City", "Saigon"],
    isPopular: true,
  },
  {
    code: "ID",
    name: "Indonesia",
    flag: "🇮🇩",
    aliases: ["Jakarta", "Bali", "Surabaya"],
    isPopular: true,
  },
  {
    code: "JP",
    name: "Japan",
    flag: "🇯🇵",
    aliases: ["Nippon", "Nihon", "Tokyo", "Osaka", "Kyoto"],
    isPopular: true,
  },
  {
    code: "CN",
    name: "China",
    flag: "🇨🇳",
    aliases: ["PRC", "People's Republic of China", "Beijing", "Shanghai", "Guangzhou", "Shenzhen"],
    isPopular: true,
  },
  {
    code: "HK",
    name: "Hong Kong",
    flag: "🇭🇰",
    aliases: ["HK", "Hong Kong SAR", "Kowloon"],
    isPopular: true,
  },
  {
    code: "NL",
    name: "Netherlands",
    flag: "🇳🇱",
    aliases: ["Holland", "Amsterdam", "Rotterdam", "The Hague", "Utrecht"],
    isPopular: true,
  },
  {
    code: "BE",
    name: "Belgium",
    flag: "🇧🇪",
    aliases: ["Belgique", "Belgie", "Brussels", "Antwerp", "Ghent"],
    isPopular: true,
  },
  {
    code: "ES",
    name: "Spain",
    flag: "🇪🇸",
    aliases: ["Espana", "Madrid", "Barcelona", "Valencia", "Seville"],
    isPopular: true,
  },
  {
    code: "PT",
    name: "Portugal",
    flag: "🇵🇹",
    aliases: ["Lisbon", "Porto"],
    isPopular: true,
  },
  {
    code: "NO",
    name: "Norway",
    flag: "🇳🇴",
    aliases: ["Norge", "Oslo", "Bergen"],
    isPopular: true,
  },
  {
    code: "SE",
    name: "Sweden",
    flag: "🇸🇪",
    aliases: ["Sverige", "Stockholm", "Gothenburg", "Malmo"],
    isPopular: true,
  },
  {
    code: "DK",
    name: "Denmark",
    flag: "🇩🇰",
    aliases: ["Danmark", "Copenhagen", "Aarhus"],
    isPopular: true,
  },

  // Additional International Destinations & Territories (Alphabetical)
  { code: "AF", name: "Afghanistan", flag: "🇦🇫", aliases: ["Kabul"] },
  { code: "AL", name: "Albania", flag: "🇦🇱", aliases: ["Tirana"] },
  { code: "DZ", name: "Algeria", flag: "🇩🇿", aliases: ["Algiers"] },
  { code: "AD", name: "Andorra", flag: "🇦🇩" },
  { code: "AO", name: "Angola", flag: "🇦🇴", aliases: ["Luanda"] },
  { code: "AG", name: "Antigua and Barbuda", flag: "🇦🇬", aliases: ["Antigua", "Barbuda", "West Indies"] },
  { code: "AR", name: "Argentina", flag: "🇦🇷", aliases: ["Buenos Aires"] },
  { code: "AM", name: "Armenia", flag: "🇦🇲", aliases: ["Yerevan"] },
  { code: "AT", name: "Austria", flag: "🇦🇹", aliases: ["Osterreich", "Vienna", "Salzburg"] },
  { code: "AZ", name: "Azerbaijan", flag: "🇦🇿", aliases: ["Baku"] },
  { code: "BS", name: "Bahamas", flag: "🇧🇸", aliases: ["Nassau"] },
  { code: "BB", name: "Barbados", flag: "🇧🇧", aliases: ["Bridgetown", "West Indies"] },
  { code: "BY", name: "Belarus", flag: "🇧🇾", aliases: ["Minsk"] },
  { code: "BZ", name: "Belize", flag: "🇧🇿" },
  { code: "BJ", name: "Benin", flag: "🇧🇯" },
  { code: "BM", name: "Bermuda", flag: "🇧🇲", aliases: ["Hamilton"] },
  { code: "BT", name: "Bhutan", flag: "🇧🇹", aliases: ["Thimphu"] },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", aliases: ["La Paz"] },
  { code: "BA", name: "Bosnia and Herzegovina", flag: "🇧🇦", aliases: ["Bosnia", "Sarajevo"] },
  { code: "BW", name: "Botswana", flag: "🇧🇼", aliases: ["Gaborone"] },
  { code: "BR", name: "Brazil", flag: "🇧🇷", aliases: ["Brasil", "Sao Paulo", "Rio de Janeiro", "Brasilia"] },
  { code: "BN", name: "Brunei", flag: "🇧🇳", aliases: ["Bandar Seri Begawan"] },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬", aliases: ["Sofia"] },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "BI", name: "Burundi", flag: "🇧🇮" },
  { code: "KH", name: "Cambodia", flag: "🇰🇭", aliases: ["Phnom Penh"] },
  { code: "CM", name: "Cameroon", flag: "🇨🇲", aliases: ["Yaounde"] },
  { code: "CV", name: "Cape Verde", flag: "🇨🇻", aliases: ["Cabo Verde"] },
  { code: "KY", name: "Cayman Islands", flag: "🇰🇾", aliases: ["George Town"] },
  { code: "CL", name: "Chile", flag: "🇨🇱", aliases: ["Santiago"] },
  { code: "CO", name: "Colombia", flag: "🇨🇴", aliases: ["Bogota"] },
  { code: "KM", name: "Comoros", flag: "🇰🇲" },
  { code: "CG", name: "Congo", flag: "🇨🇬", aliases: ["Brazzaville"] },
  { code: "CD", name: "Congo (DRC)", flag: "🇨🇩", aliases: ["Kinshasa", "Zaire"] },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", aliases: ["San Jose"] },
  { code: "HR", name: "Croatia", flag: "🇭🇷", aliases: ["Hrvatska", "Zagreb"] },
  { code: "CU", name: "Cuba", flag: "🇨🇺", aliases: ["Havana"] },
  { code: "CY", name: "Cyprus", flag: "🇨🇾", aliases: ["Nicosia"] },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿", aliases: ["Czechia", "Prague"] },
  { code: "DJ", name: "Djibouti", flag: "🇩🇯" },
  { code: "DM", name: "Dominica", flag: "🇩🇲", aliases: ["Roseau", "West Indies"] },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴", aliases: ["Santo Domingo"] },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", aliases: ["Quito"] },
  { code: "EG", name: "Egypt", flag: "🇪🇬", aliases: ["Cairo", "Alexandria"] },
  { code: "SV", name: "El Salvador", flag: "🇸🇻", aliases: ["San Salvador"] },
  { code: "EE", name: "Estonia", flag: "🇪🇪", aliases: ["Tallinn"] },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹", aliases: ["Addis Ababa"] },
  { code: "FJ", name: "Fiji", flag: "🇫🇯", aliases: ["Suva"] },
  { code: "FI", name: "Finland", flag: "🇫🇮", aliases: ["Suomi", "Helsinki"] },
  { code: "GA", name: "Gabon", flag: "🇬🇦", aliases: ["Libreville"] },
  { code: "GM", name: "Gambia", flag: "🇬🇲", aliases: ["Banjul"] },
  { code: "GE", name: "Georgia", flag: "🇬🇪", aliases: ["Tbilisi"] },
  { code: "GH", name: "Ghana", flag: "🇬🇭", aliases: ["Accra"] },
  { code: "GI", name: "Gibraltar", flag: "🇬🇮" },
  { code: "GR", name: "Greece", flag: "🇬🇷", aliases: ["Hellas", "Athens"] },
  { code: "GD", name: "Grenada", flag: "🇬🇩", aliases: ["St George's", "West Indies"] },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", aliases: ["Guatemala City"] },
  { code: "GN", name: "Guinea", flag: "🇬🇳", aliases: ["Conakry"] },
  { code: "GY", name: "Guyana", flag: "🇬🇾", aliases: ["Georgetown", "West Indies"] },
  { code: "HT", name: "Haiti", flag: "🇭🇹", aliases: ["Port-au-Prince"] },
  { code: "HN", name: "Honduras", flag: "🇭🇳", aliases: ["Tegucigalpa"] },
  { code: "HU", name: "Hungary", flag: "🇭🇺", aliases: ["Magyarorszag", "Budapest"] },
  { code: "IS", name: "Iceland", flag: "🇮🇸", aliases: ["Reykjavik"] },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", aliases: ["Baghdad", "Erbil", "Basra"] },
  { code: "IL", name: "Israel", flag: "🇮🇱", aliases: ["Tel Aviv", "Jerusalem"] },
  { code: "JM", name: "Jamaica", flag: "🇯🇲", aliases: ["Kingston", "West Indies"] },
  { code: "JO", name: "Jordan", flag: "🇯🇴", aliases: ["Amman"] },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿", aliases: ["Astana", "Almaty"] },
  { code: "KE", name: "Kenya", flag: "🇰🇪", aliases: ["Nairobi", "Mombasa"] },
  { code: "KG", name: "Kyrgyzstan", flag: "🇰🇬", aliases: ["Bishkek"] },
  { code: "LA", name: "Laos", flag: "🇱🇦", aliases: ["Vientiane"] },
  { code: "LV", name: "Latvia", flag: "🇱🇻", aliases: ["Riga"] },
  { code: "LB", name: "Lebanon", flag: "🇱🇧", aliases: ["Beirut"] },
  { code: "LS", name: "Lesotho", flag: "🇱🇸", aliases: ["Maseru"] },
  { code: "LR", name: "Liberia", flag: "🇱🇷", aliases: ["Monrovia"] },
  { code: "LY", name: "Libya", flag: "🇱🇾", aliases: ["Tripoli", "Benghazi"] },
  { code: "LI", name: "Liechtenstein", flag: "🇱🇮", aliases: ["Vaduz"] },
  { code: "LT", name: "Lithuania", flag: "🇱🇹", aliases: ["Vilnius"] },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺", aliases: ["Luxembourg City"] },
  { code: "MO", name: "Macau", flag: "🇲🇴", aliases: ["Macao"] },
  { code: "MG", name: "Madagascar", flag: "🇲🇬", aliases: ["Antananarivo"] },
  { code: "MW", name: "Malawi", flag: "🇲🇼", aliases: ["Lilongwe"] },
  { code: "MV", name: "Maldives", flag: "🇲🇻", aliases: ["Male"] },
  { code: "ML", name: "Mali", flag: "🇲🇱", aliases: ["Bamako"] },
  { code: "MT", name: "Malta", flag: "🇲🇹", aliases: ["Valletta"] },
  { code: "MU", name: "Mauritius", flag: "🇲🇺", aliases: ["Port Louis"] },
  { code: "MX", name: "Mexico", flag: "🇲🇽", aliases: ["Mexico City", "Guadalajara", "Monterrey"] },
  { code: "MD", name: "Moldova", flag: "🇲🇩", aliases: ["Chisinau"] },
  { code: "MC", name: "Monaco", flag: "🇲🇨", aliases: ["Monte Carlo"] },
  { code: "MN", name: "Mongolia", flag: "🇲🇳", aliases: ["Ulaanbaatar"] },
  { code: "ME", name: "Montenegro", flag: "🇲🇪", aliases: ["Podgorica"] },
  { code: "MA", name: "Morocco", flag: "🇲🇦", aliases: ["Casablanca", "Rabat", "Marrakech"] },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿", aliases: ["Maputo"] },
  { code: "MM", name: "Myanmar", flag: "🇲🇲", aliases: ["Burma", "Yangon"] },
  { code: "NA", name: "Namibia", flag: "🇳🇦", aliases: ["Windhoek"] },
  { code: "NP", name: "Nepal", flag: "🇳🇵", aliases: ["Kathmandu"] },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮", aliases: ["Managua"] },
  { code: "NE", name: "Niger", flag: "🇳🇪", aliases: ["Niamey"] },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", aliases: ["Lagos", "Abuja"] },
  { code: "MK", name: "North Macedonia", flag: "🇲🇰", aliases: ["Macedonia", "Skopje"] },
  { code: "PA", name: "Panama", flag: "🇵🇦", aliases: ["Panama City"] },
  { code: "PG", name: "Papua New Guinea", flag: "🇵🇬", aliases: ["PNG", "Port Moresby"] },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", aliases: ["Asuncion"] },
  { code: "PE", name: "Peru", flag: "🇵🇪", aliases: ["Lima"] },
  { code: "PH", name: "Philippines", flag: "🇵🇭", aliases: ["Manila", "Cebu"] },
  { code: "PL", name: "Poland", flag: "🇵🇱", aliases: ["Polska", "Warsaw", "Krakow"] },
  { code: "RO", name: "Romania", flag: "🇷🇴", aliases: ["Bucharest"] },
  { code: "RU", name: "Russia", flag: "🇷🇺", aliases: ["Moscow", "Saint Petersburg"] },
  { code: "RW", name: "Rwanda", flag: "🇷🇼", aliases: ["Kigali"] },
  { code: "KN", name: "Saint Kitts and Nevis", flag: "🇰🇳", aliases: ["St Kitts", "Nevis", "West Indies"] },
  { code: "LC", name: "Saint Lucia", flag: "🇱🇨", aliases: ["St Lucia", "Castries", "West Indies"] },
  { code: "VC", name: "Saint Vincent and the Grenadines", flag: "🇻🇨", aliases: ["St Vincent", "West Indies"] },
  { code: "WS", name: "Samoa", flag: "🇼🇸", aliases: ["Apia"] },
  { code: "SM", name: "San Marino", flag: "🇸🇲" },
  { code: "SN", name: "Senegal", flag: "🇸🇳", aliases: ["Dakar"] },
  { code: "RS", name: "Serbia", flag: "🇷🇸", aliases: ["Belgrade"] },
  { code: "SC", name: "Seychelles", flag: "🇸🇨", aliases: ["Victoria"] },
  { code: "SL", name: "Sierra Leone", flag: "🇸🇱", aliases: ["Freetown"] },
  { code: "SK", name: "Slovakia", flag: "🇸🇰", aliases: ["Bratislava"] },
  { code: "SI", name: "Slovenia", flag: "🇸🇮", aliases: ["Ljubljana"] },
  { code: "SO", name: "Somalia", flag: "🇸🇴", aliases: ["Mogadishu"] },
  { code: "KR", name: "South Korea", flag: "🇰🇷", aliases: ["Korea", "Seoul", "Busan"] },
  { code: "SR", name: "Suriname", flag: "🇸🇷", aliases: ["Paramaribo"] },
  { code: "TW", name: "Taiwan", flag: "🇹🇼", aliases: ["Taipei"] },
  { code: "TJ", name: "Tajikistan", flag: "🇹🇯", aliases: ["Dushanbe"] },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", aliases: ["Dar es Salaam", "Zanzibar"] },
  { code: "TH", name: "Thailand", flag: "🇹🇭", aliases: ["Bangkok", "Phuket"] },
  { code: "TT", name: "Trinidad and Tobago", flag: "🇹🇹", aliases: ["Trinidad", "Tobago", "Port of Spain", "West Indies"] },
  { code: "TN", name: "Tunisia", flag: "🇹🇳", aliases: ["Tunis"] },
  { code: "TR", name: "Turkey", flag: "🇹🇷", aliases: ["Turkiye", "Istanbul", "Ankara"] },
  { code: "TM", name: "Turkmenistan", flag: "🇹🇲", aliases: ["Ashgabat"] },
  { code: "UG", name: "Uganda", flag: "🇺🇬", aliases: ["Kampala"] },
  { code: "UA", name: "Ukraine", flag: "🇺🇦", aliases: ["Kyiv", "Odesa"] },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", aliases: ["Montevideo"] },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿", aliases: ["Tashkent"] },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", aliases: ["Caracas"] },
  { code: "YE", name: "Yemen", flag: "🇾🇪", aliases: ["Sanaa", "Aden"] },
  { code: "ZM", name: "Zambia", flag: "🇿🇲", aliases: ["Lusaka"] },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼", aliases: ["Harare", "Bulawayo"] },
];

// Strictly enforce India exclusion across data arrays
export const ALL_COUNTRIES: CountryInfo[] = RAW_COUNTRIES.filter(
  (c) => c.code.toUpperCase() !== "IN" && !c.name.toLowerCase().includes("india")
);

// Map of popular destinations in the designated sequence
export const POPULAR_DESTINATIONS: CountryInfo[] = POPULAR_COUNTRY_CODES
  .map((code) => ALL_COUNTRIES.find((c) => c.code === code))
  .filter((c): c is CountryInfo => Boolean(c));

// Remaining countries (all countries excluding popular, sorted alphabetically)
export const REMAINING_COUNTRIES: CountryInfo[] = ALL_COUNTRIES
  .filter((c) => !POPULAR_COUNTRY_CODES.includes(c.code))
  .sort((a, b) => a.name.localeCompare(b.name));

// Fast lookup maps
const CODE_MAP = new Map<string, CountryInfo>();
const NAME_MAP = new Map<string, CountryInfo>();

ALL_COUNTRIES.forEach((c) => {
  CODE_MAP.set(c.code.toUpperCase(), c);
  NAME_MAP.set(c.name.toLowerCase(), c);
  if (c.aliases) {
    c.aliases.forEach((alias) => {
      NAME_MAP.set(alias.toLowerCase(), c);
    });
  }
});

/**
 * Lookup Country by ISO Code (e.g. "GB" -> United Kingdom)
 */
export function getCountryByCode(code: string | null | undefined): CountryInfo | null {
  if (!code) return null;
  const clean = code.trim().toUpperCase();
  if (clean === "IN") return null; // Explicit rejection
  return CODE_MAP.get(clean) || null;
}

/**
 * Lookup Country by Name or Alias (e.g. "Dubai" -> UAE, "England" -> UK)
 */
export function getCountryByName(name: string | null | undefined): CountryInfo | null {
  if (!name) return null;
  const clean = name.trim().toLowerCase();
  if (clean === "india" || clean === "bharat" || clean === "hindustan" || clean === "in") return null;
  return NAME_MAP.get(clean) || null;
}

/**
 * Normalizes any country input (name, alias, or code) to canonical CountryInfo
 */
export function resolveCountry(input: string | null | undefined): CountryInfo | null {
  if (!input) return null;
  const clean = input.trim();
  if (!clean) return null;

  // Check code first if 2 chars
  if (clean.length === 2) {
    const byCode = getCountryByCode(clean);
    if (byCode) return byCode;
  }

  // Check by name or alias
  const byName = getCountryByName(clean);
  if (byName) return byName;

  // Direct case-insensitive match against ALL_COUNTRIES
  const lower = clean.toLowerCase();
  const direct = ALL_COUNTRIES.find(
    (c) =>
      c.name.toLowerCase() === lower ||
      c.code.toLowerCase() === lower ||
      c.aliases?.some((a) => a.toLowerCase() === lower)
  );
  return direct || null;
}

/**
 * Filter countries by search query with alias matching and India exclusion
 */
export function searchCountries(query: string): CountryInfo[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return ALL_COUNTRIES;

  // Exclude search terms that target India
  if (clean === "india" || clean === "in" || clean === "bharat" || clean === "hindustan") {
    return [];
  }

  return ALL_COUNTRIES.filter((c) => {
    // 1. Direct name match
    if (c.name.toLowerCase().includes(clean)) return true;
    // 2. ISO code match
    if (c.code.toLowerCase() === clean) return true;
    // 3. Alias match (e.g. "Dubai", "England", "USA")
    if (c.aliases?.some((a) => a.toLowerCase().includes(clean))) return true;
    return false;
  });
}

/**
 * Validates whether a country code or name is accepted for delivery
 */
export function isCountrySupported(codeOrName: string | null | undefined): {
  valid: boolean;
  country: CountryInfo | null;
  error?: string;
} {
  if (!codeOrName || !codeOrName.trim()) {
    return {
      valid: false,
      country: null,
      error: "Please select your destination country.",
    };
  }

  const clean = codeOrName.trim();
  const upper = clean.toUpperCase();

  // Strict India rejection with polite notice
  if (upper === "IN" || clean.toLowerCase() === "india" || clean.toLowerCase() === "bharat" || clean.toLowerCase() === "hindustan") {
    return {
      valid: false,
      country: null,
      error: "Delivery to the selected destination is currently unavailable.",
    };
  }

  const resolved = resolveCountry(clean);
  if (!resolved) {
    return {
      valid: false,
      country: null,
      error: "Unrecognized destination country. Please select a valid country from the list.",
    };
  }

  return {
    valid: true,
    country: resolved,
  };
}
