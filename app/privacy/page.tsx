import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Sialkot Cricket Kits",
  description:
    "Privacy Policy for Sialkot Cricket Kits. Learn how we protect your personal data, payment information, and order details.",
};

export default function PrivacyPolicyPage() {
  return (
    <main style={{ maxWidth: 880, margin: "40px auto 80px", padding: "0 24px", color: "var(--text-primary)" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to Store
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <ShieldCheck size={32} color="#22c55e" />
        <h1 style={{ fontSize: "2.2rem", margin: 0, fontWeight: 800 }}>Privacy Policy</h1>
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: 32 }}>
        Last updated: January 2026 · Sialkot Cricket Kits (Sialkot, Pakistan)
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, lineHeight: 1.7, fontSize: "0.95rem", color: "#cbd5e1" }}>
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: "#fff", fontSize: "1.2rem", marginTop: 0 }}>1. Information We Collect</h2>
          <p>
            When you purchase cricket equipment, request a custom bat, or contact our customer support, we collect:
          </p>
          <ul style={{ paddingLeft: 20 }}>
            <li>Full Name and Delivery / Shipping Address</li>
            <li>Contact Phone Number and Email Address</li>
            <li>Custom bat match specifications (weight, profile, balance point, handle preference)</li>
            <li>Order transaction references and payment status</li>
          </ul>
        </section>

        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: "#fff", fontSize: "1.2rem", marginTop: 0 }}>2. Payment Card Security</h2>
          <p>
            Payment card processing is performed securely via <strong>Safepay Pakistan Hosted Checkout</strong>.
            We <strong>never</strong> store, process, or view your complete credit/debit card numbers, CVVs, expiry dates, or PINs on our servers.
            All checkout sessions use 256-bit SSL encryption.
          </p>
        </section>

        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: "#fff", fontSize: "1.2rem", marginTop: 0 }}>3. How We Use Your Data</h2>
          <p>We use your personal information strictly to:</p>
          <ul style={{ paddingLeft: 20 }}>
            <li>Handcraft, knock-in, and customize your cricket equipment in our Sialkot factory</li>
            <li>Dispatch your order via international tracked couriers (DHL, FedEx, TCS) and send tracking notifications</li>
            <li>Send WhatsApp/email live bat ping testing videos and confirmation receipts</li>
            <li>Provide post-purchase warranty support</li>
          </ul>
        </section>

        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: "#fff", fontSize: "1.2rem", marginTop: 0 }}>4. Contact Information</h2>
          <p>
            For privacy inquiries or data requests, contact us at:<br />
            <strong>Sialkot Cricket Kits</strong><br />
            House No. 207, Gulshan Street, Model Town, Sialkot, Pakistan<br />
            WhatsApp: +92 323 1438214 · Email: sialkotcricketkits@gmail.com
          </p>
        </section>
      </div>
    </main>
  );
}
