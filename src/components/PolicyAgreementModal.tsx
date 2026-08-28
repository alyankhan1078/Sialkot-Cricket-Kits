"use client";

import { useEffect, useRef } from "react";
import { X, Printer, ShieldCheck, FileText, CheckCircle2, Globe } from "lucide-react";
import { POLICY_METADATA, POLICY_SECTIONS, POLICY_LEGAL_NOTE } from "@/src/lib/policy-agreement";
import { BUSINESS_CONFIG } from "@/src/lib/business-config";

interface PolicyAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  isAccepted?: boolean;
}

export default function PolicyAgreementModal({
  isOpen,
  onClose,
  onAccept,
  isAccepted = false,
}: PolicyAgreementModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on ESC key & lock background scrolling when open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-dialog-title"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99999,
        background: "rgba(0, 0, 0, 0.82)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflowY: "auto",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Print stylesheet */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #policy-agreement-printable,
          #policy-agreement-printable * {
            visibility: visible !important;
          }
          #policy-agreement-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
          }
          #policy-agreement-printable .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        ref={modalRef}
        id="policy-agreement-printable"
        style={{
          background: "#121824",
          border: "1.5px solid rgba(242, 169, 40, 0.3)",
          borderRadius: 16,
          maxWidth: 860,
          width: "100%",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8)",
          color: "#cbd5e1",
          overflow: "hidden",
          animation: "modalFadeIn .25s ease-out",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            background: "#0d131d",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "rgba(242, 169, 40, 0.15)",
                color: "#f2a928",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={26} />
            </div>
            <div>
              <h2
                id="policy-dialog-title"
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  color: "#fff",
                  margin: 0,
                  letterSpacing: ".02em",
                }}
              >
                {POLICY_METADATA.title}
              </h2>
              <div style={{ display: "flex", gap: 12, fontSize: ".76rem", color: "#94a3b8", marginTop: 4, flexWrap: "wrap" }}>
                <span>Version: <strong style={{ color: "#f2a928" }}>{POLICY_METADATA.version}</strong></span>
                <span>·</span>
                <span>Effective Date: <strong>{POLICY_METADATA.effectiveDate}</strong></span>
                <span>·</span>
                <span>Seller: <strong>{POLICY_METADATA.sellerName}</strong></span>
              </div>
            </div>
          </div>

          <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid var(--border)",
                color: "#cbd5e1",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: ".78rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
              title="Print or Save Agreement as PDF"
            >
              <Printer size={15} /> Print / PDF
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#f87171",
                padding: "8px",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Close Agreement Modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Policy Body */}
        <div
          style={{
            padding: "24px 28px",
            overflowY: "auto",
            flex: 1,
            lineHeight: 1.65,
            fontSize: ".88rem",
          }}
        >
          {/* Official Entity Metadata Card */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 10,
              padding: "14px 18px",
              marginBottom: 24,
              fontSize: ".82rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
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
              <span style={{ color: "#94a3b8", display: "block", fontSize: ".72rem", textTransform: "uppercase" }}>Official Contacts</span>
              <div style={{ color: "#cbd5e1" }}>📱 {POLICY_METADATA.whatsapp}</div>
              <div style={{ color: "#cbd5e1" }}>✉️ {POLICY_METADATA.email}</div>
            </div>
          </div>

          {/* 17 Policy Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {POLICY_SECTIONS.map((sec) => (
              <article
                key={sec.id}
                style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  paddingBottom: 18,
                }}
              >
                <h3
                  style={{
                    fontSize: "1.02rem",
                    fontWeight: 700,
                    color: "#f2a928",
                    margin: "0 0 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {sec.title}
                </h3>

                {sec.paragraphs.map((p, idx) => (
                  <p key={idx} style={{ margin: "0 0 8px", color: "#cbd5e1" }}>
                    {p}
                  </p>
                ))}

                {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                  <ul
                    style={{
                      margin: "8px 0 12px",
                      paddingLeft: 22,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      color: "#94a3b8",
                    }}
                  >
                    {sec.bulletPoints.map((item, bIdx) => (
                      <li key={bIdx} style={{ fontSize: ".84rem" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {sec.additionalParagraphs &&
                  sec.additionalParagraphs.map((ap, apIdx) => (
                    <p key={apIdx} style={{ margin: "8px 0 0", color: "#cbd5e1" }}>
                      {ap}
                    </p>
                  ))}
              </article>
            ))}
          </div>

          {/* Bottom Legal Note */}
          <div
            style={{
              marginTop: 22,
              padding: "14px 18px",
              background: "rgba(242, 169, 40, 0.08)",
              border: "1px solid rgba(242, 169, 40, 0.25)",
              borderRadius: 10,
              fontSize: ".8rem",
              color: "#fbbf24",
              lineHeight: 1.5,
            }}
          >
            <strong>Legal Notice:</strong> {POLICY_LEGAL_NOTE}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div
          className="no-print"
          style={{
            padding: "16px 24px",
            background: "#0d131d",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ fontSize: ".82rem", color: "#94a3b8" }}>
            Acceptance is recorded with your verified order submission.
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {onAccept && (
              <button
                type="button"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                style={{
                  background: isAccepted
                    ? "rgba(34, 197, 94, 0.2)"
                    : "linear-gradient(135deg, #f2a928 0%, #d97706 100%)",
                  border: isAccepted ? "1px solid #22c55e" : "none",
                  color: isAccepted ? "#4ade80" : "#000",
                  fontWeight: 800,
                  padding: "10px 20px",
                  borderRadius: 8,
                  fontSize: ".86rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <CheckCircle2 size={16} />
                {isAccepted ? "Policies Accepted ✓" : "I Agree & Accept Policies"}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                fontWeight: 600,
                padding: "10px 18px",
                borderRadius: 8,
                fontSize: ".86rem",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
