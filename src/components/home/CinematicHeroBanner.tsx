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
        <picture>
          <source
            type="image/webp"
            srcSet="/assets/hero/sialkot-cricket-kits-homepage-hero.webp"
          />
          <img
            src="/assets/hero/sialkot-cricket-kits-homepage-hero.png"
            alt="Premium Cricket Equipment Crafted in Sialkot - Official Match Bats and Gear"
            className="cinematic-hero-img"
            width={1672}
            height={941}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
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
            <Link
              href={primaryCtaLink}
              className="cinematic-btn-primary"
              id="hero-primary-cta"
            >
              <span>{primaryCtaText}</span>
              <ArrowRight size={18} className="btn-arrow-icon" />
            </Link>

            <a
              href={whatsappUrl(whatsappMessage)}
              target="_blank"
              rel="noreferrer"
              className="cinematic-btn-secondary"
              id="hero-secondary-cta"
              aria-label="Contact Sialkot Cricket Kits on WhatsApp"
            >
              <MessageCircle size={18} className="btn-wa-icon" />
              <span>{secondaryCtaText}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
