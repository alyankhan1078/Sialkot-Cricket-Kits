import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  CreditCard,
  Building2,
  Send,
  Wallet,
  CheckCircle2,
  MessageCircle,
  Lock,
  ArrowRight,
  Globe2,
  FileCheck2,
} from "lucide-react";
import { whatsappUrl } from "@/src/lib/whatsapp";

export const metadata: Metadata = {
  title: "Payment Guidance & Accepted Channels | Sialkot Cricket Kits",
  description: "Official payment channels and verification guidelines for domestic and international cricket equipment orders from Sialkot Cricket Kits.",
  robots: { index: false, follow: false },
};

export default function PaymentPage() {
  return (
    <main className="payment-page-container">
      {/* Page Hero */}
      <section className="page-hero compact-hero">
        <div>
          <span className="eyebrow">Verified Payment Methods</span>
          <h1>Official Payment Channels.</h1>
          <p>
            We accept trusted domestic and international payment methods with secure proof of payment verification for worldwide tracked delivery.
          </p>
        </div>
      </section>

      {/* Main Payment Grid */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24, marginBottom: 40 }}>
          {/* Card 1: International Transfers */}
          <div style={{
            background: "var(--card-bg, #181c24)",
            border: "1px solid var(--border-color, #2a313d)",
            borderRadius: 16,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ padding: 10, borderRadius: 10, background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
                  <Globe2 size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.25rem", margin: 0, color: "#fff" }}>International Transfers</h2>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>UK, USA, Canada, Australia, UAE & Worldwide</span>
                </div>
              </div>

              <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 20 }}>
                Direct low-fee international remittances with instantaneous delivery to our verified bank account in Sialkot.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ display: "block", color: "#fff", fontSize: "0.85rem" }}>Wise Transfer (Recommended)</strong>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Fastest & lowest fees for GBP, USD, EUR, AUD</span>
                  </div>
                  <span style={{ color: "var(--accent, #f59e0b)", fontSize: "0.75rem", fontWeight: 600 }}>Instant</span>
                </div>

                <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid #334155" }}>
                  <strong style={{ display: "block", color: "#fff", fontSize: "0.85rem" }}>Remitly & TapTap Send</strong>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Direct mobile-to-bank transfer with high exchange rates</span>
                </div>

                <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid #334155" }}>
                  <strong style={{ display: "block", color: "#fff", fontSize: "0.85rem" }}>Western Union & MoneyGram</strong>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Cash agent & online bank payout transfer</span>
                </div>
              </div>
            </div>

            <a
              href={whatsappUrl("Hello Sialkot Cricket Kits, I would like to confirm international transfer details for my order.")}
              target="_blank"
              rel="noreferrer"
              className="button whatsapp"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 16px", borderRadius: 8 }}
            >
              <MessageCircle size={16} /> Confirm International Wire Details
            </a>
          </div>

          {/* Card 2: Direct Bank & IBAN */}
          <div style={{
            background: "var(--card-bg, #181c24)",
            border: "1px solid var(--border-color, #2a313d)",
            borderRadius: 16,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ padding: 10, borderRadius: 10, background: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.25rem", margin: 0, color: "#fff" }}>Official Bank Account</h2>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Direct Telegraphic Transfer (TT) & IBAN</span>
                </div>
              </div>

              <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 20 }}>
                Our registered business bank account for official international wire and club team orders.
              </p>

              <div style={{ background: "rgba(0,0,0,0.25)", padding: "14px 16px", borderRadius: 10, border: "1px solid #334155", display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Bank Name:</span>
                  <strong style={{ color: "#fff", fontSize: "0.85rem" }}>Meezan Bank Limited</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Account Title:</span>
                  <strong style={{ color: "#fff", fontSize: "0.85rem" }}>Sialkot Cricket Kits</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>SWIFT / BIC:</span>
                  <strong style={{ color: "var(--accent, #f59e0b)", fontSize: "0.85rem" }}>MEZNPKKA</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Branch:</span>
                  <span style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>Model Town Branch, Sialkot</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: "0.75rem", color: "#94a3b8", textAlign: "center" }}>
              Full IBAN is shared upon order confirmation to ensure safe recipient verification.
            </div>
          </div>

          {/* Card 3: Pakistan Domestic Payments */}
          <div style={{
            background: "var(--card-bg, #181c24)",
            border: "1px solid var(--border-color, #2a313d)",
            borderRadius: 16,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ padding: 10, borderRadius: 10, background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}>
                  <Wallet size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.25rem", margin: 0, color: "#fff" }}>Pakistan Local Orders</h2>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Raast Instant, JazzCash & EasyPaisa</span>
                </div>
              </div>

              <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 20 }}>
                Instant zero-fee transfer options for domestic club cricketers and academies across Pakistan.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ display: "block", color: "#fff", fontSize: "0.85rem" }}>Raast ID (Instant Bank Transfer)</strong>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>0323 1438214 (All Pakistani Banks)</span>
                  </div>
                  <span style={{ color: "#22c55e", fontSize: "0.75rem", fontWeight: 600 }}>0% Fee</span>
                </div>

                <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid #334155" }}>
                  <strong style={{ display: "block", color: "#fff", fontSize: "0.85rem" }}>JazzCash & EasyPaisa</strong>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Registered Mobile Number: 0323 1438214</span>
                </div>

                <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid #334155" }}>
                  <strong style={{ display: "block", color: "#fff", fontSize: "0.85rem" }}>Local Courier COD</strong>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Available for standard non-customized equipment across major cities</span>
                </div>
              </div>
            </div>

            <a
              href={whatsappUrl("Hello Sialkot Cricket Kits, I am ordering from Pakistan and would like to confirm domestic payment details.")}
              target="_blank"
              rel="noreferrer"
              className="button secondary"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 16px", borderRadius: 8 }}
            >
              <MessageCircle size={16} /> Confirm Pakistan Payment
            </a>
          </div>
        </div>

        {/* Security & Verification Banner */}
        <div style={{
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(30, 41, 59, 0.6) 100%)",
          border: "1px solid rgba(245, 158, 11, 0.25)",
          borderRadius: 16,
          padding: 32,
          display: "flex",
          gap: 24,
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          <div style={{ padding: 14, borderRadius: "50%", background: "rgba(245, 158, 11, 0.15)", color: "var(--accent, #f59e0b)" }}>
            <ShieldCheck size={36} />
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h3 style={{ fontSize: "1.2rem", margin: "0 0 8px", color: "#fff" }}>Official Payment Verification Guarantee</h3>
            <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Always confirm recipient details through our official WhatsApp at <strong>+92 323 1438214</strong> or <strong>sialkotcricketkits@gmail.com</strong>.
              Upon receiving payment, our team provides an official invoice and live ping demonstration videos before worldwide courier dispatch.
            </p>
          </div>
          <Link href="/shop" className="button primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
            Explore Catalogue <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
