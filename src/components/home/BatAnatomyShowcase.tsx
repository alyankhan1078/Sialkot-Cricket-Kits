"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Cpu, Hammer, Layers, Sparkles, Zap } from "lucide-react";

interface AnatomyPoint {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  spec: string;
  icon: typeof Layers;
}

const ANATOMY_POINTS: AnatomyPoint[] = [
  {
    id: "handle",
    number: "01",
    title: "12-Piece Singapore Cane Handle",
    subtitle: "Vibration Elimination & Whip",
    description:
      "Hand-laminated Singapore cane with 3 layers of high-grade dampening rubber sheets. Absorbs 95% of jarring impact on 90mph bouncers while delivering effortless flex through the shot.",
    spec: "Triple Rubber Lamination · Semi-Oval Contour",
    icon: Layers,
  },
  {
    id: "edges",
    number: "02",
    title: "40mm - 44mm Monster Edges",
    subtitle: "Maximum Power on Off-Center Hits",
    description:
      "Engineered with thick, pronounced power shoulders and edges so mis-timed edges still carry comfortably over third man and deep point fielders for boundaries.",
    spec: "40mm - 44mm Range · Full Thickness Profile",
    icon: Zap,
  },
  {
    id: "swell",
    number: "03",
    title: "Mid-to-Low Explosive Swell",
    subtitle: "Subcontinent & Fast Pitch Driving Power",
    description:
      "The meat of the blade is positioned 180mm to 220mm from the toe, giving unmatched rebound velocity for punchy front-foot drives, straight lofted hits, and back-foot pulls.",
    spec: "65mm - 68mm Spine Depth · Extended Sweetspot",
    icon: Sparkles,
  },
  {
    id: "grains",
    number: "04",
    title: "Hand-Graded English Willow",
    subtitle: "J.S. Wright & Sons Clefts",
    description:
      "Each cleft is imported directly from England and cured in Sialkot for 18 months. Selected for tight, uniform straight grains with zero structural blemishes in the hitting area.",
    spec: "8 - 14 Straight Grains · Unbleached Natural Oil Finish",
    icon: CheckCircle2,
  },
  {
    id: "balance",
    number: "05",
    title: "Featherlight Balance Dynamics",
    subtitle: "Calculated Weight Distribution",
    description:
      "Through parabolic duckbill scalloping, dead weight is removed from the shoulders and toe. A 2lb 9oz bat feels like 2lb 7oz in the hands for lightning-fast reaction time.",
    spec: "Digital Scale Calibrated · Center of Gravity Balanced",
    icon: Cpu,
  },
  {
    id: "toe",
    number: "06",
    title: "Factory Rubber Toe Guard",
    subtitle: "Yorker & Crease Moisture Barrier",
    description:
      "Pre-fitted hard rubber toe shield and round-chamfered edge prevents wood splits from toeing yorkers and stops pitch water from seeping into the willow grain.",
    spec: "Pre-Fitted Rubber Shield · Rounded Safety Sanding",
    icon: Hammer,
  },
];

export function BatAnatomyShowcase() {
  const [selectedPoint, setSelectedPoint] = useState<string>("swell");

  const activePoint = ANATOMY_POINTS.find((p) => p.id === selectedPoint) || ANATOMY_POINTS[2];

  return (
    <section className="anatomy-section">
      <div className="anatomy-container">
        {/* Section Header */}
        <div className="section-head-center">
          <span className="section-eyebrow">The Sialkot Difference · Master Batmaking</span>
          <h2 className="section-heading">
            Anatomy of an <span className="gold-text">Elite Match Bat</span>
          </h2>
          <p className="section-subtext">
            Why do over 70% of international cricket brands rely on Sialkot artisans?
            Every millimeter is calculated for explosive boundary hitting, perfect balance, and zero hand sting.
          </p>
        </div>

        {/* Interactive Anatomy Layout */}
        <div className="anatomy-grid">
          {/* Left / Center Visual Preview */}
          <div className="anatomy-visual-card">
            <div className="bat-visual-wrapper">
              <img
                src="/assets/products/bats/apex-edition/apex-pro-front-a.webp"
                alt="Sialkot Bat Anatomy Breakdown"
                className="anatomy-bat-image"
              />

              {/* Interactive Visual Hotspots */}
              <button
                className={`anatomy-hotspot spot-handle ${selectedPoint === "handle" ? "active" : ""}`}
                onClick={() => setSelectedPoint("handle")}
                aria-label="Inspect Handle"
              >
                <span>01</span>
              </button>
              <button
                className={`anatomy-hotspot spot-edges ${selectedPoint === "edges" ? "active" : ""}`}
                onClick={() => setSelectedPoint("edges")}
                aria-label="Inspect Edges"
              >
                <span>02</span>
              </button>
              <button
                className={`anatomy-hotspot spot-swell ${selectedPoint === "swell" ? "active" : ""}`}
                onClick={() => setSelectedPoint("swell")}
                aria-label="Inspect Swell"
              >
                <span>03</span>
              </button>
              <button
                className={`anatomy-hotspot spot-grains ${selectedPoint === "grains" ? "active" : ""}`}
                onClick={() => setSelectedPoint("grains")}
                aria-label="Inspect Grains"
              >
                <span>04</span>
              </button>
              <button
                className={`anatomy-hotspot spot-toe ${selectedPoint === "toe" ? "active" : ""}`}
                onClick={() => setSelectedPoint("toe")}
                aria-label="Inspect Toe Guard"
              >
                <span>06</span>
              </button>
            </div>

            {/* Active Highlight Panel under Bat */}
            <div className="anatomy-active-panel">
              <div className="active-panel-top">
                <span className="point-number-badge">{activePoint.number}</span>
                <div>
                  <h3 className="point-title">{activePoint.title}</h3>
                  <span className="point-subtitle">{activePoint.subtitle}</span>
                </div>
              </div>
              <p className="point-desc">{activePoint.description}</p>
              <div className="point-spec-chip">
                <strong>Specification:</strong> {activePoint.spec}
              </div>
            </div>
          </div>

          {/* Right Column: List of All Points */}
          <div className="anatomy-points-list">
            {ANATOMY_POINTS.map((point) => {
              const Icon = point.icon;
              const isCurrent = point.id === selectedPoint;
              return (
                <div
                  key={point.id}
                  onClick={() => setSelectedPoint(point.id)}
                  className={`anatomy-point-card ${isCurrent ? "active" : ""}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedPoint(point.id);
                  }}
                >
                  <div className="point-card-icon">
                    <Icon size={20} />
                  </div>
                  <div className="point-card-body">
                    <div className="point-card-header">
                      <span className="point-idx">{point.number}</span>
                      <strong className="point-name">{point.title}</strong>
                    </div>
                    <p className="point-summary">{point.subtitle}</p>
                  </div>
                </div>
              );
            })}

            <div className="anatomy-cta-box">
              <div>
                <strong>Want custom dimensions?</strong>
                <p>Choose your exact handle length, edge thickness, and curve in our Custom Bat Lab.</p>
              </div>
              <Link href="/custom-bat" className="custom-lab-link">
                <span>Build Custom Bat</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
