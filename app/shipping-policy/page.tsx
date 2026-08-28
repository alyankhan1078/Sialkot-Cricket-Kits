import { Metadata } from "next";
import Link from "next/link";
import { Truck, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Sialkot Cricket Kits",
  description:
    "Shipping and Delivery Policy for Sialkot Cricket Kits. Worldwide tracked courier delivery via DHL Express & FedEx.",
};

export default function ShippingPolicyPage() {
  return (
    <main style={{ maxWidth: 880, margin: "40px auto 80px", padding: "0 24px", color: "var(--text-primary)" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to Store
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Truck size={32} color="#22c55e" />
        <h1 style={{ fontSize: "2.2rem", margin: 0, fontWeight: 800 }}>Shipping &amp; Delivery Policy</h1>
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: 32 }}>
        Worldwide Express Courier Dispatch from Sialkot, Pakistan
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, lineHeight: 1.7, fontSize: "0.95rem", color: "#cbd5e1" }}>
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: "#fff", fontSize: "1.2rem", marginTop: 0 }}>1. International Delivery Timelines</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem", marginTop: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "#94a3b8" }}>
                <th style={{ padding: "8px 0" }}>Destination</th>
                <th style={{ padding: "8px 0" }}>Courier Partner</th>
                <th style={{ padding: "8px 0" }}>Estimated Transit Time</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "10px 0", color: "#fff" }}>🇬🇧 United Kingdom</td>
                <td style={{ padding: "10px 0" }}>DHL Express / FedEx</td>
                <td style={{ padding: "10px 0" }}>3–5 Working Days</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "10px 0", color: "#fff" }}>🇺🇸 United States &amp; Canada</td>
                <td style={{ padding: "10px 0" }}>DHL Express / FedEx</td>
                <td style={{ padding: "10px 0" }}>4–6 Working Days</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "10px 0", color: "#fff" }}>🇦🇺 Australia &amp; New Zealand</td>
                <td style={{ padding: "10px 0" }}>DHL Express / FedEx</td>
                <td style={{ padding: "10px 0" }}>5–7 Working Days</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "10px 0", color: "#fff" }}>🇦🇪 UAE &amp; Middle East</td>
                <td style={{ padding: "10px 0" }}>DHL / Aramex Express</td>
                <td style={{ padding: "10px 0" }}>3–4 Working Days</td>
              </tr>
              <tr>
                <td style={{ padding: "10px 0", color: "#fff" }}>🇵🇰 Pakistan (Domestic)</td>
                <td style={{ padding: "10px 0" }}>TCS / Leopard Courier</td>
                <td style={{ padding: "10px 0" }}>2–3 Working Days</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: "#fff", fontSize: "1.2rem", marginTop: 0 }}>2. Combined Shipping Discounts</h2>
          <p>
            When purchasing multiple bats or matching protective gear in a single order, combined volume shipping rates automatically apply at checkout. Each additional item in the same package receives a significant shipping discount.
          </p>
        </section>

        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: "#fff", fontSize: "1.2rem", marginTop: 0 }}>3. Live Tracking Numbers</h2>
          <p>
            Once your parcel is handed over to the international courier, an official tracking number is dispatched to your email and WhatsApp for real-time door-to-door tracking.
          </p>
        </section>
      </div>
    </main>
  );
}
