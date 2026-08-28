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
} from "lucide-react";
import { useStore } from "@/src/components/StoreProvider";
import { whatsappUrl, generateOrderConfirmationWhatsAppMessage } from "@/src/lib/whatsapp";
import { UBL_PAYMENT_CONFIG, FACTORY_INFO } from "@/src/lib/payment-config";
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
    ? `Hello Sialkot Cricket Kits,\n\nI have submitted my order #${order.id}.\nTransfer Reference: ${order.transferReference || "Attached on site"}\nTotal: £${order.totalAmount}\nCustomer: ${order.customerName}\n\nPlease confirm when payment is verified. Thank you!`
    : "Hello Sialkot Cricket Kits, I just submitted my order and payment evidence. Please check my transfer.";

  return (
    <main className="order-success-page" style={{ maxWidth: 880, margin: "40px auto 80px", padding: "0 24px", color: "var(--text-primary)" }}>
      {/* Top Hero Banner */}
      <div
        style={{
          background: "#141922",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 16,
          padding: "36px 32px",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(34, 197, 94, 0.15)",
            color: "#22c55e",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <CheckCircle2 size={42} />
        </div>

        <h1 style={{ fontSize: "2.1rem", color: "#fff", margin: "0 0 8px", fontWeight: 800 }}>
          Order Submitted Successfully
        </h1>

        {/* Status Badge */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, flexWrap: "wrap", margin: "16px 0" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(242, 169, 40, 0.15)",
              border: "1.5px solid rgba(242, 169, 40, 0.4)",
              padding: "8px 18px",
              borderRadius: 999,
              color: "#f2a928",
              fontWeight: 800,
              fontSize: ".95rem",
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
              padding: "8px 16px",
              borderRadius: 999,
              color: "#38bdf8",
              fontSize: ".85rem",
              fontWeight: 700,
            }}
          >
            <Clock size={16} /> PAYMENT UNDER VERIFICATION
          </div>
        </div>

        {/* Official Expected Review Message */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 12,
            padding: "16px 20px",
            maxWidth: 680,
            margin: "18px auto 0",
            fontSize: ".92rem",
            color: "#cbd5e1",
            lineHeight: 1.6,
          }}
        >
          Thank you. Your order and payment evidence have been received successfully. Our team will verify the transfer against the UBL account (<strong>ALYAN WAZIR</strong>). We will notify you after verification. Please keep your order reference for future communication.
        </div>

        {/* Actions Bar */}
        <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
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
              padding: "10px 20px",
              borderRadius: 10,
              textDecoration: "none",
              fontSize: ".88rem",
            }}
          >
            <MessageCircle size={18} /> Confirm Order on WhatsApp
          </a>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#1e293b",
              border: "1px solid #334155",
              color: "#fff",
              fontWeight: 600,
              padding: "10px 18px",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: ".88rem",
            }}
          >
            <Printer size={16} /> Print / Save Invoice
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
              fontSize: ".88rem",
            }}
          >
            <ShoppingBag size={16} /> Continue Shopping
          </Link>
        </div>
      </div>

      {/* Invoice & Order Breakdown */}
      {order && (
        <div
          id="printable-invoice"
          style={{
            background: "#141922",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            padding: 32,
            marginBottom: 24,
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, borderBottom: "1px solid #2d3748", paddingBottom: 20, flexWrap: "wrap", gap: 16 }}>
            <div>
              <strong style={{ fontSize: "1.2rem", color: "#fff", display: "block" }}>{FACTORY_INFO.factoryName}</strong>
              <span style={{ color: "var(--text-muted)", fontSize: ".82rem", display: "block" }}>Sialkot Cricket Kits · Handcrafted Cricket Equipment</span>
              <span style={{ color: "var(--text-muted)", fontSize: ".78rem", display: "block" }}>{FACTORY_INFO.fullAddress}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <strong style={{ color: "var(--primary)", fontSize: "1rem", display: "block" }}>INVOICE #{order.id}</strong>
              <span style={{ color: "var(--text-muted)", fontSize: ".82rem", display: "block" }}>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Customer & Payment Info Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, background: "rgba(0,0,0,0.3)", padding: 18, borderRadius: 10, marginBottom: 24 }}>
            <div>
              <span style={{ color: "#94a3b8", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 4 }}>
                Customer &amp; Delivery Destination
              </span>
              <strong style={{ color: "#fff", fontSize: ".95rem", display: "block" }}>{order.customerName}</strong>
              {order.customerPhone && <span style={{ color: "#cbd5e1", fontSize: ".82rem", display: "block" }}>📱 {order.customerPhone}</span>}
              {order.customerEmail && <span style={{ color: "#cbd5e1", fontSize: ".82rem", display: "block" }}>✉️ {order.customerEmail}</span>}
              <span style={{ color: "#cbd5e1", fontSize: ".82rem", display: "block", marginTop: 4 }}>
                📍 {order.address ? `${order.address}, ` : ""}{order.city ? `${order.city}, ` : ""}{order.country}
              </span>
            </div>

            <div>
              <span style={{ color: "#94a3b8", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 4 }}>
                Payment Submission Details
              </span>
              <strong style={{ color: "var(--primary)", fontSize: ".95rem", display: "block" }}>{order.paymentMethod}</strong>
              <span style={{ color: "#cbd5e1", fontSize: ".82rem", display: "block" }}>
                Beneficiary: <strong>{UBL_PAYMENT_CONFIG.beneficiaryFullName} (UBL)</strong>
              </span>
              {order.transferReference && (
                <span style={{ color: "#38bdf8", fontSize: ".82rem", display: "block", fontFamily: "monospace", marginTop: 2 }}>
                  Transfer Ref: {order.transferReference}
                </span>
              )}
              <span style={{ color: "#fbbf24", fontSize: ".82rem", display: "block", fontWeight: 700, marginTop: 4 }}>
                Status: Payment Under Verification
              </span>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155", textAlign: "left", color: "#94a3b8", fontSize: ".78rem", textTransform: "uppercase" }}>
                <th style={{ padding: "8px 0" }}>Item Description</th>
                <th style={{ padding: "8px 0", textAlign: "center" }}>Qty</th>
                <th style={{ padding: "8px 0", textAlign: "right" }}>Price</th>
                <th style={{ padding: "8px 0", textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: ".88rem", color: "#cbd5e1" }}>
                  <td style={{ padding: "12px 0", color: "#fff", fontWeight: 500 }}>{it.name}</td>
                  <td style={{ padding: "12px 0", textAlign: "center" }}>{it.quantity}</td>
                  <td style={{ padding: "12px 0", textAlign: "right" }}>{formatPrice(it.price)}</td>
                  <td style={{ padding: "12px 0", textAlign: "right", color: "var(--primary)", fontWeight: 600 }}>
                    {formatPrice(it.price * it.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ padding: "14px 0 4px", textAlign: "right", fontSize: ".9rem", color: "var(--text-muted)" }}>
                  Subtotal:
                </td>
                <td style={{ padding: "14px 0 4px", textAlign: "right", fontSize: ".95rem", color: "#fff", fontWeight: 600 }}>
                  {formatPrice(order.subtotal || order.totalAmount)}
                </td>
              </tr>
              {order.shippingFee !== undefined && (
                <tr>
                  <td colSpan={3} style={{ padding: "4px 0", textAlign: "right", fontSize: ".9rem", color: "var(--text-muted)" }}>
                    Tracked Courier ({order.country}):
                  </td>
                  <td style={{ padding: "4px 0", textAlign: "right", fontSize: ".95rem", color: "#fff", fontWeight: 600 }}>
                    {formatPrice(order.shippingFee)}
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan={3} style={{ padding: "12px 0 0", textAlign: "right", fontSize: "1.05rem", fontWeight: 700, color: "#fff" }}>
                  Total Order Value:
                </td>
                <td style={{ padding: "12px 0 0", textAlign: "right", fontSize: "1.35rem", fontWeight: 800, color: "var(--primary)" }}>
                  {formatPrice(order.totalAmount)}
                </td>
              </tr>
              {order.depositPercent && order.depositPercent < 100 && (
                <>
                  <tr>
                    <td colSpan={3} style={{ padding: "6px 0 0", textAlign: "right", fontSize: ".86rem", color: "#4ade80", fontWeight: 600 }}>
                      Advance Deposit Submitted ({order.depositPercent}%):
                    </td>
                    <td style={{ padding: "6px 0 0", textAlign: "right", fontSize: ".95rem", color: "#4ade80", fontWeight: 700 }}>
                      {formatPrice(order.depositAmount || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} style={{ padding: "4px 0 0", textAlign: "right", fontSize: ".86rem", color: "#f87171", fontWeight: 600 }}>
                      Remaining Balance (Due Before Dispatch):
                    </td>
                    <td style={{ padding: "4px 0 0", textAlign: "right", fontSize: ".95rem", color: "#f87171", fontWeight: 700 }}>
                      {formatPrice(order.balanceRemaining || 0)}
                    </td>
                  </tr>
                </>
              )}
            </tfoot>
          </table>

          {order.notes && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #334155", padding: "12px 16px", borderRadius: 8, fontSize: ".82rem", color: "#cbd5e1", whiteSpace: "pre-line" }}>
              <strong style={{ color: "var(--primary)", display: "block", marginBottom: 4 }}>Order &amp; Evidence Notes:</strong>
              {order.notes}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: "60px 20px", textAlign: "center", color: "#fff" }}>Loading invoice details...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
