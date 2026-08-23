import Link from "next/link";
import { CheckCircle2, MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { whatsappUrl } from "@/src/lib/whatsapp";

export default function PaymentSuccessPage() {
  return (
    <main className="payment-success-page">
      <section className="page-hero compact-hero">
        <div>
          <span className="eyebrow" style={{ color: "var(--accent)" }}>Order & Payment Received</span>
          <h1>Thank you for your order!</h1>
          <p>Your payment has been processed securely. Our team in Sialkot is now preparing your cricket equipment.</p>
        </div>
      </section>

      <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{
          background: "var(--card-bg, #181c24)",
          border: "1px solid var(--border-color, #2a313d)",
          borderRadius: 16,
          padding: 36,
          textAlign: "center"
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(34, 197, 94, 0.15)",
            color: "#22c55e",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20
          }}>
            <CheckCircle2 size={40} />
          </div>

          <h2 style={{ fontSize: "1.8rem", marginBottom: 12, color: "#fff" }}>Payment Confirmed</h2>
          <p style={{ color: "var(--text-secondary, #94a3b8)", maxWidth: 500, margin: "0 auto 28px", lineHeight: 1.6 }}>
            Your transaction has been approved. If you ordered custom bats, we will send you live bat ping and preparation videos directly on WhatsApp before dispatch.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href={whatsappUrl("Hello Sialkot Cricket Kits, I just completed my order payment online. Please verify my order details.")}
              target="_blank"
              rel="noreferrer"
              className="button whatsapp"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 8 }}
            >
              <MessageCircle size={18} /> Connect on WhatsApp
            </a>

            <Link
              href="/shop"
              className="button primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 8 }}
            >
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border-color, #2a313d)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#64748b", fontSize: "0.85rem" }}>
            <ShieldCheck size={16} color="#22c55e" /> Verified Safe & Tracked Worldwide Courier Dispatch (DHL / FedEx Express)
          </div>
        </div>
      </section>
    </main>
  );
}
