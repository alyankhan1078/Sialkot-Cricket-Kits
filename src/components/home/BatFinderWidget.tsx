"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Flame,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { whatsappUrl } from "@/src/lib/whatsapp";

interface BatRecommendation {
  name: string;
  category: string;
  profile: string;
  weightRange: string;
  edges: string;
  price: string;
  image: string;
  description: string;
  shopUrl: string;
}

const RECOMMENDATIONS: Record<string, BatRecommendation> = {
  power: {
    name: "Monster Edition Grade 1+ Bat",
    category: "Beauty Processed Bats",
    profile: "Massive Full Profile · Extended Mid-Low Swell",
    weightRange: "2lb 9.5oz – 2lb 12oz",
    edges: "42mm – 45mm Monster Edges",
    price: "£195",
    image: "/assets/products/bats/monster-series/monster-front-b.webp",
    description: "Engineered for maximum boundary clearing and aggressive lofted drives on high-scoring wickets.",
    shopUrl: "/shop?category=Beauty%20Processed%20Bats",
  },
  classical: {
    name: "Apex Pro Grade 1+ English Willow",
    category: "Beauty Processed Bats",
    profile: "Traditional Curved Face · Sublime Mid Swell",
    weightRange: "2lb 7.5oz – 2lb 8.5oz",
    edges: "40mm – 42mm Balanced Edges",
    price: "£185",
    image: "/assets/products/bats/apex-edition/apex-pro-front-b.webp",
    description: "Supreme pickup and pinpoint balance for cover drives, cuts, and all-round strokeplay.",
    shopUrl: "/shop?category=Beauty%20Processed%20Bats",
  },
  finisher: {
    name: "VVIP Bonafide Players Edition",
    category: "Bonafide Bats",
    profile: "Duckbill Toe · Ultra-Concentrated Sweetspot",
    weightRange: "2lb 8oz – 2lb 9oz",
    edges: "41mm Power Edge",
    price: "£165",
    image: "/assets/products/vvip-bonafide-original-front-a.webp",
    description: "Accelerated hand speed through the ball for explosive 360-degree ramp, flick, and pull hitting.",
    shopUrl: "/shop?category=Bonafide%20Bats",
  },
  allrounder: {
    name: "Silver Special Edition Grade A",
    category: "Beauty Processed Bats",
    profile: "Universal Mid Profile · Smooth Feathered Shoulders",
    weightRange: "2lb 8oz – 2lb 9.5oz",
    edges: "40mm Edges",
    price: "£175",
    image: "/assets/products/bats/silver-edition/silver-beauty-processed-front-full-a.webp",
    description: "A dependable all-condition weapon with forgiving rebound across the entire blade.",
    shopUrl: "/shop?category=Beauty%20Processed%20Bats",
  },
};

