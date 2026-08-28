import { Metadata } from "next";
import Link from "next/link";
import { RotateCcw, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Return Policy | Sialkot Cricket Kits",
  description:
    "Refund and Return Policy for Sialkot Cricket Kits. Learn about our inspection guarantee, replacements, and refund conditions.",
};

export default function RefundPolicyPage() {
  return (
    <main style={{ maxWidth: 880, margin: "40px auto 80px", padding: "0 24px", color: "var(--text-primary)" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to Store
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <RotateCcw size={32} color="#38bdf8" />
        <h1 style={{ fontSize: "2.2rem", margin: 0, fontWeight: 800 }}>Refund &amp; Return Policy</h1>
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: 32 }}>
        Last updated: January 2026 · Sialkot Cricket Kits
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, lineHeight: 1.7, fontSize: "0.95rem", color: "#cbd5e1" }}>
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: "#fff", fontSize: "1.2rem", marginTop: 0 }}>1. Pre-Dispatch Video Inspection Guarantee</h2>
          <p>
            To ensure 100% customer satisfaction, we record and share a <strong>4K ping test and dimensional verification video</strong> via WhatsApp before any order leaves our Sialkot factory. If you are unsatisfied with the grain alignment or ping test before dispatch, we will happily select a different cleft or re-craft your bat at zero additional cost.
          </p>
        </section>

        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: "#fff", fontSize: "1.2rem", marginTop: 0 }}>2. Returns &amp; Replacements</h2>
          <p>
            If your gear arrives damaged during international courier transit, please notify us within <strong>7 days</strong> of delivery with unboxing photos/videos. We will initiate an immediate replacement or courier claim.
          </p>
        </section>

        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: "#fff", fontSize: "1.2rem", marginTop: 0 }}>3. Custom Personalized Bats</h2>
          <p>
            Bats with personalized name or club laser engraving cannot be returned for change of mind once approved on video and dispatched, except in cases of verified manufacturing defects or transit damage.
          </p>
        </section>

        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: "#fff", fontSize: "1.2rem", marginTop: 0 }}>4. Refund Processing</h2>
          <p>
            Approved refunds will be credited back to the original payment source (Safepay card account, bank transfer, or wallet) within 5–7 business days.
          </p>
        </section>
      </div>
    </main>
  );
}
