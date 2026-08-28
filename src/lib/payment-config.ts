/**
 * Sialkot Cricket Kits - Centralized Payment & Bank Configuration
 * 
 * Single source of truth for bank transfer details, beneficiary identity,
 * factory information, and payment processing rules.
 * 
 * CRITICAL RULE:
 * Bank details must NOT be hardcoded in ad-hoc components or modified arbitrarily.
 */

export const UBL_PAYMENT_CONFIG = {
  bankName: "United Bank Limited (UBL)",
  beneficiaryFirstName: "ALYAN",
  beneficiaryLastName: "WAZIR",
  beneficiaryFullName: "ALYAN WAZIR",
  mobileNumber: "+92 327 5756188",
  accountNumber: "0881304929964",
  iban: "PK93UNIL0109000304929964",
  branchName: "0881 – Wana",
  swiftBic: "UNILPKKA",
  paymentEmail: "sialkotcricketkits@gmail.com",

  // Explicit brand & beneficiary disclosure notice
  beneficiaryNotice:
    "Payments for Sialkot Cricket Kits are received into the UBL account titled ALYAN WAZIR. Please enter the beneficiary name exactly as shown when making the transfer.",

  // Security warning notice
  securityWarning:
    "Always verify that the beneficiary name is ALYAN WAZIR before confirming the transfer. Sialkot Cricket Kits will never ask for your card PIN, CVV, OTP or online-banking password.",

  // Admin verification statement required before enabling production
  adminVerificationStatement:
    "I have verified these payment details against the UBL app, official bank statement or UBL Account Maintenance Certificate.",
};

export const FACTORY_INFO = {
  factoryName: "Superior Cricket Factory",
  house: "No. 207",
  street: "Gulshan Street",
  town: "Model Town",
  city: "Sialkot",
  country: "Pakistan",
  fullAddress: "Superior Cricket Factory, House No. 207, Gulshan Street, Model Town, Sialkot, Pakistan",
  primaryWhatsApp: "+92 323 1438214", // Primary business WhatsApp enquiry line
  primaryEmail: "sialkotcricketkits@gmail.com",
};

export interface TransferChannel {
  id: string;
  name: string;
  category: "remittance" | "bank" | "local";
  popularIn: string;
  description: string;
}

export const TRANSFER_CHANNELS: TransferChannel[] = [
  {
    id: "taptap",
    name: "Taptap Send",
    category: "remittance",
    popularIn: "UK, Europe, USA, Canada",
    description: "Fast mobile remittance app with direct Pakistani bank deposits",
  },
  {
    id: "remitly",
    name: "Remitly",
    category: "remittance",
    popularIn: "UK, USA, Australia, Europe, Canada",
    description: "Express bank deposit directly to UBL account",
  },
  {
    id: "wise",
    name: "Wise",
    category: "remittance",
    popularIn: "Worldwide Bank Wire",
    description: "Low-fee multi-currency bank wire in GBP, USD, EUR, AUD, CAD",
  },
  {
    id: "moneygram",
    name: "MoneyGram",
    category: "remittance",
    popularIn: "Worldwide",
    description: "Direct bank deposit or agency cash transfer",
  },
  {
    id: "westernunion",
    name: "Western Union",
    category: "remittance",
    popularIn: "Worldwide",
    description: "Global bank account deposit to UBL Pakistan",
  },
  {
    id: "worldremit",
    name: "WorldRemit",
    category: "remittance",
    popularIn: "Worldwide",
    description: "Direct account transfer to Pakistani banks",
  },
  {
    id: "exchange",
    name: "International Money Transfer through an exchange",
    category: "remittance",
    popularIn: "UAE, Saudi Arabia, Qatar, Oman, Kuwait, Bahrain",
    description: "Al Ansari, Al Fardan, LuLu, UAE Exchange, Western Union branches",
  },
  {
    id: "intl_bank",
    name: "International Money Transfer through a bank (SWIFT Wire)",
    category: "bank",
    popularIn: "All Global Banks",
    description: "Direct international SWIFT transfer using IBAN & UNILPKKA BIC",
  },
  {
    id: "ubl_direct",
    name: "Direct UBL bank transfer",
    category: "local",
    popularIn: "Pakistan (UBL Digital App / ATM / Branch)",
    description: "Instant UBL to UBL account transfer with zero fee",
  },
  {
    id: "local_bank",
    name: "Pakistani local bank transfer (IBFT / Raast / 1Link)",
    category: "local",
    popularIn: "Pakistan (HBL, Meezan, Alfalah, Standard Chartered, etc.)",
    description: "Inter-bank funds transfer (IBFT) or Raast transfer",
  },
];

export const TRANSFER_CHANNELS_NOTICE =
  "Service availability, charges, exchange rates and transfer times depend on your country and selected provider. Please choose bank-account deposit where available and use the exact beneficiary details shown below.";

/**
 * FUTURE UBL CARD GATEWAY PREPARATION:
 * Feature flag for future UBL Internet Payment Gateway (IPG).
 * Disabled until official production merchant credentials are confirmed.
 */
export const UBL_CARD_GATEWAY_ENABLED = false;

export const MAX_RECEIPT_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB
export const ALLOWED_RECEIPT_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const ALLOWED_RECEIPT_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

export const PAYMENT_SECURITY_WARNING = UBL_PAYMENT_CONFIG.securityWarning;
