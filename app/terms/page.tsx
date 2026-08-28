import { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms and Conditions | Sialkot Cricket Kits",
  description:
    "Terms and Conditions for Sialkot Cricket Kits. Learn about order confirmation, deposits, custom bat orders, and worldwide delivery.",
};

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 880, margin: "40px auto 80px", padding: "0 24px", color: "var(--text-primary)" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to Store
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <FileText size={32} color="#f2a928" />
        <h1 style={{ fontSize: "2.2rem", margin: 0, fontWeight: 800 }}>Terms and Conditions</h1>
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: 32 }}>
        Last updated: January 2026 · Sialkot Cricket Kits (Sialkot, Pakistan)
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, lineHeight: 1.7, fontSize: "0.95rem", color: "#cbd5e1" }}>
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: "#fff", fontSize: "1.2rem", marginTop: 0 }}>1. Orders &amp; Handcrafted Manufacturing</h2>
          <p>
            All cricket bats and equipment are handcrafted by master craftsmen in Sialkot, Pakistan. Because unbleached English Willow is a natural timber, natural grain variations, specks, or pin marks are normal characteristics of authentic Grade 1+ clefts.
          </p>
        </section>

        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: "#fff", fontSize: "1.2rem", marginTop: 0 }}>2. Advance Deposit &amp; Balance Payment</h2>
          <p>
            Customers may select between a <strong>30%, 35%, 50% advance deposit</strong> or <strong>100% full payment</strong> at checkout.
          </p>
          <ul style={{ paddingLeft: 20 }}>
            <li>The advance deposit reserves the raw cleft, initiates custom shaping/laser engraving, and begins knocking-in.</li>
            <li>For partial deposit orders, the remaining balance is due upon inspection and video proof of the completed bat prior to international courier dispatch.</li>
          </ul>
        </section>

        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: "#fff", fontSize: "1.2rem", marginTop: 0 }}>3. International Shipping &amp; Customs</h2>
          <p>
            We ship worldwide via DHL Express, FedEx, and tracked courier services. International buyers are responsible for any local import customs duties or taxes applicable in their respective jurisdiction.
          </p>
        </section>

        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: "#fff", fontSize: "1.2rem", marginTop: 0 }}>4. Online Payments</h2>
          <p>
            Online card payments are securely processed through <strong>Safepay Pakistan Hosted Checkout</strong> in Pakistani Rupees (PKR) and settle to our verified merchant account.
          </p>
        </section>
      </div>
    </main>
  );
}
