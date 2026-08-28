import Link from "next/link";
import { ArrowRight, Flame, MessageCircle, ShieldCheck, Sparkles, Truck, Video, Award } from "lucide-react";
import { whatsappUrl } from "@/src/lib/whatsapp";

interface CinematicHeroBannerProps {
  heading?: string;
  supportingText?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  whatsappMessage?: string;
}

export function CinematicHeroBanner({
  heading = "ENGINEERED FOR POWER. CRAFTED IN SIALKOT.",
  supportingText = "Master-crafted from select Grade 1+ English Willow clefts. Massive edges, featherlight pickup, and devastating sweet spots—delivered worldwide with live 4K video ping verification.",
  primaryCtaText = "Shop 2026 Range",
  primaryCtaLink = "#products",
  secondaryCtaText = "WhatsApp Us",
  whatsappMessage = "Hello Master Batmaker, I would like to explore your 2026 cricket bats and match equipment.",
}: CinematicHeroBannerProps) {
  return (
    <section className="cinematic-hero gn-hero-banner" aria-label="Sialkot Cricket Kits Showcase">
      {/* 4K Hero Media Background */}
      <div className="cinematic-hero-media">
        <img
          src="/assets/hero/sialkot-cricket-kits-homepage-hero.jpg"
          alt="Premium Cricket Equipment Handcrafted in Sialkot - Master Match Bats"
          className="cinematic-hero-img"
          width={1920}
          height={1080}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="cinematic-hero-overlay gn-hero-overlay" />
      </div>

      {/* Hero Content */}
      <div className="cinematic-hero-container gn-hero-container">
        <div className="cinematic-hero-content gn-hero-content">
          {/* Gray-Nicolls Style Eyebrow Badge */}
          <div className="gn-hero-badge">
            <span className="gn-hero-badge-tag">2026 SEASON</span>
            <span className="gn-hero-badge-text">OFFICIAL MASTER WILLOW WORKSHOP</span>
          </div>

          <h1 className="cinematic-hero-title gn-hero-title">
            THE WORLD&apos;S MASTER <span className="gn-hero-title-highlight">CRICKET BATS.</span>
          </h1>

          <p className="cinematic-hero-desc gn-hero-desc">
            {supportingText}
          </p>

          <div className="cinematic-hero-ctas gn-hero-ctas">
            <a
              href="#products"
              className="gn-btn-primary"
              id="hero-primary-cta"
            >
              <span>Explore 2026 Range</span>
              <ArrowRight size={16} />
            </a>

            <Link
              href="/custom-bat"
              className="gn-btn-secondary"
              id="hero-custom-cta"
            >
              <Sparkles size={16} className="gn-btn-gold-icon" />
              <span>Bespoke Bat Lab</span>
            </Link>

            <a
              href={whatsappUrl(whatsappMessage)}
              target="_blank"
              rel="noreferrer"
              className="gn-btn-whatsapp"
              id="hero-whatsapp-cta"
              aria-label="Contact Master Batmaker on WhatsApp"
            >
              <MessageCircle size={16} />
              <span>WhatsApp Advice</span>
            </a>
          </div>
        </div>
      </div>

      {/* Gray-Nicolls Style 4-Pillar Trust Ribbon */}
      <div className="gn-trust-ribbon">
        <div className="gn-trust-grid">
          <div className="gn-trust-item">
            <Award size={18} className="gn-trust-icon" />
            <div>
              <strong>Grade 1+ Master Willow</strong>
              <span>Handpicked English clefts</span>
            </div>
          </div>

          <div className="gn-trust-item">
            <Truck size={18} className="gn-trust-icon" />
            <div>
              <strong>Worldwide Express Courier</strong>
              <span>DHL / FedEx tracked delivery</span>
            </div>
          </div>

          <div className="gn-trust-item">
            <Video size={18} className="gn-trust-icon" />
            <div>
              <strong>Live Ping Video Proof</strong>
              <span>Inspected on WhatsApp before dispatch</span>
            </div>
          </div>

          <div className="gn-trust-item">
            <ShieldCheck size={18} className="gn-trust-icon" />
            <div>
              <strong>50% Flexible Deposit</strong>
              <span>Balance payable before flight</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