export function BatFinderWidget() {
  const [style, setStyle] = useState<"power" | "classical" | "finisher" | "allrounder">("classical");
  const [pitch, setPitch] = useState<"hard" | "seaming" | "bouncy">("hard");
  const [weightPref, setWeightPref] = useState<"light" | "balanced" | "heavy">("balanced");

  // Determine recommendation key
  let recKey = "classical";
  if (style === "power" || weightPref === "heavy") {
    recKey = "power";
  } else if (style === "finisher") {
    recKey = "finisher";
  } else if (style === "allrounder") {
    recKey = "allrounder";
  } else {
    recKey = "classical";
  }

  const rec = RECOMMENDATIONS[recKey];

  return (
    <section className="bat-finder-section">
      <div className="bat-finder-container">
        {/* Header */}
        <div className="section-head-center">
          <span className="section-eyebrow">Smart Matchmaking Tool</span>
          <h2 className="section-heading">
            Find Your <span className="gold-text">Perfect Match Willow</span>
          </h2>
          <p className="section-subtext">
            Answer 3 quick questions about your batting position, pitch conditions, and pickup preference.
            Our algorithm matches you with the ideal Sialkot cleft.
          </p>
        </div>

        {/* Finder Interactive Card */}
        <div className="finder-box">
          {/* Left Form Selector */}
          <div className="finder-form">
            {/* Step 1: Playing Style */}
            <div className="finder-step">
              <div className="step-label">
                <span className="step-num">Step 1</span>
                <strong>Your Batting Role &amp; Style</strong>
              </div>
              <div className="option-pill-grid">
                <button
                  type="button"
                  onClick={() => setStyle("classical")}
                  className={`finder-pill ${style === "classical" ? "active" : ""}`}
                >
                  <Target size={16} />
                  <span>Top-Order Strokeplay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStyle("power")}
                  className={`finder-pill ${style === "power" ? "active" : ""}`}
                >
                  <Flame size={16} />
                  <span>Power Hitter / Boundary Seeker</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStyle("finisher")}
                  className={`finder-pill ${style === "finisher" ? "active" : ""}`}
                >
                  <Zap size={16} />
                  <span>T20 360° Innovator</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStyle("allrounder")}
                  className={`finder-pill ${style === "allrounder" ? "active" : ""}`}
                >
                  <Trophy size={16} />
                  <span>Balanced All-Rounder</span>
                </button>
              </div>
            </div>

            {/* Step 2: Typical Wickets */}
            <div className="finder-step">
              <div className="step-label">
                <span className="step-num">Step 2</span>
                <strong>Primary Pitch Conditions</strong>
              </div>
              <div className="option-pill-grid three-col">
                <button
                  type="button"
                  onClick={() => setPitch("hard")}
                  className={`finder-pill ${pitch === "hard" ? "active" : ""}`}
                >
                  <span>Hard / True Bounce</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPitch("seaming")}
                  className={`finder-pill ${pitch === "seaming" ? "active" : ""}`}
                >
                  <span>English Seaming Green</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPitch("bouncy")}
                  className={`finder-pill ${pitch === "bouncy" ? "active" : ""}`}
                >
                  <span>Fast Subcontinent / Turf</span>
                </button>
              </div>
            </div>

            {/* Step 3: Pick-up Weight */}
            <div className="finder-step">
              <div className="step-label">
                <span className="step-num">Step 3</span>
                <strong>Preferred Pick-up Weight</strong>
              </div>
              <div className="option-pill-grid three-col">
                <button
                  type="button"
                  onClick={() => setWeightPref("light")}
                  className={`finder-pill ${weightPref === "light" ? "active" : ""}`}
                >
                  <span>Light (2lb 7oz - 2lb 8oz)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWeightPref("balanced")}
                  className={`finder-pill ${weightPref === "balanced" ? "active" : ""}`}
                >
                  <span>Standard (2lb 8.5oz - 2lb 9.5oz)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWeightPref("heavy")}
                  className={`finder-pill ${weightPref === "heavy" ? "active" : ""}`}
                >
                  <span>Heavy Cannon (2lb 10oz+)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Recommendation Card */}
          <div className="finder-result">
            <div className="result-badge">
              <Sparkles size={14} /> Recommended Match Willow
            </div>

            <div className="result-img-box">
              <img src={rec.image} alt={rec.name} className="result-img" />
            </div>

            <div className="result-details">
              <span className="result-cat">{rec.category}</span>
              <h3 className="result-name">{rec.name}</h3>
              <p className="result-desc">{rec.description}</p>

              <div className="result-specs-grid">
                <div className="r-spec">
                  <span>Profile:</span>
                  <strong>{rec.profile}</strong>
                </div>
                <div className="r-spec">
                  <span>Edge Spec:</span>
                  <strong>{rec.edges}</strong>
                </div>
                <div className="r-spec">
                  <span>Ideal Weight:</span>
                  <strong>{rec.weightRange}</strong>
                </div>
                <div className="r-spec">
                  <span>Factory Price:</span>
                  <strong className="r-price">{rec.price}</strong>
                </div>
              </div>

              <div className="result-actions">
                <Link href={rec.shopUrl} className="result-btn-shop">
                  <span>View in Catalogue</span>
                  <ArrowRight size={16} />
                </Link>
                <a
                  href={whatsappUrl(
                    `Hello Sialkot Cricket Kits, the Bat Finder recommended the ${rec.name} (${rec.weightRange}, ${rec.edges}) for me. Please send me pictures and live ping videos of current stock.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="result-btn-whatsapp"
                >
                  <MessageCircle size={16} />
                  <span>Request Video Ping</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
