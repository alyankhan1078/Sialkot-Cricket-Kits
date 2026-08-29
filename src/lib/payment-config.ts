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
  mobileNumber: "+92 323 1438214",
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

export interface PaymentMethodOption {
  id: string;
  name: string;
  category: "international" | "remittance" | "exchange" | "bank" | "local";
  popularIn: string;
  badge?: string;
  description: string;
  referencePlaceholder: string;
}

/**
 * 10 Interactive Payment Methods for Checkout Single-Selection
 */
export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "wise",
    name: "Wise",
    category: "international",
    popularIn: "Worldwide",
    badge: "Low Fees · Bank Wire",
    description: "Low-fee multi-currency bank wire in GBP, USD, EUR, AUD, CAD directly to our UBL account",
    referencePlaceholder: "Wise transfer reference number / Wise account name",
  },
  {
    id: "taptap",
    name: "Taptap Send",
    category: "remittance",
    popularIn: "UK, Europe, USA, Canada",
    badge: "Fast Remittance",
    description: "Fast mobile remittance app with direct Pakistani bank deposits",
    referencePlaceholder: "Taptap Send transaction reference ID",
  },
  {
    id: "remitly",
    name: "Remitly",
    category: "remittance",
    popularIn: "UK, USA, Australia, Europe, Canada",
    badge: "Express Bank Deposit",
    description: "Express bank deposit directly to UBL account",
    referencePlaceholder: "Remitly reference / tracking number (e.g. 2012345678)",
  },
  {
    id: "moneygram",
    name: "MoneyGram",
    category: "remittance",
    popularIn: "Worldwide",
    badge: "Global Remittance",
    description: "Direct bank deposit or agency cash transfer",
    referencePlaceholder: "8-digit MoneyGram reference number",
  },
  {
    id: "westernunion",
    name: "Western Union",
    category: "remittance",
    popularIn: "Worldwide",
    badge: "Global Remittance",
    description: "Global bank account deposit to UBL Pakistan",
    referencePlaceholder: "10-digit MTCN (Money Transfer Control Number)",
  },
  {
    id: "worldremit",
    name: "WorldRemit",
    category: "remittance",
    popularIn: "Worldwide",
    badge: "Global Transfer",
    description: "Direct account transfer to Pakistani banks",
    referencePlaceholder: "WorldRemit transaction number",
  },
  {
    id: "exchange",
    name: "International Money Transfer through an Exchange",
    category: "exchange",
    popularIn: "UAE, Saudi Arabia, Qatar, Oman, Gulf",
    badge: "Exchange Counter",
    description: "Al Ansari, Al Fardan, LuLu, UAE Exchange, or local exchange house",
    referencePlaceholder: "Exchange receipt number / branch transaction ID",
  },
  {
    id: "swift_wire",
    name: "International Bank Transfer — SWIFT Wire",
    category: "bank",
    popularIn: "All Global Banks",
    badge: "Direct SWIFT Wire",
    description: "Direct international SWIFT transfer using IBAN & UNILPKKA BIC",
    referencePlaceholder: "Bank wire reference / UTR transaction code",
  },
  {
    id: "ubl_direct",
    name: "Direct UBL Bank Transfer",
    category: "local",
    popularIn: "Pakistan",
    badge: "Instant UBL to UBL",
    description: "Instant UBL to UBL digital account transfer with zero fee",
    referencePlaceholder: "UBL Digital transaction ID",
  },
  {
    id: "local_bank",
    name: "Pakistani Local Bank Transfer — IBFT / Raast / 1Link",
    category: "local",
    popularIn: "Pakistan (HBL, Meezan, Alfalah, etc.)",
    badge: "IBFT / Raast / 1Link",
    description: "Inter-bank funds transfer (IBFT) or Raast transfer from any Pakistani bank",
    referencePlaceholder: "Raast / IBFT transaction reference ID",
  },
];

// Backward compatibility alias for legacy references
export const TRANSFER_CHANNELS = PAYMENT_METHODS;

export const TRANSFER_CHANNELS_NOTICE =
  "Service availability, charges, exchange rates and transfer times depend on your country and selected provider. Please choose bank-account deposit where available and use the exact beneficiary details shown above.";

/**
 * FUTURE UBL CARD GATEWAY PREPARATION:
 * Feature flag for future UBL Internet Payment Gateway (IPG).
 * Disabled until official production merchant credentials are confirmed.
 */
export const UBL_CARD_GATEWAY_ENABLED = false;

export const MAX_RECEIPT_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB strictly as required
export const ALLOWED_RECEIPT_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const ALLOWED_RECEIPT_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

export const PAYMENT_SECURITY_WARNING = UBL_PAYMENT_CONFIG.securityWarning;
