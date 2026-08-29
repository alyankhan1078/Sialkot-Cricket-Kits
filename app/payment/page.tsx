import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Send,
  Wallet,
  MessageCircle,
  ArrowRight,
  Globe,
  CheckCircle2,
  Copy,
  Factory,
} from "lucide-react";
import { whatsappUrl } from "@/src/lib/whatsapp";

export const metadata: Metadata = {
  title: "Official Payment Methods & Bank Details | Sialkot Cricket Kits",
  description: "Official accepted payment channels, verified UBL bank wire details, Payoneer account, Pakistani mobile wallets (JazzCash, Nayapay, SadaPay, EasyPaisa), and factory information for Sialkot Cricket Kits orders.",
  robots: { index: false, follow: false },
};

const acceptedInternationalMethods = [
  "Payoneer (B2B & Global Receiving in GBP, USD, EUR)",
  "JazzCash / Nayapay / SadaPay / Raast / EasyPaisa (0323 1438214)",
  "Wise (TransferWise)",
  "TapTap Send",
  "Remitly",
  "MoneyGram",
  "Western Union",
  "WorldRemit",
  "(IMT) International Money Transfer through any bank or exchange",
];

export default function PaymentPage() {
  return (
    <main className="payment-page-container">
      {/* Page Hero */}
      <section className="page-hero compact-hero">
        <div>
          <span className="eyebrow">Verified Payment Information</span>
          <h1>Accepted Payment Methods.</h1>
          <p>
            You may conveniently send your payment through any of our official banking, Payoneer, Pakistan digital wallets, or international remittance options.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        {/* Accepted Payment Methods Banner */}
        <div style={{
          background: "var(--card-bg, #181c24)",
          border: "1px solid var(--border-color, #2a313d)",
          borderRadius: 16,
          padding: "28px 32px",
          marginBottom: 32,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 10, borderRadius: 10, background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.3rem", margin: 0, color: "#fff" }}>Accepted Payment Methods</h2>
              <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Worldwide & Domestic Options</span>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12,
            marginTop: 18,
          }}>
            {acceptedInternationalMethods.map((m) => (
              <div
                key={m}
                style={{
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid #334155",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "#cbd5e1",
                  fontSize: "0.88rem",
                  fontWeight: 500,
                }}
              >
                <ShieldCheck size={18} color="var(--accent, #f59e0b)" />
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bank, Payoneer, Pakistan Wallets & Factory Information Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 32 }}>
          
          {/* Card 1: UBL Bank Details Card */}
          <div style={{
            background: "var(--card-bg, #181c24)",
            border: "1px solid var(--border-color, #2a313d)",
            borderRadius: 16,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ padding: 10, borderRadius: 10, background: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.25rem", margin: 0, color: "#fff" }}>🏦 Bank Account (UBL)</h2>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>United Bank Limited (UBL)</span>
                </div>
              </div>

              <div style={{
                background: "rgba(0,0,0,0.3)",
                padding: "20px",
                borderRadius: 12,
                border: "1px solid #334155",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 20,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Beneficiary:</span>
                  <strong style={{ color: "#fff", fontSize: "0.9rem" }}>ALYAN WAZIR</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Bank Name:</span>
                  <strong style={{ color: "#fff", fontSize: "0.9rem" }}>United Bank Limited (UBL)</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Account Number:</span>
                  <strong style={{ color: "var(--accent, #f59e0b)", fontSize: "0.95rem" }}>0881304929964</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>IBAN:</span>
                  <strong style={{ color: "#4ade80", fontSize: "0.85rem", wordBreak: "break-all" }}>PK93UNIL0109000304929964</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Branch & SWIFT:</span>
                  <span style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>0881-Wana · <strong>UNILPKKA</strong></span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Mobile:</span>
                  <strong style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>+92 323 1438214</strong>
                </div>
              </div>
            </div>

            <a
              href={whatsappUrl("Hello Sialkot Cricket Kits, I would like to send my order payment through UBL Bank wire transfer.")}
              target="_blank"
              rel="noreferrer"
              className="button whatsapp"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", borderRadius: 8 }}
            >
              <MessageCircle size={18} /> Confirm UBL Wire on WhatsApp
            </a>
          </div>

          {/* Card 2: Payoneer Account Card */}
          <div style={{
            background: "var(--card-bg, #181c24)",
            border: "1px solid var(--border-color, #2a313d)",
            borderRadius: 16,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ padding: 10, borderRadius: 10, background: "rgba(249, 115, 22, 0.15)", color: "#f97316" }}>
                  <Globe size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.25rem", margin: 0, color: "#fff" }}>🌐 Payoneer Account</h2>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>B2B & Global Receiving Accounts</span>
                </div>
              </div>

              <div style={{
                background: "rgba(0,0,0,0.3)",
                padding: "20px",
                borderRadius: 12,
                border: "1px solid #334155",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 20,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Account Name:</span>
                  <strong style={{ color: "#fff", fontSize: "0.9rem" }}>Alyan Wazir</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Payoneer Email:</span>
                  <strong style={{ color: "var(--accent, #f59e0b)", fontSize: "0.9rem" }}>sialkotcricketkits@gmail.com</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Customer ID:</span>
                  <strong style={{ color: "#4ade80", fontSize: "0.9rem" }}>99767685</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Connected Bank:</span>
                  <span style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>UBL Bank (0881304929964)</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Currencies:</span>
                  <strong style={{ color: "#fff", fontSize: "0.85rem" }}>GBP (£), USD ($), EUR (€)</strong>
                </div>
              </div>
            </div>

            <a
              href={whatsappUrl("Hello Sialkot Cricket Kits, I would like to send my order payment via Payoneer.")}
              target="_blank"
              rel="noreferrer"
              className="button secondary"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", borderRadius: 8 }}
            >
              <MessageCircle size={18} /> Confirm Payoneer Payment
            </a>
          </div>

          {/* Card 3: Pakistan Wallets & Microfinance */}
          <div style={{
            background: "var(--card-bg, #181c24)",
            border: "1px solid var(--border-color, #2a313d)",
            borderRadius: 16,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ padding: 10, borderRadius: 10, background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}>
                  <Wallet size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.25rem", margin: 0, color: "#fff" }}>🇵🇰 Pakistan Wallets</h2>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>JazzCash, Nayapay, SadaPay, EasyPaisa</span>
                </div>
              </div>

              <div style={{
                background: "rgba(0,0,0,0.3)",
                padding: "20px",
                borderRadius: 12,
                border: "1px solid #334155",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 20,
              }}>
                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.75rem", display: "block" }}>JazzCash / Nayapay / SadaPay / Raast ID:</span>
                  <strong style={{ color: "#fff", fontSize: "1rem" }}>0323 1438214</strong>
                </div>

                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.75rem", display: "block" }}>EasyPaisa Account:</span>
                  <strong style={{ color: "#4ade80", fontSize: "1rem" }}>0323 1438214</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Account Title:</span>
                  <strong style={{ color: "var(--accent, #f59e0b)", fontSize: "0.9rem" }}>ALYAN WAZIR</strong>
                </div>
              </div>
            </div>

            <a
              href={whatsappUrl("Hello Sialkot Cricket Kits, I would like to send my order payment via JazzCash / SadaPay / Nayapay / EasyPaisa.")}
              target="_blank"
              rel="noreferrer"
              className="button whatsapp"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", borderRadius: 8 }}
            >
              <MessageCircle size={18} /> Confirm Mobile Wallet Payment
            </a>
          </div>

          {/* Card 4: Factory & Workshop Details Card */}
          <div style={{
            background: "var(--card-bg, #181c24)",
            border: "1px solid var(--border-color, #2a313d)",
            borderRadius: 16,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ padding: 10, borderRadius: 10, background: "rgba(245, 158, 11, 0.15)", color: "var(--accent, #f59e0b)" }}>
                  <Factory size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.25rem", margin: 0, color: "#fff" }}>🏭 Factory & Office Address</h2>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Sialkot Manufacturing Headquarters</span>
                </div>
              </div>

              <div style={{
                background: "rgba(0,0,0,0.3)",
                padding: "20px",
                borderRadius: 12,
                border: "1px solid #334155",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 20,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 6 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Factory Name:</span>
                  <strong style={{ color: "#fff", fontSize: "0.88rem" }}>Superior Cricket Factory</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 6 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Address:</span>
                  <span style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>House No. 207, Gulshan Street</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 6 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Town & City:</span>
                  <span style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>Model Town, Sialkot</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Country:</span>
                  <strong style={{ color: "#fff", fontSize: "0.88rem" }}>Pakistan</strong>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className="button primary"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", borderRadius: 8 }}
            >
              Direct Online Checkout <ArrowRight size={18} />
            </Link>
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
          flexWrap: "wrap",
        }}>
          <div style={{ padding: 14, borderRadius: "50%", background: "rgba(245, 158, 11, 0.15)", color: "var(--accent, #f59e0b)" }}>
            <ShieldCheck size={36} />
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h3 style={{ fontSize: "1.2rem", margin: "0 0 8px", color: "#fff" }}>Official Payment Verification Guarantee</h3>
            <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Always verify recipient details with official accounts: <strong>Alyan Wazir</strong> / <strong>Superior Cricket Factory</strong> via WhatsApp at <strong>+92 323 1438214</strong> or <strong>sialkotcricketkits@gmail.com</strong>.
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
