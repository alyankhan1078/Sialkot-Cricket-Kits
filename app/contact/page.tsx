import type { Metadata } from "next";
import { ArrowUpRight, Facebook, Globe2, Instagram, Mail, MapPin, MessageCircle } from "lucide-react";
import { ContactForm } from "@/src/components/ContactForm";
import { whatsappUrl } from "@/src/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact Sialkot Cricket Kits | Official Social & Support",
  description: "Contact Sialkot Cricket Kits through WhatsApp, Instagram, Facebook, TikTok, or email for live bat ping videos, specifications and worldwide delivery guidance.",
};

const mapsUrl = "https://www.google.com/maps/search/?api=1&query=House+207+Gulshan+Street+Model+Town+Sialkot+Pakistan";
const instagramUrl = "https://www.instagram.com/sialkotcricketkits?igsi=aDBzenZrcnJjbXJi&utm_source=qr";
const facebookUrl = "https://www.facebook.com/share/1PTo3qxPAn/?mibextid=wwXIfr";
const tiktokUrl = "https://www.tiktok.com/@sialkotcricketkits";

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
  return (
    <main>
      <section className="page-hero compact-hero">
        <div>
          <p className="eyebrow">Product & order support</p>
          <h1>Talk to our Sialkot team.</h1>
          <p>Send the product name, required quantity and delivery country for a clear stock and shipping confirmation.</p>
        </div>
      </section>

      <section className="contact-cards">
        <article>
          <MessageCircle />
          <span>WhatsApp</span>
          <a href={whatsappUrl("Hello Sialkot Cricket Kits, I would like to discuss an order.")} target="_blank" rel="noreferrer">+92 327 5756188</a>
          <p>Fastest option for stock, pictures and live videos.</p>
        </article>
        <article>
          <Mail />
          <span>Email</span>
          <a href="mailto:sialkotcricketkits@gmail.com">sialkotcricketkits@gmail.com</a>
          <p>For detailed quotations and international enquiries.</p>
        </article>
        <article>
          <MapPin />
          <span>Factory address</span>
          <a href={mapsUrl} target="_blank" rel="noreferrer">House No. 207, Gulshan Street, Model Town, Sialkot</a>
          <p>Superior Cricket Factory, Sialkot, Pakistan.</p>
        </article>
        <article>
          <Globe2 />
          <span>Delivery</span>
          <strong>Worldwide</strong>
          <p>Charges and timing are confirmed for each destination.</p>
        </article>
      </section>

      {/* Official Social Channels Section */}
      <section className="contact-social-section">
        <div className="contact-social-header">
          <p className="eyebrow dark">Official Social Media</p>
          <h2>Watch Live Bat Ping &amp; Workshop Videos</h2>
          <p>Follow our official channels for live factory crafting clips, English willow grain selections, bat ping tests, and customer dispatches worldwide.</p>
        </div>
        <div className="contact-social-grid">
          <a href={instagramUrl} target="_blank" rel="noreferrer" className="contact-social-card insta">
            <div className="social-icon-wrapper insta">
              <Instagram size={24} />
            </div>
            <div className="social-card-text">
              <strong>Instagram</strong>
              <span>@sialkotcricketkits</span>
              <p>Reels, bat sound tests &amp; master craftsmanship</p>
            </div>
            <ArrowUpRight size={18} className="social-card-arrow" />
          </a>

          <a href={facebookUrl} target="_blank" rel="noreferrer" className="contact-social-card fb">
            <div className="social-icon-wrapper fb">
              <Facebook size={24} />
            </div>
            <div className="social-card-text">
              <strong>Facebook</strong>
              <span>Sialkot Cricket Kits</span>
              <p>Customer reviews, announcements &amp; new arrivals</p>
            </div>
            <ArrowUpRight size={18} className="social-card-arrow" />
          </a>

          <a href={tiktokUrl} target="_blank" rel="noreferrer" className="contact-social-card tt">
            <div className="social-icon-wrapper tt">
              <TikTokIcon size={22} />
            </div>
            <div className="social-card-text">
              <strong>TikTok</strong>
              <span>@sialkotcricketkits</span>
              <p>Short bat sound clips &amp; factory workbench shorts</p>
            </div>
            <ArrowUpRight size={18} className="social-card-arrow" />
          </a>
        </div>
      </section>

      <section className="contact-layout">
        <div>
          <p className="eyebrow dark">Send an enquiry</p>
          <h2>Tell us what you need.</h2>
          <p>Include the product, size, quantity and country. This form prepares a WhatsApp message or email on your device.</p>
          <ContactForm />
        </div>
        <aside>
          <h3>Before you pay</h3>
          <ul>
            <li>Confirm current product stock.</li>
            <li>Confirm bat specifications where applicable.</li>
            <li>Confirm shipping charges and delivery estimate.</li>
            <li>Use payment details received through the official WhatsApp or email.</li>
          </ul>
          <a className="button outline-dark wide" href={mapsUrl} target="_blank" rel="noreferrer">
            <MapPin size={18} /> Open address in Maps
          </a>
        </aside>
      </section>
    </main>
  );
}

