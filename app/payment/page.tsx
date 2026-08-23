import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Send,
  Wallet,
  MessageCircle,
  ArrowRight,
  Globe2,
  CheckCircle2,
  Copy,
  Factory,
} from "lucide-react";
import { whatsappUrl } from "@/src/lib/whatsapp";

export const metadata: Metadata = {
  title: "Official Payment Methods & Bank Details | Sialkot Cricket Kits",
  description: "Official accepted payment channels, verified UBL bank wire details, and factory information for Sialkot Cricket Kits orders.",
  robots: { index: false, follow: false },
};

const acceptedInternationalMethods = [
  "TapTap Send",
  "Remitly",
  "MoneyGram",
  "Wise (TransferWise)",
  "Western Union",
  "WorldRemit",
  "(IMT) International Money Transfer through any exchange",
  "(IMT) International Money Transfer through any bank",
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
            You may conveniently send your payment through any of our official banking or international remittance options.
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

        {/* Bank Details & Factory Information Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24, marginBottom: 32 }}>
          {/* UBL Bank Details Card */}
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
                  <h2 style={{ fontSize: "1.25rem", margin: 0, color: "#fff" }}>🏦 Bank Account Details (UBL)</h2>
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
                gap: 12,
                marginBottom: 20,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Beneficiary / First Name:</span>
                  <strong style={{ color: "#fff", fontSize: "0.9rem" }}>ALYAN</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Last Name:</span>
                  <strong style={{ color: "#fff", fontSize: "0.9rem" }}>WAZIR</strong>
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
                  <strong style={{ color: "#4ade80", fontSize: "0.9rem", wordBreak: "break-all" }}>PK93UNIL0109000304929964</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Branch Name / Address:</span>
                  <span style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>0881-Wana</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>SWIFT / BIC Code:</span>
                  <strong style={{ color: "var(--accent, #f59e0b)", fontSize: "0.9rem" }}>UNILPKKA</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Mobile Number:</span>
                  <strong style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>+92 327 5756188</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Email Address:</span>
                  <span style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>sialkotcricketkits@gmail.com</span>
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

          {/* Factory & Workshop Details Card */}
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
                gap: 12,
                marginBottom: 20,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Factory Name:</span>
                  <strong style={{ color: "#fff", fontSize: "0.9rem" }}>Superior Cricket Factory</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>House:</span>
                  <span style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>No# 207</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Street:</span>
                  <span style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>Gulshan Street</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Town:</span>
                  <span style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>Model Town</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>City:</span>
                  <strong style={{ color: "var(--accent, #f59e0b)", fontSize: "0.9rem" }}>Sialkot</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Country:</span>
                  <strong style={{ color: "#fff", fontSize: "0.9rem" }}>Pakistan</strong>
                </div>
              </div>

              <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.6 }}>
                All customized cricket bats and protective equipment are crafted, laser-engraved, gripped, and dispatched directly from our Sialkot factory with worldwide express tracking.
              </p>
            </div>

            <Link
              href="/custom-bat"
              className="button primary"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", borderRadius: 8 }}
            >
              Order Custom Bat from Factory <ArrowRight size={18} />
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
              Always confirm recipient details through our official WhatsApp at <strong>+92 323 1438214</strong> / <strong>+92 327 5756188</strong> or <strong>sialkotcricketkits@gmail.com</strong>.
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
