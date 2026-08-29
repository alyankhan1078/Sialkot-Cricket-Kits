"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Printer,
  ShoppingBag,
  MessageCircle,
  Building2,
  Mail,
  ShieldCheck,
  Truck,
  ArrowRight,
  FileText,
  AlertCircle,
  Phone,
  Globe,
} from "lucide-react";
import { useStore } from "@/src/components/StoreProvider";
import { whatsappUrl } from "@/src/lib/whatsapp";
import { UBL_PAYMENT_CONFIG, FACTORY_INFO } from "@/src/lib/payment-config";
import { BUSINESS_CONFIG } from "@/src/lib/business-config";
import { getCountryFlag } from "@/src/lib/shipping";
import type { DBOrder } from "@/src/lib/data-service";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { formatPrice } = useStore();

  const [order, setOrder] = useState<DBOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    fetch(`/api/checkout/order/${encodeURIComponent(orderId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setOrder(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const whatsappConfirmationMsg = order
    ? `Hello Sialkot Cricket Kits,\n\nI have submitted my order #${order.id}.\nCustomer: ${order.customerName}\nBank/Transfer Reference: ${order.transferReference || "Attached on site"}\nTotal Value: £${order.totalAmount}\nAmount Paid / Due: £${order.depositAmount || order.totalAmount}\n\nPlease confirm when payment is verified. Thank you!`
    : "Hello Sialkot Cricket Kits, I just submitted my order and payment evidence. Please check my transfer.";

  return (
    <>
      {/* Global Print-specific CSS styles */}
      <style jsx global>{`
        @media print {
          /* Hide all surrounding layout and website elements */
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .site-header,
          .site-footer,
          .announcement-bar,
          .screen-only,
          .order-success-hero,
          .actions-bar,
          nav,
          footer {
            display: none !important;
          }
          .order-success-page {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #printable-invoice {
            display: block !important;
            background: #ffffff !important;
            color: #0f172a !important;
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            padding: 24px !important;
            margin: 0 auto !important;
            width: 100% !important;
            page-break-inside: avoid !important;
          }
          #printable-invoice * {
            color: #0f172a !important;
          }
          #printable-invoice .invoice-brand-title {
            color: #b45309 !important;
          }
          #printable-invoice .invoice-header-box {
            border-bottom: 2px solid #0f172a !important;
          }
          #printable-invoice .invoice-table th {
            background: #f1f5f9 !important;
            color: #0f172a !important;
            border-bottom: 2px solid #cbd5e1 !important;
          }
          #printable-invoice .invoice-table td {
            border-bottom: 1px solid #e2e8f0 !important;
          }
          #printable-invoice .invoice-highlight {
            color: #b45309 !important;
            font-weight: 800 !important;
          }
          #printable-invoice .invoice-badge {
            border: 1.5px solid #0f172a !important;
            color: #0f172a !important;
            background: #f8fafc !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      <main className="order-success-page" style={{ maxWidth: 940, margin: "32px auto 80px", padding: "0 20px", color: "var(--text-primary)" }}>
        {/* Screen Only Hero Card */}
        <div
          className="screen-only order-success-hero"
          style={{
            background: "#141922",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            padding: "32px 24px",
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(34, 197, 94, 0.15)",
              color: "#22c55e",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h1 style={{ fontSize: "1.9rem", color: "#fff", margin: "0 0 6px", fontWeight: 800 }}>
            Order Submitted Successfully
          </h1>

          {/* Canonical Order Reference & Status */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, flexWrap: "wrap", margin: "14px 0" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(242, 169, 40, 0.15)",
                border: "1.5px solid rgba(242, 169, 40, 0.4)",
                padding: "6px 16px",
                borderRadius: 999,
                color: "#f2a928",
                fontWeight: 800,
                fontSize: ".9rem",
              }}
            >
              Order Reference: #{orderId || "SCK-CONFIRMED"}
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(56, 189, 248, 0.15)",
                border: "1px solid rgba(56, 189, 248, 0.4)",
                padding: "6px 14px",
                borderRadius: 999,
                color: "#38bdf8",
                fontSize: ".82rem",
                fontWeight: 700,
              }}
            >
              <Clock size={15} /> VERIFICATION PENDING
            </div>
          </div>

          <p style={{ color: "#cbd5e1", fontSize: ".92rem", maxWidth: 640, margin: "14px auto 0", lineHeight: 1.6, fontWeight: 500 }}>
            Payment details submitted successfully. Your payment is currently being verified. We will confirm your order after verification.
          </p>

          {/* Actions Bar */}
          <div className="actions-bar" style={{ marginTop: 22, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <a
              href={whatsappUrl(whatsappConfirmationMsg)}
              target="_blank"
              rel="noreferrer"
              className="button primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#22c55e",
                color: "#000",
                fontWeight: 700,
                padding: "10px 18px",
                borderRadius: 10,
                textDecoration: "none",
                fontSize: ".86rem",
              }}
            >
              <MessageCircle size={17} /> Confirm Order on WhatsApp
            </a>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "linear-gradient(135deg, #f2a928 0%, #d97706 100%)",
                border: "none",
                color: "#000",
                fontWeight: 700,
                padding: "10px 20px",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: ".86rem",
                boxShadow: "0 4px 14px rgba(242, 169, 40, 0.3)",
              }}
            >
              <Printer size={17} /> Print / Save Official Invoice (PDF)
            </button>

            <Link
              href="/shop"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                fontWeight: 600,
                padding: "10px 16px",
                borderRadius: 10,
                textDecoration: "none",
                fontSize: ".86rem",
              }}
            >
              <ShoppingBag size={15} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* ── OFFICIAL PRINTABLE INVOICE DOCUMENT ── */}
        {order ? (
          <div
            id="printable-invoice"
            style={{
              background: "#111722",
              border: "1.5px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
              padding: "36px 36px 28px",
              marginBottom: 30,
              boxShadow: "0 12px 36px rgba(0,0,0,0.4)",
            }}
          >
            {/* 1. Header with Logo & Official Business Information */}
            <div className="invoice-header-box" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid rgba(255,255,255,0.12)", paddingBottom: 22, marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <img
                  src="/assets/brand/sialkot-cricket-kits-logo.png"
                  alt="Sialkot Cricket Kits"
                  style={{ width: 62, height: 62, objectFit: "contain", background: "#fff", padding: 4, borderRadius: 10 }}
                />
                <div>
                  <h2 className="invoice-brand-title" style={{ fontSize: "1.35rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".06em", color: "#f2a928", margin: "0 0 4px" }}>
                    {BUSINESS_CONFIG.businessName}
                  </h2>
                  <span style={{ fontSize: ".82rem", color: "#cbd5e1", display: "block", fontWeight: 600 }}>
                    {BUSINESS_CONFIG.factoryName} · Master Cricket Equipment Manufacturers
                  </span>
                  <span style={{ fontSize: ".76rem", color: "#94a3b8", display: "block", marginTop: 2 }}>
                    📍 {BUSINESS_CONFIG.fullAddress}
                  </span>
                  <div style={{ display: "flex", gap: 14, marginTop: 4, fontSize: ".74rem", color: "#94a3b8" }}>
                    <span>📱 WhatsApp: {BUSINESS_CONFIG.displayPhone}</span>
                    <span>✉️ {BUSINESS_CONFIG.primaryEmail}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fff", letterSpacing: ".05em" }}>
                  OFFICIAL INVOICE
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "#f2a928", fontFamily: "monospace", marginTop: 2 }}>
                  #{order.id}
                </div>
                <div style={{ fontSize: ".78rem", color: "#94a3b8", marginTop: 4 }}>
                  Issue Date: <strong>{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</strong>
                </div>
                <div className="invoice-badge" style={{ display: "inline-block", marginTop: 8, background: "rgba(245, 158, 11, 0.15)", border: "1px solid #f59e0b", color: "#fbbf24", padding: "4px 10px", borderRadius: 6, fontSize: ".74rem", fontWeight: 800, textTransform: "uppercase" }}>
                  Status: {order.paymentStatus === "payment_verified" ? "Payment Verified" : "Payment Under Verification"}
                </div>
              </div>
            </div>

            {/* 2. Three-Section Grid: Seller Details, Customer Destination, and Payment Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, background: "rgba(0,0,0,0.35)", padding: 18, borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", marginBottom: 26 }}>
              {/* Customer & Delivery Destination (Dynamic Customer Input) */}
              <div>
                <span style={{ color: "#94a3b8", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 800, display: "block", marginBottom: 6 }}>
                  CUSTOMER &amp; DELIVERY DESTINATION
                </span>
                <strong style={{ color: "#fff", fontSize: "1.05rem", display: "block", marginBottom: 4 }}>
                  {order.customerName}
                </strong>
                {order.customerPhone && (
                  <div style={{ color: "#cbd5e1", fontSize: ".82rem", display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span>📱</span> <span>{order.customerPhone}</span>
                  </div>
                )}
                {order.customerEmail && (
                  <div style={{ color: "#cbd5e1", fontSize: ".82rem", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span>✉️</span> <span>{order.customerEmail}</span>
                  </div>
                )}
                <div style={{ color: "#cbd5e1", fontSize: ".82rem", lineHeight: 1.4, marginTop: 4 }}>
                  <span>📍</span> {order.address ? `${order.address}, ` : ""}{order.city ? `${order.city}, ` : ""}{order.state ? `${order.state}, ` : ""}{order.postalCode ? `${order.postalCode}, ` : ""}{getCountryFlag(order.country)} {order.country}
                </div>
                {order.deliveryInstructions && (
                  <div style={{ color: "#94a3b8", fontSize: ".76rem", fontStyle: "italic", marginTop: 4 }}>
                    Note: {order.deliveryInstructions}
                  </div>
                )}
              </div>

              {/* Payment & Bank Beneficiary Summary */}
              <div>
                <span style={{ color: "#94a3b8", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 800, display: "block", marginBottom: 6 }}>
                  PAYMENT &amp; BENEFICIARY SUMMARY
                </span>
                <strong style={{ color: "#f2a928", fontSize: ".96rem", display: "block", marginBottom: 4 }}>
                  {order.paymentMethod}
                </strong>
                <div style={{ color: "#cbd5e1", fontSize: ".82rem", marginBottom: 2 }}>
                  Beneficiary Name: <strong style={{ color: "#fff" }}>{UBL_PAYMENT_CONFIG.beneficiaryFullName} ({UBL_PAYMENT_CONFIG.bankName})</strong>
                </div>
                <div style={{ color: "#cbd5e1", fontSize: ".82rem", marginBottom: 2 }}>
                  Account No: <code style={{ color: "#38bdf8", fontSize: ".84rem" }}>{UBL_PAYMENT_CONFIG.accountNumber}</code>
                </div>
                <div style={{ color: "#cbd5e1", fontSize: ".82rem", marginBottom: 2 }}>
                  IBAN: <code style={{ color: "#38bdf8", fontSize: ".82rem" }}>{UBL_PAYMENT_CONFIG.iban}</code>
                </div>
                {order.transferReference && (
                  <div style={{ color: "#38bdf8", fontSize: ".82rem", fontFamily: "monospace", marginTop: 4 }}>
                    Bank/Transfer Transaction Reference: <strong>{order.transferReference}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Itemized Equipment Table */}
            <table className="invoice-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: 22 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #334155", textAlign: "left", color: "#94a3b8", fontSize: ".78rem", textTransform: "uppercase", letterSpacing: ".05em" }}>
                  <th style={{ padding: "10px 8px" }}>#</th>
                  <th style={{ padding: "10px 8px" }}>Item Description &amp; Specifications</th>
                  <th style={{ padding: "10px 8px", textAlign: "center" }}>Qty</th>
                  <th style={{ padding: "10px 8px", textAlign: "right" }}>Unit Price</th>
                  <th style={{ padding: "10px 8px", textAlign: "right" }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: ".88rem", color: "#cbd5e1" }}>
                    <td style={{ padding: "12px 8px", color: "#94a3b8", fontSize: ".8rem" }}>{idx + 1}</td>
                    <td style={{ padding: "12px 8px", color: "#fff", fontWeight: 600 }}>
                      {it.name}
                      {it.category && (
                        <span style={{ display: "block", color: "#94a3b8", fontSize: ".74rem", fontWeight: 400 }}>
                          Category: {it.category}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 600 }}>{it.quantity}</td>
                    <td style={{ padding: "12px 8px", textAlign: "right" }}>{formatPrice(it.price)}</td>
                    <td style={{ padding: "12px 8px", textAlign: "right", color: "#f2a928", fontWeight: 700 }}>
                      {formatPrice(it.price * it.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ padding: "14px 8px 4px", textAlign: "right", fontSize: ".88rem", color: "#94a3b8" }}>
                    Subtotal:
                  </td>
                  <td style={{ padding: "14px 8px 4px", textAlign: "right", fontSize: ".95rem", color: "#fff", fontWeight: 700 }}>
                    {formatPrice(order.subtotal || order.totalAmount)}
                  </td>
                </tr>
                {order.shippingFee !== undefined && (
                  <tr>
                    <td colSpan={4} style={{ padding: "4px 8px", textAlign: "right", fontSize: ".88rem", color: "#94a3b8" }}>
                      Tracked Courier ({order.country}):
                    </td>
                    <td style={{ padding: "4px 8px", textAlign: "right", fontSize: ".95rem", color: "#fff", fontWeight: 700 }}>
                      {formatPrice(order.shippingFee)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={4} style={{ padding: "12px 8px 0", textAlign: "right", fontSize: "1.05rem", fontWeight: 800, color: "#fff" }}>
                    Total Order Value:
                  </td>
                  <td className="invoice-highlight" style={{ padding: "12px 8px 0", textAlign: "right", fontSize: "1.3rem", fontWeight: 900, color: "#f2a928" }}>
                    {formatPrice(order.totalAmount)}
                  </td>
                </tr>

                {order.depositPercent && order.depositPercent < 100 && (
                  <>
                    <tr>
                      <td colSpan={4} style={{ padding: "6px 8px 0", textAlign: "right", fontSize: ".85rem", color: "#4ade80", fontWeight: 700 }}>
                        Advance Deposit ({order.depositPercent}%):
                      </td>
                      <td style={{ padding: "6px 8px 0", textAlign: "right", fontSize: ".95rem", color: "#4ade80", fontWeight: 800 }}>
                        {formatPrice(order.depositAmount || 0)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} style={{ padding: "4px 8px 0", textAlign: "right", fontSize: ".85rem", color: "#f87171", fontWeight: 700 }}>
                        Remaining Balance (Due Before Dispatch):
                      </td>
                      <td style={{ padding: "4px 8px 0", textAlign: "right", fontSize: ".95rem", color: "#f87171", fontWeight: 800 }}>
                        {formatPrice(order.balanceRemaining || 0)}
                      </td>
                    </tr>
                  </>
                )}
              </tfoot>
            </table>

            {/* 4. Notes & Official Seller Information Box */}
            {order.notes && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px 14px", borderRadius: 8, fontSize: ".8rem", color: "#cbd5e1", marginBottom: 20, whiteSpace: "pre-line" }}>
                <strong style={{ color: "#f2a928", display: "block", marginBottom: 3 }}>Order &amp; Evidence Notes:</strong>
                {order.notes}
              </div>
            )}

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, fontSize: ".76rem", color: "#94a3b8" }}>
              <div>
                <span>🛡️ Official Order Receipt · <strong>{BUSINESS_CONFIG.businessName}</strong></span>
                <span style={{ display: "block" }}>For ping videos &amp; dispatch tracking, WhatsApp: <strong>{BUSINESS_CONFIG.displayPhone}</strong> · Email: <strong>{BUSINESS_CONFIG.primaryEmail}</strong></span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span>Seller: {BUSINESS_CONFIG.fullAddress}</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#fff" }}>
            {loading ? "Loading invoice..." : "Order details not found."}
          </div>
        )}
      </main>
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: "60px 20px", textAlign: "center", color: "#fff" }}>Loading invoice...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
