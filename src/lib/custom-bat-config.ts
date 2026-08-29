/**
 * Centralized Custom Bat Order Configurator Specification & Pricing
 * Sialkot Cricket Kits - Official Factory Customization Engine
 */

export interface CustomBatTier {
  price: number;
  label: string;
  subtitle: string;
  description: string;
  badge?: string;
  isPopular?: boolean;
  isTopSpec?: boolean;
}

export interface CustomBatSizeOption {
  id: string;
  name: string;
  category: "adult" | "junior";
  description: string;
  catalogProductId?: string;
  fallbackPrice?: number;
  badge?: string;
}

export interface CustomBatProfile {
  id: string;
  name: string;
  tagline: string;
  description: string;
  sweetSpot: string;
  pickup: string;
  idealFor: string;
}

export interface CustomBatService {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number; // 0 for included/free services
  included: boolean;
}

export interface AdvancePaymentOption {
  percent: number;
  label: string;
  badge: string;
  description: string;
  isDefault?: boolean;
}

export const CUSTOM_BAT_CONFIG = {
  // ── SIZES & PLAYER CATEGORIES ──
  sizes: [
    {
      id: "adult-sh",
      name: "Adult / Short Handle",
      category: "adult",
      description: "Standard senior size (approx. 33.5\" / 85cm). Full adult cleft with choice of Beauty Processed or Bonafide willow.",
      badge: "Configure Pro Bat →",
    },
    {
      id: "adult-lh",
      name: "Adult / Long Handle",
      category: "adult",
      description: "Senior size with an extended +15mm handle for taller players (over 6'1\").",
      badge: "Configure Pro Bat →",
    },
    {
      id: "size-6",
      name: "Size 6 (Youth / Junior)",
      category: "junior",
      description: "Proportioned for players aged 11–13 years (approx. 5'2\"–5'4\").",
      catalogProductId: "junior-and-harrow-bats-size-6",
      fallbackPrice: 105,
    },
    {
      id: "size-5",
      name: "Size 5 (Junior)",
      category: "junior",
      description: "Proportioned for players aged 10–11 years (approx. 4'11\"–5'2\").",
      catalogProductId: "junior-and-harrow-bats-size-5",
      fallbackPrice: 85,
    },
    {
      id: "size-4",
      name: "Size 4 (Junior)",
      category: "junior",
      description: "Proportioned for young players aged 9–10 years (approx. 4'8\"–4'11\").",
      catalogProductId: "junior-and-harrow-bats-size-4",
      fallbackPrice: 70,
    },
    {
      id: "harrow",
      name: "Harrow Size (Intermediate Youth)",
      category: "junior",
      description: "Transition size bridging intermediate youth and senior cricket for teens aged 13–15.",
      catalogProductId: "junior-and-harrow-bats-harrow-size",
      fallbackPrice: 110,
    },
  ] as CustomBatSizeOption[],

  // ── ADULT: BEAUTY PROCESSED TIERS ──
  beautyProcessedTiers: [
    {
      price: 140,
      label: "Essential Custom",
      subtitle: "Select Grade Willow",
      description: "Clean straight grains, balanced lightweight pickup, pressed for reliable durability in club cricket.",
    },
    {
      price: 190,
      label: "Performance",
      subtitle: "Enhanced Cleft Selection",
      description: "Selected cleft with prominent spine, expanded hitting zone, and crisper driving rebound.",
    },
    {
      price: 220,
      label: "Advanced",
      subtitle: "Superior Willow Density",
      description: "High-grade seasoned willow with dense grain structure, responsive middle, and minimal vibration.",
    },
    {
      price: 230,
      label: "Premium",
      subtitle: "Hand-Graded Cleft",
      description: "Thick 38–40mm edges, extended swell down the blade, and supreme power-to-weight balance.",
    },
    {
      price: 250,
      label: "Top Beauty Processed",
      subtitle: "Mastercraft Selection",
      description: "The pinnacle of Beauty Processed craftsmanship with immaculate grain uniformity and maximum driving punch.",
      isPopular: true,
      badge: "POPULAR",
    },
  ] as CustomBatTier[],

  // ── ADULT: BONAFIDE TIERS ──
  bonafideTiers: [
    {
      price: 220,
      label: "Bonafide Entry",
      subtitle: "Natural English Willow",
      description: "Handcrafted unbleached English Willow with authentic natural grain aesthetics and solid middle density.",
    },
    {
      price: 250,
      label: "Performance",
      subtitle: "Select Grade Willow",
      description: "Selected natural cleft with fuller spine profile, responsive driving ping, and clean finish.",
    },
    {
      price: 300,
      label: "Professional",
      subtitle: "Tournament Grade A",
      description: "Hand-selected pro cleft with dense straight grains, supreme power-to-weight ratio, and explosive ping.",
      isPopular: true,
      badge: "MOST POPULAR",
    },
    {
      price: 400,
      label: "Elite",
      subtitle: "Player Spec Grade A+",
      description: "Exquisite cleft selection matching professional match bats, exceptional balance, and multi-piece cane handle.",
    },
    {
      price: 500,
      label: "Signature / Top Class",
      subtitle: "Master Reserve Private Selection",
      description: "The supreme summit of custom batmaking. Hand-selected rare cleft, immaculate ping, flawless pickup, and luxury hand finish.",
      isTopSpec: true,
      badge: "TOP SPEC",
    },
  ] as CustomBatTier[],

  // ── GENERAL BUDGET RECOMMENDATION TIERS ──
  budgetTiers: [
    {
      price: 150,
      label: "£150 Budget",
      subtitle: "Club Grade Custom",
      description: "We will select the finest available cleft within the £150 range tailored to your weight and profile.",
    },
    {
      price: 200,
      label: "£200 Budget",
      subtitle: "Match Play Custom",
      description: "Optimized balance and ping for league cricketers within a £200 budget.",
    },
    {
      price: 300,
      label: "£300 Budget",
      subtitle: "Competitive League Spec",
      description: "High-performance willow selection matching competitive league standards.",
      isPopular: true,
      badge: "RECOMMENDED",
    },
    {
      price: 400,
      label: "£400 Budget",
      subtitle: "Pro Tournament Spec",
      description: "Top-tier cleft crafted to custom professional dimensions.",
    },
    {
      price: 500,
      label: "£500 Budget",
      subtitle: "Ultimate Elite Reserve",
      description: "Unrestricted master bat-maker cleft selection and bespoke hand-contouring.",
      isTopSpec: true,
      badge: "TOP SPEC",
    },
  ] as CustomBatTier[],

  // ── ADVANCE PAYMENT OPTIONS ──
  advanceOptions: [
    {
      percent: 30,
      label: "30% Minimum Advance",
      badge: "MINIMUM REQUIRED",
      description: "Pay 30% advance now to begin custom manufacturing. The remaining 70% balance is payable before dispatch.",
      isDefault: true,
    },
    {
      percent: 50,
      label: "50% Half Advance",
      badge: "HALF ADVANCE",
      description: "Pay 50% advance now to begin custom manufacturing. The remaining 50% balance is payable before dispatch.",
    },
    {
      percent: 100,
      label: "100% Full Payment",
      badge: "PAY IN FULL",
      description: "Pay the full order amount upfront. No remaining balance due at dispatch.",
    },
  ] as AdvancePaymentOption[],

  // ── BAT PROFILES ──
  profiles: [
    {
      id: "Duckbill",
      name: "Duckbill Profile",
      tagline: "Featherlight pickup with thick power toe",
      description: "Pronounced toe swell with slight concave scooping near the shoulders. Concentrates power in the drive zone while maintaining an effortless featherlight pickup.",
      sweetSpot: "Mid-to-Low (ideal for front-foot driving)",
      pickup: "Featherlight (feels 1–2 oz lighter)",
      idealFor: "Front-foot strokeplayers & attacking top-order batters",
    },
    {
      id: "Mid",
      name: "Mid Middle Profile",
      tagline: "Classic all-round power & balance",
      description: "The universal choice for modern cricket. The sweet spot is positioned in the exact centre of the blade, offering equal performance off the front and back foot.",
      sweetSpot: "Centre of blade (versatile sweet spot)",
      pickup: "Balanced & natural",
      idealFor: "All-round strokeplayers across all pitch types",
    },
    {
      id: "High",
      name: "High Middle Profile",
      tagline: "Lightest pickup for fast & bouncy tracks",
      description: "Sweet spot concentrated higher up the blade (towards the handle). Produces the lightest possible pickup and supreme control against short-pitched bowling.",
      sweetSpot: "High (middle to upper blade)",
      pickup: "Extremely fast & agile",
      idealFor: "Back-foot players, pull/cut specialists & bouncy wickets",
    },
    {
      id: "Full",
      name: "Full Profile (No Concaving)",
      tagline: "Maximum wood behind the ball for massive power",
      description: "Zero concaving on the back of the blade. Retains the maximum possible willow volume for devastating boundary-hitting power through the entire blade.",
      sweetSpot: "Extended full-blade sweet spot",
      pickup: "Power-weighted & solid",
      idealFor: "Power hitters, boundary clearers & middle-order anchors",
    },
    {
      id: "Concave",
      name: "Concave Profile",
      tagline: "Thick 40mm power edges with light pickup",
      description: "Subtle scalloping/scooping along the spine allows monster 38–42mm edges while keeping the total weight within your desired grams specification.",
      sweetSpot: "Mid-to-Low sweet spot",
      pickup: "Very light relative to edge size",
      idealFor: "Batters demanding massive edges without heavy dead-weight",
    },
    {
      id: "Traditional",
      name: "Traditional English Profile",
      tagline: "Gentle bow with smooth spine taper",
      description: "Time-tested English blade geometry with a gentle bow, full rounded face, and smooth spine tapering into a rounded toe. Clean, timeless, and dependable.",
      sweetSpot: "Mid sweet spot with classical bow",
      pickup: "Classic & true",
      idealFor: "Classical test-match technique & pure timing",
    },
  ] as CustomBatProfile[],

  // ── HANDLE PREFERENCES ──
  handles: [
    { id: "Short Handle", name: "Short Handle (Standard Adult)", description: "Standard 12-piece Singapore cane handle." },
    { id: "Long Handle", name: "Long Handle (+15mm)", description: "Extended handle length for players over 6'1\"." },
    { id: "Oval Handle", name: "Semi-Oval Handle", description: "Superior directional control and bottom-hand stability." },
    { id: "Round Handle", name: "Round Handle", description: "Traditional round handle allowing natural top-hand wrist flow." },
    { id: "Please advise", name: "Bat-Maker Choice (Please Advise)", description: "Allow our master craftsmen to match the best handle to your blade weight." },
  ],

  // ── PREFERRED WEIGHT PRESETS ──
  weightPresets: [
    { g: 1140, lbs: "2.8 lbs", label: "1140 g (2.8 lbs) - Ultralight" },
    { g: 1160, lbs: "2.9 lbs", label: "1160 g (2.9 lbs) - Light" },
    { g: 1180, lbs: "2.9½ lbs", label: "1180 g (2.9½ lbs) - Standard Pro" },
    { g: 1200, lbs: "2.10 lbs", label: "1200 g (2.10 lbs) - Medium" },
    { g: 1220, lbs: "2.11 lbs", label: "1220 g (2.11 lbs) - Heavy Power" },
    { g: 1250, lbs: "2.12 lbs", label: "1250 g (2.12 lbs) - Maximum Punch" },
  ],

  // ── ADDITIONAL SERVICES ──
  services: [
    {
      id: "knocking-in",
      name: "Professional Knocking-In & Oiling",
      tagline: "Multi-stage machine & hand mallet preparation",
      description: "Multi-stage machine & hand mallet knocking-in with raw linseed oil application so your bat arrives match-ready.",
      price: 0,
      included: true,
    },
    {
      id: "name-engraving",
      name: "Custom Laser Name / Number Engraving",
      tagline: "Bespoke laser etching on edge or spine",
      description: "Personalized laser etching of your name, initials, or squad number on the bat edge or spine.",
      price: 0,
      included: true,
    },
    {
      id: "live-ping-video",
      name: "Pictures & Live Ping Demonstration Video",
      tagline: "High-resolution cleft pictures & ping video approval",
      description: "Receive high-resolution photographs of your exact willow cleft and a live ball-ping video before final dispatch.",
      price: 0,
      included: true,
    },
  ] as CustomBatService[],
};

