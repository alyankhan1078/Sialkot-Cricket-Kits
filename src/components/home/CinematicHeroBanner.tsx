import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
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
  heading = "Premium Cricket Equipment, Crafted in Sialkot",
  supportingText = "Professional cricket bats, customized equipment and OEM manufacturing—delivered worldwide.",
  primaryCtaText = "Explore Cricket Bats",
  primaryCtaLink = "/shop?category=Beauty%20Processed%20Bats",
  secondaryCtaText = "WhatsApp Us",
  whatsappMessage = "Hello Sialkot Cricket Kits, I am inquiring about your premium cricket bats and equipment.",
}: CinematicHeroBannerProps) {
  return (
    <section className="cinematic-hero" aria-label="Sialkot Cricket Kits Showcase">
      {/* Background Image Container with Desktop Gradient Overlay */}
      <div className="cinematic-hero-media">
        <img
          src="/assets/hero/sialkot-cricket-kits-homepage-hero.jpg"
          alt="Premium Cricket Equipment Crafted in Sialkot - Official Match Bats and Gear"
          className="cinematic-hero-img"
          width={1920}
          height={1080}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        {/* Subtle vignette gradient on desktop to ensure pristine text contrast on the left without obscuring bats */}
        <div className="cinematic-hero-overlay" />
      </div>

      {/* Hero Content Container */}
      <div className="cinematic-hero-container">
        <div className="cinematic-hero-content">
          <h1 className="cinematic-hero-title">
            {heading}
          </h1>

          <p className="cinematic-hero-desc">
            {supportingText}
          </p>

          <div className="cinematic-hero-ctas">
            <a
              href="#products"
              className="cinematic-btn-primary compact hero-explore-btn"
              id="hero-primary-cta"
            >
              <span>Explore Products ↓</span>
            </a>

            <a
              href={whatsappUrl(whatsappMessage)}
              target="_blank"
              rel="noreferrer"
              className="cinematic-btn-secondary compact hero-whatsapp-btn"
              id="hero-secondary-cta"
              aria-label="Contact Sialkot Cricket Kits on WhatsApp"
            >
              <MessageCircle size={15} className="btn-wa-icon" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
