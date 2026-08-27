"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Flame,
  MessageCircle,
  Play,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Truck,
  Video,
} from "lucide-react";
import { whatsappUrl } from "@/src/lib/whatsapp";

interface BatAngle {
  id: string;
  label: string;
  sublabel: string;
  image: string;
  badge: string;
  highlight: string;
  stats: {
    edge: string;
    grains: string;
    weight: string;
    pingScore: string;
  };
}

const BAT_ANGLES: BatAngle[] = [
  {
    id: "face",
    label: "Pristine Face",
    sublabel: "Front Grain Structure",
    image: "/assets/products/bats/apex-edition/apex-pro-front-b.webp",
    badge: "Grade 1+ English Willow",
    highlight: "10-14 Straight Grains with zero blemishes in prime hitting zone",
    stats: {
      edge: "41 mm",
      grains: "12 Straight",
      weight: "2lb 8.5oz",
      pingScore: "9.9 / 10",
    },
  },
  {
    id: "profile",
    label: "40mm+ Profile",
    sublabel: "Spine & Monster Edge",
    image: "/assets/products/bats/apex-edition/apex-pro-profile-detail.webp",
    badge: "Monster Explosive Sweetspot",
    highlight: "Mid-to-low swell engineered for maximum boundary clearance on drives",
    stats: {
      edge: "42 mm",
      grains: "Curved Spine",
      weight: "Feather Pickup",
      pingScore: "10 / 10",
    },
  },
  {
    id: "reverse",
    label: "Reverse Scallop",
    sublabel: "Convex Aerodynamics",
    image: "/assets/products/bats/apex-edition/apex-pro-reverse.webp",
    badge: "Pro Balance Engineering",
    highlight: "Subtle concave spine sculpting removes dead weight for lightning bat speed",
    stats: {
      edge: "Full Contour",
      grains: "Singapore Cane",
      weight: "2lb 8oz feel",
      pingScore: "9.8 / 10",
    },
  },
  {
    id: "toe",
    label: "Toe Armour",
    sublabel: "Crease & Yorker Shield",
    image: "/assets/products/bats/apex-edition/apex-pro-toe-front.webp",
    badge: "Pre-Fitted Factory Toe Guard",
    highlight: "Reinforced rubber barrier protects against moisture absorption and yorker impact",
    stats: {
      edge: "Rounded Toe",
      grains: "Sealed Wood",
      weight: "Zero Drag",
      pingScore: "Protected",
    },
  },
];

export function HomeHeroInteractive() {
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);
  const currentAngle = BAT_ANGLES[activeAngleIndex];

  return (
    <section className="world-hero">
      {/* Background ambient lighting */}
      <div className="world-hero-glow glow-1" />
      <div className="world-hero-glow glow-2" />

      <div className="world-hero-container">
        {/* Left Column: Copy & Value Proposition */}
        <div className="world-hero-content">
          <div className="world-hero-badge">
            <span className="live-pulse" />
            <span className="badge-text">Direct From Sialkot Workshop · Est. 1982</span>
            <span className="badge-pill">2026 Edition</span>
          </div>

          <h1 className="world-hero-title">
            Crafted for <span className="gradient-text">Match Winners.</span>
            <br />
            Inspected by the <span className="gold-text">Master Eye.</span>
          </h1>

          <p className="world-hero-description">
            Experience hand-carved Grade 1+ English Willow straight from the cricket capital of the world.
            Each cleft is pressed, weight-balanced, and audio-tested with a 5.5oz leather ball—verified
            via <strong>live WhatsApp ping video</strong> before dispatch.
          </p>

          {/* Action CTAs */}
          <div className="world-hero-actions">
            <Link href="/shop" className="hero-btn-primary">
              <span>Explore 2026 Collection</span>
              <ArrowRight size={18} />
            </Link>
            <a
              href={whatsappUrl(
                "Hello Master Batmaker, I would like to inspect Grade 1+ bats currently available in your Sialkot workshop with a live ping video."
              )}
              target="_blank"
              rel="noreferrer"
              className="hero-btn-whatsapp"
            >
              <MessageCircle size={18} />
              <span>Consult Batmaker (WhatsApp)</span>
            </a>
          </div>

          {/* Quick Pillar Bullets */}
          <div className="world-hero-pillars">
            <div className="pillar-item">
              <div className="pillar-icon"><ShieldCheck size={16} /></div>
              <div>
                <strong>Grade 1+ English Willow</strong>
                <span>Air-dried 18+ months for resilience</span>
              </div>
            </div>
            <div className="pillar-item">
              <div className="pillar-icon"><Video size={16} /></div>
              <div>
                <strong>Video Ping Verified</strong>
                <span>Mallet & ball rebound proof on WhatsApp</span>
              </div>
            </div>
            <div className="pillar-item">
              <div className="pillar-icon"><Truck size={16} /></div>
              <div>
                <strong>Worldwide Express</strong>
                <span>Tracked DHL / FedEx to UK, US, AU & more</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 360° Interactive Bat Showcase */}
        <div className="world-hero-showcase">
          <div className="showcase-card">
            {/* Interactive Angle Switcher Tabs */}
            <div className="showcase-header">
              <div className="showcase-header-title">
                <RotateCw size={15} className="rotate-icon" />
                <span>Interactive Bat Inspector</span>
              </div>
              <div className="angle-tabs">
                {BAT_ANGLES.map((angle, idx) => (
                  <button
                    key={angle.id}
                    onClick={() => setActiveAngleIndex(idx)}
                    className={`angle-tab-btn ${idx === activeAngleIndex ? "active" : ""}`}
                    aria-label={`Inspect ${angle.label}`}
                  >
                    {angle.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Bat Visual Stage */}
            <div className="showcase-stage">
              <div className="stage-lighting" />
              <img
                key={currentAngle.image}
                src={currentAngle.image}
                alt={`Sialkot Apex Pro bat - ${currentAngle.label}`}
                className="stage-bat-image"
              />

              {/* Floating Highlight Chip */}
              <div className="floating-highlight">
                <span className="highlight-tag">{currentAngle.badge}</span>
                <p className="highlight-text">{currentAngle.highlight}</p>
              </div>

              {/* Ping Video Demo Mini Button */}
              <a
                href={whatsappUrl(`Hello Sialkot Cricket Kits, please send me the live mallet ping test video for the ${currentAngle.label} Apex Pro bat.`)}
                target="_blank"
                rel="noreferrer"
                className="floating-video-trigger"
                title="Request live ping video for this bat"
              >
                <div className="play-pulse"><Play size={12} fill="currentColor" /></div>
                <span>Live Ping Video On Demand</span>
              </a>
            </div>

            {/* Spec Footer */}
            <div className="showcase-footer">
              <div className="spec-metric">
                <span className="metric-label">Edge Profile</span>
                <strong className="metric-val">{currentAngle.stats.edge}</strong>
              </div>
              <div className="spec-metric">
                <span className="metric-label">Grain Density</span>
                <strong className="metric-val">{currentAngle.stats.grains}</strong>
              </div>
              <div className="spec-metric">
                <span className="metric-label">Pick-up Balance</span>
                <strong className="metric-val">{currentAngle.stats.weight}</strong>
              </div>
              <div className="spec-metric ping-metric">
                <span className="metric-label">Rebound Index</span>
                <strong className="metric-val ping-val">
                  <Flame size={14} /> {currentAngle.stats.pingScore}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