/**
 * Calculates advance deposit and remaining balance.
 * Enforces minimum 30% advance rule.
 */
export function calculateAdvancePayment(price: number, percent: number): {
  advanceAmount: number;
  remainingBalance: number;
  percent: number;
} {
  const safePercent = [30, 50, 100].includes(percent) ? percent : 30;
  const advanceAmount =
    safePercent === 100
      ? Math.round(price * 100) / 100
      : Math.round(price * (safePercent / 100) * 100) / 100;
  const remainingBalance = Math.max(0, Math.round((price - advanceAmount) * 100) / 100);

  return {
    advanceAmount,
    remainingBalance,
    percent: safePercent,
  };
}

/**
 * Generates a clean, professional WhatsApp enquiry message for custom bat specifications.
 */
export function generateCustomBatWhatsAppMessage(config: {
  name?: string;
  country?: string;
  size: string;
  construction: string;
  priceLevel: number;
  priceLabel: string;
  handle: string;
  weight: string;
  profile: string;
  services: string[];
  notes?: string;
  advancePercent: number;
  advanceAmount: number;
  remainingBalance: number;
}): string {
  const lines = [
    "🏏 *Custom Bat Enquiry — Sialkot Cricket Kits*",
    "",
    `*Customer:* ${config.name?.trim() || "Not specified"}`,
    `*Destination Country:* ${config.country?.trim() || "Not specified"}`,
    "",
    "📋 *Configured Specifications:*",
    `• *Bat Size / Category:* ${config.size}`,
    `• *Construction:* ${config.construction}`,
    `• *Selected Tier:* £${config.priceLevel} (${config.priceLabel})`,
    `• *Handle Preference:* ${config.handle}`,
    `• *Preferred Weight:* ${config.weight || "Bat-maker advice"}`,
    `• *Blade Profile:* ${config.profile}`,
    "",
    `🛠️ *Additional Services:* ${
      config.services && config.services.length > 0
        ? config.services.join(", ")
        : "None selected"
    }`,
    "",
    "💳 *Payment Preference:*",
    `• *Total Bat Value:* £${config.priceLevel}`,
    `• *Selected Advance Deposit:* ${config.advancePercent}% (£${config.advanceAmount} due now)`,
    config.remainingBalance > 0
      ? `• *Remaining Balance at Dispatch:* £${config.remainingBalance}`
      : "• *Payment:* Full upfront payment (No balance remaining)",
    "",
    config.notes?.trim() ? `📝 *Special Requirements:* ${config.notes.trim()}` : "",
    "",
    "Please confirm recommended willow cleft pictures, ping video, and estimated delivery timeline. Thank you!",
  ].filter((line) => line !== null && line !== undefined);

  return lines.join("\n");
}
