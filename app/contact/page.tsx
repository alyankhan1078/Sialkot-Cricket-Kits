import type { Metadata } from "next";
import Link from "next/link";
import {
  MessageCircle,
  Mail,
  MapPin,
  Globe2,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Instagram,
  Facebook,
  ExternalLink,
} from "lucide-react";
import { ContactForm } from "@/src/components/ContactForm";
import { whatsappUrl } from "@/src/lib/whatsapp";
import { BUSINESS_CONFIG } from "@/src/lib/business-config";

export const metadata: Metadata = {
  title: "Contact Sialkot Cricket Kits | Official Factory Support & Orders",
  description:
    "Direct contact with Sialkot master batmakers and customer support. WhatsApp, email, live bat ping videos, OEM inquiries and express worldwide delivery support.",
};

const mapsUrl = "https://www.google.com/maps/search/?api=1&query=House+207+Gulshan+Street+Model+Town+Sialkot+Pakistan";

// TikTok SVG Icon component
const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43c.004-.004.008-.007.012-.011.05-.05.097-.102.142-.156.09-.107.172-.22.247-.338.077-.123.143-.252.199-.387.057-.14.1-.284.13-.432V9.06a8.16 8.16 0 0 0 5-1.74v-.63z" />
  </svg>
);

export default function ContactPage() {
  const whatsappHeroUrl = whatsappUrl(
    "Hello Sialkot Cricket Kits, I would like stock confirmation and order assistance for a product."
  );
  const oemWhatsappUrl = whatsappUrl(
    "Hello Sialkot Cricket Kits, I would like to discuss OEM / custom manufacturing requirements for our club/store/brand."
  );

  return (
    <main className="contact-page-root">
      {/* ──────────────────────────────────────────
          1. RESTRAINED PREMIUM DARK HERO
         ────────────────────────────────────────── */}
      <section className="contact-hero-section" aria-label="Contact Support Header">
        <div className="contact-hero-container">
          <span className="contact-hero-eyebrow">
            PRODUCT &amp; ORDER SUPPORT
          </span>

          <h1 className="contact-hero-title">
            Talk to our Sialkot team.
          </h1>

          <p className="contact-hero-desc">
            Need stock confirmation, product pictures, customization details or a shipping quote? Send us the product name, quantity and destination country and our team will assist you.
          </p>

          <div className="contact-hero-actions">
            <a
              href={whatsappHeroUrl}
              target="_blank"
              rel="noreferrer"
              className="contact-hero-btn primary-wa"
              id="contact-hero-whatsapp"
            >
              <MessageCircle size={18} />
              <span>WhatsApp Our Team</span>
            </a>

            <a
              href={`mailto:${BUSINESS_CONFIG.primaryEmail}?subject=${encodeURIComponent("Sialkot Cricket Kits — Product & Order Enquiry")}`}
              className="contact-hero-btn secondary-email"
              id="contact-hero-email"
            >
              <Mail size={18} />
              <span>Email Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          2. FOUR PREMIUM CONTACT CARDS GRID
         ────────────────────────────────────────── */}
      <section className="contact-cards-section" aria-label="Direct Contact Channels">
        <div className="contact-content-container">
          <div className="contact-cards-grid">
            {/* CARD 1: WHATSAPP */}
            <article className="premium-contact-card featured-wa">
              <div className="card-top-bar">
                <div className="card-icon-bubble wa">
                  <MessageCircle size={22} />
                </div>
                <span className="card-badge green">Fastest Option</span>
              </div>

              <span className="card-eyebrow">WHATSAPP · DIRECT CHAT</span>
              <h2 className="card-main-title">{BUSINESS_CONFIG.displayPhone}</h2>

              <p className="card-desc">
                Recommended for immediate stock availability, high-res photos, grain close-ups and bat ping audio recordings.
              </p>

              <ul className="card-points-list">
                <li><span>✓</span> Stock confirmation &amp; reservations</li>
                <li><span>✓</span> Live bat ping videos &amp; willow grain pics</li>
                <li><span>✓</span> Custom bat specifications assistance</li>
              </ul>

              <a
                href={whatsappHeroUrl}
                target="_blank"
                rel="noreferrer"
                className="card-action-btn wa"
              >
                <MessageCircle size={16} />
                <span>Message on WhatsApp</span>
              </a>
            </article>

            {/* CARD 2: EMAIL */}
            <article className="premium-contact-card">
              <div className="card-top-bar">
                <div className="card-icon-bubble email">
                  <Mail size={22} />
                </div>
                <span className="card-badge slate">Official Inbox</span>
              </div>

              <span className="card-eyebrow">EMAIL · QUOTATIONS &amp; ENQUIRIES</span>
              <h2 className="card-main-title email-text">{BUSINESS_CONFIG.primaryEmail}</h2>

              <p className="card-desc">
                Ideal for detailed price quotations, international club inquiries, wholesale requests, and official business correspondence.
              </p>

              <ul className="card-points-list">
                <li><span>✓</span> Formal written price quotations</li>
                <li><span>✓</span> OEM &amp; private label manufacturing</li>
                <li><span>✓</span> Bulk academy &amp; club order packs</li>
              </ul>

              <a
                href={`mailto:${BUSINESS_CONFIG.primaryEmail}?subject=${encodeURIComponent("Sialkot Cricket Kits — Quotation Request")}`}
                className="card-action-btn email"
              >
                <Mail size={16} />
                <span>Send Email</span>
              </a>
            </article>

            {/* CARD 3: FACTORY LOCATION */}
            <article className="premium-contact-card">
              <div className="card-top-bar">
                <div className="card-icon-bubble loc">
                  <MapPin size={22} />
                </div>
                <span className="card-badge amber">Manufacturing Hub</span>
              </div>

              <span className="card-eyebrow">FACTORY / LOCATION</span>
              <h2 className="card-main-title loc-title">Sialkot, Pakistan</h2>

              <p className="card-desc loc-address">
                <strong>{BUSINESS_CONFIG.factoryName}</strong><br />
                {BUSINESS_CONFIG.houseNumber}, {BUSINESS_CONFIG.street}<br />
                {BUSINESS_CONFIG.town}, {BUSINESS_CONFIG.city}, {BUSINESS_CONFIG.country}
              </p>

              <ul className="card-points-list">
                <li><span>✓</span> Master batmaking workshop</li>
                <li><span>✓</span> International dispatch facility</li>
                <li><span>✓</span> Heritage Sialkot sports craftsmanship</li>
              </ul>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="card-action-btn neutral"
              >
                <MapPin size={16} />
                <span>View on Google Maps</span>
              </a>
            </article>

            {/* CARD 4: WORLDWIDE DELIVERY */}
            <article className="premium-contact-card">
              <div className="card-top-bar">
                <div className="card-icon-bubble delivery">
                  <Globe2 size={22} />
                </div>
                <span className="card-badge blue">Air Express</span>
              </div>

              <span className="card-eyebrow">WORLDWIDE DELIVERY · INTERNATIONAL</span>
              <h2 className="card-main-title">Express Courier</h2>

              <p className="card-desc">
                We serve customers across UK, Europe, USA, Canada, Australia, New Zealand, UAE, and 50+ countries with tracked air courier.
              </p>

              <ul className="card-points-list">
                <li><span>✓</span> Live tracking numbers on dispatch</li>
                <li><span>✓</span> Protective carton bat packaging</li>
                <li><span>✓</span> Dynamic shipping rates by zone</li>
              </ul>

              <Link
                href="/shop"
                className="card-action-btn dark"
              >
                <span>Browse Equipment Catalogue</span>
                <ArrowRight size={16} />
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          3. HOW TO GET A FASTER RESPONSE
         ────────────────────────────────────────── */}
      <section className="fast-response-section" aria-label="How to get a faster response">
        <div className="contact-content-container">
          <div className="section-title-lockup">
            <span className="section-eyebrow">SPEED UP YOUR REQUEST</span>
            <h2 className="section-heading">Get a faster response</h2>
            <p className="section-desc">
              Send these 4 details with your message so our master batmakers can check willow stock and calculate shipping immediately.
            </p>
          </div>

          <div className="fast-response-grid">
            <div className="fast-step-card">
              <div className="step-num">01</div>
              <strong className="step-title">Product &amp; Grade</strong>
              <p className="step-text">
                Specify the bat model, blade profile, protective gear item, or required size.
              </p>
            </div>

            <div className="fast-step-card">
              <div className="step-num">02</div>
              <strong className="step-title">Quantity</strong>
              <p className="step-text">
                Tell us how many bats or kit units you need (individual or team orders).
              </p>
            </div>

            <div className="fast-step-card">
              <div className="step-num">03</div>
              <strong className="step-title">Destination</strong>
              <p className="step-text">
                Provide your country and postal code for precise air courier calculation.
              </p>
            </div>

            <div className="fast-step-card">
              <div className="step-num">04</div>
              <strong className="step-title">Customization</strong>
              <p className="step-text">
                Mention any laser name engraving, weight preference, or bespoke specs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          4. INTERACTIVE ENQUIRY FORM & CHECKLIST
         ────────────────────────────────────────── */}
      <section className="contact-enquiry-section" aria-label="Send an enquiry">
        <div className="contact-content-container">
          <div className="enquiry-layout-grid">
            {/* Form Column */}
            <div className="enquiry-form-card">
              <div className="form-heading-group">
                <span className="section-eyebrow">DIRECT INQUIRY</span>
                <h2 className="form-title">Send an enquiry</h2>
                <p className="form-subtitle">
                  Fill in your details below and choose whether to send via WhatsApp or Email.
                </p>
              </div>

              <ContactForm />
            </div>

            {/* Sidebar Column */}
            <aside className="enquiry-sidebar">
              <div className="sidebar-guide-card">
                <div className="guide-card-header">
                  <ShieldCheck size={20} className="guide-icon" />
                  <h3>Ordering Guide</h3>
                </div>
                <p className="guide-intro">
                  Follow these simple steps for a secure, hassle-free international purchase:
                </p>
                <ul className="guide-checklist">
                  <li>
                    <span className="check-bullet">1</span>
                    <div>
                      <strong>Confirm Stock &amp; Weight</strong>
                      <span>Check available willow grains, weights (e.g. 2.8–2.10) and profiles.</span>
                    </div>
                  </li>
                  <li>
                    <span className="check-bullet">2</span>
                    <div>
                      <strong>Watch Live Video Ping</strong>
                      <span>We provide WhatsApp ball-mallet ping recordings before packing.</span>
                    </div>
                  </li>
                  <li>
                    <span className="check-bullet">3</span>
                    <div>
                      <strong>Verified Bank Account</strong>
                      <span>All transfers go to official UBL account under <em>Alyan Wazir</em>.</span>
                    </div>
                  </li>
                  <li>
                    <span className="check-bullet">4</span>
                    <div>
                      <strong>Tracked Air Courier</strong>
                      <span>Receive international tracking ID immediately upon dispatch.</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="sidebar-location-card">
                <div className="loc-card-header">
                  <MapPin size={18} className="loc-icon" />
                  <h4>Sialkot Workshop Address</h4>
                </div>
                <address className="loc-address-text">
                  {BUSINESS_CONFIG.fullFactoryAddress}
                </address>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="loc-maps-btn"
                >
                  <span>Open Address in Maps</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          5. OEM & BESPOKE CUSTOM ORDERS BANNER
         ────────────────────────────────────────── */}
      <section className="contact-oem-section" aria-label="OEM & Custom Manufacturing">
        <div className="contact-content-container">
          <div className="oem-banner-card">
            <div className="oem-banner-content">
              <span className="oem-badge">OEM &amp; PRIVATE LABEL</span>
              <h2 className="oem-title">Custom Workshop &amp; Club Manufacturing</h2>
              <p className="oem-desc">
                Need bats, protective equipment or private-label production for your club, academy, store or international brand? We manufacture bespoke gear direct from Sialkot with full custom branding and grade selection.
              </p>
              <div className="oem-actions">
                <a
                  href={oemWhatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="oem-btn whatsapp"
                >
                  <MessageCircle size={17} />
                  <span>Discuss OEM &amp; Club Requirements</span>
                </a>
                <Link href="/custom-bat" className="oem-btn custom-lab">
                  <span>Custom Bat Lab</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          6. OFFICIAL SOCIAL MEDIA CHANNELS
         ────────────────────────────────────────── */}
      <section className="contact-social-section" aria-label="Official Social Channels">
        <div className="contact-content-container">
          <div className="section-title-lockup centered">
            <span className="section-eyebrow">OFFICIAL SOCIAL MEDIA</span>
            <h2 className="section-heading">Watch Live Bat Ping &amp; Crafting Videos</h2>
            <p className="section-desc">
              Follow our official channels for live factory crafting clips, English willow grain selections, bat ping tests, and customer dispatches worldwide.
            </p>
          </div>

          <div className="contact-social-grid">
            <a
              href={BUSINESS_CONFIG.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="social-channel-card insta"
            >
              <div className="social-icon-box insta">
                <Instagram size={24} />
              </div>
              <div className="social-text-box">
                <strong className="social-platform">Instagram</strong>
                <span className="social-handle">@sialkotcricketkits</span>
                <p className="social-bio">Reels, bat sound tests &amp; master craftsmanship</p>
              </div>
              <ArrowUpRight size={18} className="social-arrow" />
            </a>

            <a
              href={BUSINESS_CONFIG.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="social-channel-card fb"
            >
              <div className="social-icon-box fb">
                <Facebook size={24} />
              </div>
              <div className="social-text-box">
                <strong className="social-platform">Facebook</strong>
                <span className="social-handle">Sialkot Cricket Kits</span>
                <p className="social-bio">Customer reviews, announcements &amp; new arrivals</p>
              </div>
              <ArrowUpRight size={18} className="social-arrow" />
            </a>

            <a
              href={BUSINESS_CONFIG.tiktokUrl}
              target="_blank"
              rel="noreferrer"
              className="social-channel-card tt"
            >
              <div className="social-icon-box tt">
                <TikTokIcon size={22} />
              </div>
              <div className="social-text-box">
                <strong className="social-platform">TikTok</strong>
                <span className="social-handle">@sialkotcricketkits</span>
                <p className="social-bio">Short bat sound clips &amp; factory workbench shorts</p>
              </div>
              <ArrowUpRight size={18} className="social-arrow" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
