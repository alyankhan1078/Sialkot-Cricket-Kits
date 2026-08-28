import Link from "next/link";
import { ShieldCheck, ArrowLeft, Printer } from "lucide-react";
import { POLICY_METADATA, POLICY_SECTIONS, POLICY_LEGAL_NOTE } from "@/src/lib/policy-agreement";

export const metadata = {
  title: "International Shipping, Returns & Product Agreement | Sialkot Cricket Kits",
  description:
    "Official Commercial & Consumer Agreement covering natural willow disclosure, Bonafide bats, Beauty Processed bats, customisation, international shipping, customs, and payment verification.",
};

export default function InternationalAgreementPage() {
  return (
    <main style={{ maxWidth: 960, margin: "40px auto 80px", padding: "0 20px", color: "var(--text-primary)" }}>
      {/* Breadcrumb / Back button */}
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/shop"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-muted)",
            textDecoration: "none",
            fontSize: ".86rem",
          }}
        >
          <ArrowLeft size={16} /> Back to Shop
        </Link>
      </div>

      {/* Header Banner */}
      <div
        style={{
          background: "#141922",
          border: "1.5px solid rgba(242, 169, 40, 0.3)",
          borderRadius: 16,
          padding: "32px 28px",
          marginBottom: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: "rgba(242, 169, 40, 0.15)",
              color: "#f2a928",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldCheck size={30} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>
              {POLICY_METADATA.title}
            </h1>
            <div style={{ display: "flex", gap: 12, fontSize: ".82rem", color: "#94a3b8", flexWrap: "wrap" }}>
              <span>Version: <strong style={{ color: "#f2a928" }}>{POLICY_METADATA.version}</strong></span>
              <span>·</span>
              <span>Effective Date: <strong>{POLICY_METADATA.effectiveDate}</strong></span>
              <span>·</span>
              <span>Seller: <strong>{POLICY_METADATA.sellerName}</strong></span>
            </div>
          </div>
        </div>

        {/* Business Metadata */}
        <div
          style={{
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 10,
            padding: "14px 18px",
            marginTop: 18,
            fontSize: ".82rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <div>
            <span style={{ color: "#94a3b8", display: "block", fontSize: ".72rem", textTransform: "uppercase" }}>Seller &amp; Factory</span>
            <strong style={{ color: "#fff" }}>{POLICY_METADATA.sellerName}</strong>
            <div style={{ color: "#cbd5e1" }}>{POLICY_METADATA.factoryName}</div>
          </div>
          <div>
            <span style={{ color: "#94a3b8", display: "block", fontSize: ".72rem", textTransform: "uppercase" }}>Address</span>
            <div style={{ color: "#cbd5e1" }}>{POLICY_METADATA.address}</div>
          </div>
          <div>
            <span style={{ color: "#94a3b8", display: "block", fontSize: ".72rem", textTransform: "uppercase" }}>Official Contact</span>
            <div style={{ color: "#cbd5e1" }}>📱 WhatsApp: {POLICY_METADATA.whatsapp}</div>
            <div style={{ color: "#cbd5e1" }}>✉️ {POLICY_METADATA.email}</div>
          </div>
        </div>
      </div>

      {/* Policy Articles */}
      <div
        style={{
          background: "#111722",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "32px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        {POLICY_SECTIONS.map((sec) => (
          <article
            key={sec.id}
            style={{
              borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
              paddingBottom: 22,
            }}
          >
            <h2
              style={{
                fontSize: "1.12rem",
                fontWeight: 700,
                color: "#f2a928",
                margin: "0 0 10px",
              }}
            >
              {sec.title}
            </h2>

            {sec.paragraphs.map((p, idx) => (
              <p key={idx} style={{ margin: "0 0 10px", color: "#cbd5e1", lineHeight: 1.65 }}>
                {p}
              </p>
            ))}

            {sec.bulletPoints && sec.bulletPoints.length > 0 && (
              <ul
                style={{
                  margin: "8px 0 14px",
                  paddingLeft: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  color: "#94a3b8",
                  lineHeight: 1.5,
                }}
              >
                {sec.bulletPoints.map((item, bIdx) => (
                  <li key={bIdx}>{item}</li>
                ))}
              </ul>
            )}

            {sec.additionalParagraphs &&
              sec.additionalParagraphs.map((ap, apIdx) => (
                <p key={apIdx} style={{ margin: "8px 0 0", color: "#cbd5e1", lineHeight: 1.65 }}>
                  {ap}
                </p>
              ))}
          </article>
        ))}

        {/* Legal Disclaimer Box */}
        <div
          style={{
            padding: "16px 20px",
            background: "rgba(242, 169, 40, 0.08)",
            border: "1px solid rgba(242, 169, 40, 0.3)",
            borderRadius: 10,
            fontSize: ".84rem",
            color: "#fbbf24",
            lineHeight: 1.5,
          }}
        >
          <strong>Legal Notice:</strong> {POLICY_LEGAL_NOTE}
        </div>
      </div>
    </main>
  );
}
