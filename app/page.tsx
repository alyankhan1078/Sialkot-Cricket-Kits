import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Download,
  Flame,
  HelpCircle,
  Layers,
  MessageCircle,
  PackageCheck,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Truck,
  Video,
  Award,
  Star,
  CheckCircle,
} from "lucide-react";
import { getCategories, getFaqs, getProducts, getSettings } from "@/src/lib/data-service";
import { whatsappUrl } from "@/src/lib/whatsapp";
import { CinematicHeroBanner } from "@/src/components/home/CinematicHeroBanner";
import { HomeProductsDirect } from "@/src/components/home/HomeProductsDirect";

export const metadata = {
  title: "Sialkot Cricket Kits | World-Class Cricket Bats & Gear Worldwide",
  description:
    "Official match-grade cricket bats, test pads, gloves and bespoke bat craftsmanship from Sialkot. Direct factory pricing, express tracked courier, and live WhatsApp ping videos.",
};

export default async function HomePage() {
  const [products, categories, faqs, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    getFaqs(),
    getSettings(),
  ]);

  return (
    <main className="world-homepage gn-home-page">
      {/* 1. Gray-Nicolls Style Cinematic Hero Banner */}
      <CinematicHeroBanner />

      {/* 2. Gray-Nicolls "SHOP BY RANGE" Showcase Grid */}
      <section className="gn-ranges-section" aria-label="Featured Equipment Ranges">
        <div className="gn-ranges-container">
          <div className="gn-section-header">
            <div className="gn-header-badge">
              <span className="gn-badge-dot" />
              <span>2026 PERFORMANCE RANGES</span>
            </div>
            <h2 className="gn-section-title">
              EXPLORE BY <span className="gn-highlight">COLLECTION</span>
            </h2>
            <p className="gn-section-sub">
              Precision-tuned cricket equipment tailored for every playing style, pitch condition, and format.
            </p>
          </div>

          <div className="gn-ranges-grid">
            {/* Range 1: Monster Series */}
            <Link
              href="/shop?category=Beauty%20Processed%20Bats"
              className="gn-range-card"
            >
              <div className="gn-range-media">
                <img
                  src="/assets/products/bats/monster-power/monster-power-front.webp"
                  alt="Monster Series Cricket Bats"
                  className="gn-range-img"
                  loading="lazy"
                />
                <span className="gn-range-tag red">PRO GRADE 1+</span>
              </div>
              <div className="gn-range-content">
                <span className="gn-range-family">POWER HITTERS RANGE</span>
                <h3 className="gn-range-title">MONSTER SERIES</h3>
                <p className="gn-range-desc">
                  Massive 40mm+ contoured edges, full profile, and enlarged sweet spot for boundary clearers.
                </p>
                <div className="gn-range-cta">
                  <span>Explore Monster Range</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            </Link>

            {/* Range 2: Bonafide Match Series */}
            <Link
              href="/shop?category=Bonafide%20Bats"
              className="gn-range-card"
            >
              <div className="gn-range-media">
                <img
                  src="/assets/products/bats/bonafide-alpha/bonafide-alpha-front.webp"
                  alt="Bonafide Match Series Cricket Bats"
                  className="gn-range-img"
                  loading="lazy"
                />
                <span className="gn-range-tag gold">CLASSIC PROFILE</span>
              </div>
              <div className="gn-range-content">
                <span className="gn-range-family">TEST MATCH SERIES</span>
                <h3 className="gn-range-title">BONAFIDE MATCH</h3>
                <p className="gn-range-desc">
                  Sublime balance, duckbill toe tapering, and featherlight pickup engineered for elegant strokeplay.
                </p>
                <div className="gn-range-cta">
                  <span>Explore Bonafide Range</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            </Link>

            {/* Range 3: Test Protection */}
            <Link
              href="/shop?category=Batting%20Pads"
              className="gn-range-card"
            >
              <div className="gn-range-media">
                <img
                  src="/assets/products/pads/pro-test-white/pro-test-white-main.webp"
                  alt="Test Grade Batting Pads and Gloves"
                  className="gn-range-img"
                  loading="lazy"
                />
                <span className="gn-range-tag dark">TEST GRADE</span>
              </div>
              <div className="gn-range-content">
                <span className="gn-range-family">DEFENSIVE ARMOUR</span>
                <h3 className="gn-range-title">TEST PROTECTION</h3>
                <p className="gn-range-desc">
                  High-density lightweight cane pads, XRD knee cups, and multi-split sausage batting gloves.
                </p>
                <div className="gn-range-cta">
                  <span>Explore Protection</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            </Link>

            {/* Range 4: Bespoke Bat Lab */}
            <Link
              href="/custom-bat"
              className="gn-range-card highlight-card"
            >
              <div className="gn-range-media">
                <img
                  src="/assets/products/bats/special-edition/special-edition-front-a.webp"
                  alt="Bespoke Custom Bat Workshop"
                  className="gn-range-img"
                  loading="lazy"
                />
                <span className="gn-range-tag gold">CUSTOM WORKSHOP</span>
              </div>
              <div className="gn-range-content">
                <span className="gn-range-family">BESPOKE WORKSHOP</span>
                <h3 className="gn-range-title">CUSTOM BAT LAB</h3>
                <p className="gn-range-desc">
                  Select your raw cleft, handle shape, blade curvature, and laser-engrave your name and number.
                </p>
                <div className="gn-range-cta gold">
                  <span>Build Your Bat</span>
                  <Sparkles size={15} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Direct Parallel 3-Column Products Catalogue with Left Category Drawer */}
      <HomeProductsDirect
        initialProducts={products as any}
        initialCategories={categories as any}
      />

      {/* 4. Gray-Nicolls Style Heritage & Master Craftsmanship Story */}
      <section className="gn-craft-story-section">
        <div className="gn-craft-container">
          <div className="gn-craft-grid">
            <div className="gn-craft-media-wrap">
              <img
                src="/assets/hero/sialkot-cricket-kits-homepage-hero.jpg"
                alt="Master batmaker crafting a cricket bat in Sialkot"
                className="gn-craft-main-img"
                loading="lazy"
              />
              <div className="gn-craft-experience-badge">
                <strong>100+ YEARS</strong>
                <span>CRAFTING HERITAGE</span>
              </div>
            </div>

            <div className="gn-craft-text-wrap">
              <div className="gn-header-badge">
                <span className="gn-badge-dot" />
                <span>THE SIALKOT TRADITION</span>
              </div>

              <h2 className="gn-craft-title">
                HANDCRAFTED WHERE <span className="gn-highlight">LEGENDS ARE BORN</span>
              </h2>

              <p className="gn-craft-p">
                Sialkot is globally renowned as the world capital of handcrafted cricket gear. For generations,
                our master podshavers have shaped clefts for international players, balancing raw power with
                unrivaled pickup.
              </p>

              <div className="gn-craft-pillars">
                <div className="gn-craft-pillar">
                  <div className="gn-pillar-icon-box">
                    <Award size={20} className="gn-pillar-icon" />
                  </div>
                  <div>
                    <h4>Unbleached Grade 1+ English Willow</h4>
                    <p>Each cleft is hand-selected from top-tier JS Wright &amp; Sons UK willow clefts for straight, dense grains and explosive response.</p>
                  </div>
                </div>

                <div className="gn-craft-pillar">
                  <div className="gn-pillar-icon-box">
                    <Flame size={20} className="gn-pillar-icon" />
                  </div>
                  <div>
                    <h4>15,000-Stroke Machine Knocking-In</h4>
                    <p>Optional automated factory pre-knocking and oiling to compress willow fibres evenly, making your bat match-ready from day one.</p>
                  </div>
                </div>

                <div className="gn-craft-pillar">
                  <div className="gn-pillar-icon-box">
                    <Video size={20} className="gn-pillar-icon" />
                  </div>
                  <div>
                    <h4>Live 4K Ping Video Inspection</h4>
                    <p>Before packing, we ping your exact bat with an old leather ball on WhatsApp so you can hear its bell-like resonance.</p>
                  </div>
                </div>
              </div>

              <div className="gn-craft-action-row">
                <Link href="/about" className="gn-btn-primary">
                  <span>Read Factory Story</span>
                  <ArrowRight size={16} />
                </Link>
                <a
                  href={whatsappUrl("Hello Master Batmaker, I would like to learn more about your bat crafting process.")}
                  target="_blank"
                  rel="noreferrer"
                  className="gn-btn-whatsapp"
                >
                  <MessageCircle size={16} />
                  <span>Talk to a Batmaker</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bespoke Custom Bat Lab Teaser */}
      <section className="custom-lab-banner-section">
        <div className="custom-lab-banner-container">
          <div className="custom-banner-card">
            <div className="custom-banner-visual">
              <img
                src="/assets/products/bats/special-edition/special-edition-front-a.webp"
                alt="Custom carved cricket bat in Sialkot workshop"
                className="custom-banner-img"
              />
              <span className="custom-banner-badge">Bespoke Workshop Service</span>
            </div>

            <div className="custom-banner-content">
              <span className="section-eyebrow">Your Bat · Your Exact Dimensions</span>
              <h2 className="custom-banner-title">
                Hand-Carved to Your <span className="gold-text">Exact Match Specification.</span>
              </h2>
              <p className="custom-banner-p">
                Select your raw English Willow cleft, handle geometry (round or oval), balance point,
                edge thickness, and personalized laser engraving. Ready for match play with optional
                15,000-machine knocking-in.
              </p>

              <div className="custom-banner-steps">
                <div className="cb-step">
                  <span className="cb-num">01</span>
                  <div>
                    <strong>Choose Cleft &amp; Grains</strong>
                    <span>Grade 1+ unbleached willow</span>
                  </div>
                </div>
                <div className="cb-step">
                  <span className="cb-num">02</span>
                  <div>
                    <strong>Profile &amp; Spine</strong>
                    <span>Duckbill, full, or concave</span>
                  </div>
                </div>
                <div className="cb-step">
                  <span className="cb-num">03</span>
                  <div>
                    <strong>Laser Engraving</strong>
                    <span>Your name &amp; club emblem</span>
                  </div>
                </div>
                <div className="cb-step">
                  <span className="cb-num">04</span>
                  <div>
                    <strong>Live Ping Video</strong>
                    <span>Confirmed before shipping</span>
                  </div>
                </div>
              </div>

              <div className="custom-banner-actions">
                <Link href="/custom-bat" className="custom-action-primary">
                  <span>Start Custom Bat Builder</span>
                  <ArrowRight size={18} />
                </Link>
                <a
                  href={whatsappUrl(
                    "Hello Sialkot Cricket Kits, I want to discuss building a custom cricket bat with specific weight and profile."
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="custom-action-whatsapp"
                >
                  <MessageCircle size={18} />
                  <span>Discuss Specs on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Complete Price Sheet & Catalogue Download */}
      <section className="catalogue-download-section">
        <div className="catalogue-download-container">
          <div className="cat-download-box">
            <div className="cat-download-left">
              <span className="section-eyebrow">Official Factory Catalogue</span>
              <h2>Download the 2026 Complete Equipment Sheet</h2>
              <p>
                Get all 140+ bats, protective gear, wicketkeeping gloves, helmets, teamwear, and bag listings
                with wholesale and individual retail GBP pricing in one PDF.
              </p>
            </div>
            <div className="cat-download-actions">
              <a
                href={settings.catalogueUrl || "/Sialkot_Cricket_Kits_Product_Catalogue_2026.pdf"}
                download
                className="btn-download-pdf"
              >
                <Download size={18} />
                <span>Download PDF Sheet</span>
              </a>
              <a
                href={whatsappUrl("Hello Sialkot Cricket Kits, please send me your latest 2026 catalogue and price list.")}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp-shortlist"
              >
                <MessageCircle size={18} />
                <span>WhatsApp Shortlist</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Verified Player Reviews */}
      <section className="gn-reviews-section">
        <div className="gn-reviews-container">
          <div className="gn-section-header">
            <div className="gn-header-badge">
              <span className="gn-badge-dot" />
              <span>TESTIMONIALS</span>
            </div>
            <h2 className="gn-section-title">
              TRUSTED BY PLAYERS <span className="gn-highlight">WORLDWIDE</span>
            </h2>
            <p className="gn-section-sub">
              Delivering match-winning equipment to league cricketers across the UK, USA, Australia, and Pakistan.
            </p>
          </div>

          <div className="gn-reviews-grid">
            <div className="gn-review-card">
              <div className="gn-review-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="gn-review-quote">
                &ldquo;Ordered a Bonafide Match bat to London. The batmaker sent me a WhatsApp video showing 10 grains and a ping test with a 156g ball. Pick-up is like a feather and it pinged straight out of the box.&rdquo;
              </p>
              <div className="gn-reviewer-info">
                <strong>Liam Henderson</strong>
                <span>Surrey Championship League, UK</span>
              </div>
            </div>

            <div className="gn-review-card">
              <div className="gn-review-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="gn-review-quote">
                &ldquo;The Custom Bat Builder is exceptional. I asked for a 2lb 8oz bat with 41mm edges and round handle. Dispatched via DHL Express and arrived in Sydney in 4 days. Incredible craftsmanship.&rdquo;
              </p>
              <div className="gn-reviewer-info">
                <strong>Mitchell Davies</strong>
                <span>Grade Cricket, Sydney Australia</span>
              </div>
            </div>

            <div className="gn-review-card">
              <div className="gn-review-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="gn-review-quote">
                &ldquo;We kitted out our entire club with batting pads, gloves, and wheelie bags. The build quality exceeds commercial brands at double the price. Direct factory communication is second to none.&rdquo;
              </p>
              <div className="gn-reviewer-info">
                <strong>Zain Malik</strong>
                <span>North East Premier League, TX USA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section className="home-faq-section">
        <div className="home-faq-container">
          <div className="section-head-center">
            <span className="section-eyebrow">Clear Answers</span>
            <h2 className="section-heading">
              Frequently Asked <span className="gold-text">Questions</span>
            </h2>
            <p className="section-subtext">
              Everything you need to know about international shipping times, live ping videos, knocking-in, and custom orders.
            </p>
          </div>

          <div className="home-faq-grid">
            {faqs.slice(0, 6).map((faq) => (
              <details key={faq.id} className="home-faq-item">
                <summary className="faq-summary">
                  <span>{faq.question}</span>
                  <span className="faq-toggle">+</span>
                </summary>
                <div className="faq-body">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="faq-bottom-link">
            <Link href="/faq" className="see-all-faqs-link">
              <span>View All 20+ Frequently Asked Questions</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. VIP Batmaker Concierge Final Banner */}
      <section className="concierge-vip-section">
        <div className="concierge-container">
          <div className="concierge-card">
            <div className="concierge-glow" />
            <div className="concierge-content">
              <span className="concierge-pill">Personal Batmaker Concierge</span>
              <h2>Ready to Elevate Your Cricket Game?</h2>
              <p>
                Whether you need advice on the ideal weight for English wickets, want to inspect our current batch of Grade 1+ clefts, or need kit for your entire club—our master batmaker is a WhatsApp message away.
              </p>
              <div className="concierge-buttons">
                <a
                  href={whatsappUrl("Hello Master Batmaker, I would like personal guidance choosing my next match bat.")}
                  target="_blank"
                  rel="noreferrer"
                  className="concierge-whatsapp-btn"
                >
                  <MessageCircle size={20} />
                  <span>Start WhatsApp Consultation</span>
                </a>
                <Link href="/shop" className="concierge-shop-btn">
                  <span>Browse Full Inventory</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
              <div className="concierge-security-note">
                <ShieldCheck size={16} />
                <span>Zero obligation · 4K video inspection sent prior to any payment</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
