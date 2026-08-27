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
} from "lucide-react";
import { getCategories, getFaqs, getProducts, getSettings } from "@/src/lib/data-service";
import { whatsappUrl } from "@/src/lib/whatsapp";
import { CinematicHeroBanner } from "@/src/components/home/CinematicHeroBanner";
import { HomeProductsDirect } from "@/src/components/home/HomeProductsDirect";

export const metadata = {
  title: "Sialkot Cricket Kits | World Top-Class Cricket Bats & Gear Worldwide",
  description:
    "Direct from Sialkot master batmakers: Handcrafted Grade 1+ English Willow cricket bats, test-grade pads, gloves, and kit bags. Live WhatsApp ping videos and express worldwide delivery.",
};

export default async function HomePage() {
  const [products, categories, faqs, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    getFaqs(),
    getSettings(),
  ]);

  return (
    <main className="world-homepage">
      {/* 1. Cinematic Hero Banner (Compact & Clean) */}
      <CinematicHeroBanner />

      {/* 2. Direct Parallel 3-Column Products Catalogue with Left Category Drawer */}
      <HomeProductsDirect
        initialProducts={products as any}
        initialCategories={categories as any}
      />

      {/* 3. Bespoke Custom Bat Lab Teaser */}
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

      {/* 11. Complete Price Sheet & Catalogue Download */}
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
                href={settings.catalogueUrl || "#"}
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

      {/* 12. FAQ Section */}
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

      {/* 13. VIP Batmaker Concierge Final Banner */}
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
