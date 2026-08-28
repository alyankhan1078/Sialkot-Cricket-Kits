/**
 * SIALKOT CRICKET KITS — OFFICIAL BUSINESS CONFIGURATION
 * Single source of truth for all business contact, address, and communication channels.
 */

export const BUSINESS_CONFIG = {
  businessName: "Sialkot Cricket Kits",
  brandName: "Sialkot Cricket Kits",
  factoryName: "Superior Cricket Factory",
  houseNumber: "House No. 207",
  street: "Gulshan Street",
  town: "Model Town",
  city: "Sialkot",
  country: "Pakistan",
  fullAddress: "House No. 207, Gulshan Street, Model Town, Sialkot, Pakistan",
  fullFactoryAddress: "Superior Cricket Factory, House No. 207, Gulshan Street, Model Town, Sialkot, Pakistan",

  // Phone / WhatsApp
  primaryPhone: "+92 323 1438214",
  displayPhone: "+92 323 1438214",
  whatsappRaw: "923231438214",
  telLink: "tel:+923231438214",
  whatsappLink: "https://wa.me/923231438214",

  // Email
  primaryEmail: "sialkotcricketkits@gmail.com",
  emailLink: "mailto:sialkotcricketkits@gmail.com",

  // Web & Social
  websiteUrl: "https://sialkotcricketkits.co.uk",
  instagramUrl: "https://www.instagram.com/sialkotcricketkits?igsi=aDBzenZrcnJjbXJi&utm_source=qr",
  facebookUrl: "https://www.facebook.com/share/1PTo3qxPAn/?mibextid=wwXIfr",
  tiktokUrl: "https://www.tiktok.com/@sialkotcricketkits",

  // Beneficiary Bank Account Information
  bankName: "United Bank Limited (UBL)",
  beneficiaryTitle: "ALYAN WAZIR",
  accountNumber: "0881304929964",
  iban: "PK93UNIL0109000304929964",
  branchName: "0881 – Wana",
  swiftBic: "UNILPKKA",
};

// Default profile information for Alyan Wazir (replaces any obsolete legacy test profile)
export const DEFAULT_ALIAN_PROFILE = {
  name: "ALYAN WAZIR",
  phone: "+92 327 5756188",
  email: "sialkotcricketkits@gmail.com",
  address: "House No. 207, Gulshan Street, Model Town",
  city: "Sialkot",
  state: "Punjab",
  postalCode: "51310",
  country: "Pakistan",
};

// List of obsolete/outdated values to sanitize from client storage or mock caches
export const OBSOLETE_LEGACY_PATTERNS = [
  "awami kuthab khana",
  "nazir market",
  "south waziristan",
  "south waziristan agency",
  "wana swltd",
  "29540",
  "03499585519",
  "+923499585519",
  "03449832129",
  "+923449832129",
  "923449832129",
  "0349 9585519",
  "+92 349 9585519",
  "+92 344 9832129",
  "aliyankhan10@gmail.com",
  "alyankhan1078@gmail.com",
  "+92 323 1438214",
  "923231438214",
];
