"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Printer,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Building2,
  Send,
  Wallet,
  Globe,
  Lock,
  Mail,
  Video,
  Truck,
} from "lucide-react";
import { formatPrice } from "@/src/data/products";
import { whatsappUrl, generateOrderConfirmationWhatsAppMessage } from "@/src/lib/whatsapp";
import type { DBOrder } from "@/src/lib/data-service";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const tracker = searchParams.get("tracker");

  const [order, setOrder] = useState<DBOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId && !tracker) {
      setLoading(false);
      return;
    }

    const queryParams = new URLSearchParams();
    if (orderId) queryParams.set("orderId", orderId);
    if (tracker) queryParams.set("tracker", tracker);

    fetch(`/api/checkout/verify?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setOrder(json.data);
        } else if (orderId) {
          // Fallback to standard order endpoint
          return fetch(`/api/checkout/order/${encodeURIComponent(orderId)}`)
            .then((r) => r.json())
            .then((j) => {
              if (j.success && j.data) setOrder(j.data);
            });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId, tracker]);

  const handlePrint = () => {
    window.print();
  };

  const whatsappConfirmationMsg = order
    ? generateOrderConfirmationWhatsAppMessage(order)
    : "Hello Sialkot Cricket Kits, I just completed my order online. Please confirm my order details.";

  return (
    <main className="order-success-page" style={{ maxWidth: 880, margin: "40px auto 80px", padding: "0 24px" }}>
      {/* Top Banner */}
      <div style={{
        background: "#141922",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 16,
        padding: "36px 32px",
        textAlign: "center",
        marginBottom: 24,
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
          marginBottom: 16,
        }}>
          <CheckCircle2 size={42} />
        </div>

        <h1 style={{ fontSize: "2.2rem", color: "#fff", margin: "0 0 8px", fontWeight: 800 }}>Order Received &amp; Confirmed!</h1>
        <p style={{ color: "#cbd5e1", fontSize: "0.98rem", maxWidth: 580, margin: "0 auto 16px", lineHeight: 1.5 }}>
          Thank you for choosing <strong>Sialkot Cricket Kits</strong>. Your order specifications have been dispatched directly to our master craftsmen in Sialkot, Pakistan.
        </p>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, flexWrap: "wrap", margin: "16px 0" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(242, 169, 40, 0.14)", border: "1.5px solid rgba(242, 169, 40, 0.4)", padding: "8px 20px", borderRadius: 999, color: "#f2a928", fontWeight: 800, fontSize: "1rem" }}>
            Order ID: #{orderId || "SCK-CONFIRMED"}
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.3)", padding: "8px 16px", borderRadius: 999, color: "#4ade80", fontSize: "0.85rem", fontWeight: 600 }}>
            <Mail size={15} /> Confirmation Email Dispatched
          </div>
        </div>

        {/* Instant WhatsApp Action Hero Card */}
        <div style={{ marginTop: 20, background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.25)", borderRadius: 12, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", textAlign: "left" }}>
          <div>
            <strong style={{ color: "#4ade80", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 6 }}>
              <MessageCircle size={16} /> Instant WhatsApp Order Receipt &amp; Live Ping Video
            </strong>
            <span style={{ color: "#cbd5e1", fontSize: "0.82rem", display: "block", marginTop: 2 }}>
              Click below to send your order receipt to our WhatsApp support and lock your live video testing demo.
            </span>
          </div>
          <a
            href={whatsappUrl(whatsappConfirmationMsg)}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#22c55e",
              color: "#ffffff",
              padding: "12px 22px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: "0.9rem",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            <MessageCircle size={18} /> Open WhatsApp Confirmation
          </a>
        </div>
      </div>

      {/* Invoice Details Card */}
      {order && (
        <div className="printable-invoice" style={{
          background: "#141922",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 16,
          padding: "28px 32px",
          marginBottom: 24,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: 16, marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: "1.3rem", color: "#fff", margin: "0 0 4px", fontWeight: 700 }}>Official Order Invoice</h2>
              <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                Date: {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <button
              onClick={handlePrint}
              className="button secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: "0.85rem", background: "#181f2b", border: "1px solid #2d3748", color: "#fff", borderRadius: 8, cursor: "pointer" }}
            >
              <Printer size={16} /> Print / Save PDF Receipt
            </button>
          </div>

          {/* Customer & Payment Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24, background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 10 }}>
            <div>
              <span style={{ color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 2 }}>Customer Details</span>
              <strong style={{ color: "#fff", fontSize: "0.95rem", display: "block" }}>{order.customerName}</strong>
              {order.customerEmail && <span style={{ color: "#cbd5e1", fontSize: "0.82rem", display: "block" }}>{order.customerEmail}</span>}
              {order.customerPhone && <span style={{ color: "#cbd5e1", fontSize: "0.82rem", display: "block" }}>{order.customerPhone}</span>}
            </div>

            <div>
              <span style={{ color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 2 }}>Payment &amp; Destination</span>
              <strong style={{ color: "#f2a928", fontSize: "0.95rem", display: "block" }}>{order.paymentMethod}</strong>
              <span style={{ color: "#cbd5e1", fontSize: "0.82rem", display: "block" }}>Destination: {order.country}</span>
              <span
                style={{
                  color:
                    order.status === "deposit_paid" || order.status === "paid"
                      ? "#4ade80"
                      : "#f59e0b",
                  fontSize: "0.84rem",
                  display: "block",
                  fontWeight: 700,
                  marginTop: 4,
                }}
              >
                {order.status === "deposit_paid"
                  ? `✅ ${order.depositPercent || 50}% Advance Deposit Paid (${formatPrice(order.amountPaid || order.depositAmount || 0)}) · Balance (${formatPrice(order.balanceRemaining || 0)}) Due Before Dispatch`
                  : order.status === "paid"
                  ? `✅ Fully Paid (${formatPrice(order.totalAmount)})`
                  : `Status: ${order.status.replace(/_/g, " ").toUpperCase()}`}
              </span>
              {order.transactionRef && (
                <small style={{ color: "#94a3b8", fontSize: "0.74rem", display: "block", marginTop: 2 }}>
                  Gateway Ref: {order.transactionRef}
                </small>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155", textAlign: "left", color: "#94a3b8", fontSize: "0.8rem", textTransform: "uppercase" }}>
                <th style={{ padding: "8px 0" }}>Item Description</th>
                <th style={{ padding: "8px 0", textAlign: "center" }}>Qty</th>
                <th style={{ padding: "8px 0", textAlign: "right" }}>Price</th>
                <th style={{ padding: "8px 0", textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.88rem", color: "#cbd5e1" }}>
                  <td style={{ padding: "12px 0", color: "#fff", fontWeight: 500 }}>{item.name}</td>
                  <td style={{ padding: "12px 0", textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ padding: "12px 0", textAlign: "right" }}>{formatPrice(item.price)}</td>
                  <td style={{ padding: "12px 0", textAlign: "right", color: "#f2a928", fontWeight: 600 }}>
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ padding: "16px 0 0", textAlign: "right", fontSize: "1rem", fontWeight: 600, color: "#fff" }}>
                  Total Order Value:
                </td>
                <td style={{ padding: "16px 0 0", textAlign: "right", fontSize: "1.35rem", fontWeight: 800, color: "#f2a928" }}>
                  {formatPrice(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>

          {order.notes && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #334155", padding: "12px 16px", borderRadius: 8, fontSize: "0.82rem", color: "#cbd5e1", whiteSpace: "pre-line" }}>
              <strong style={{ color: "#f2a928", display: "block", marginBottom: 4 }}>Order Details &amp; Confirmation Plan:</strong>
              {order.notes}
            </div>
          )}
        </div>
      )}

      {/* Next Steps Card */}
      <div style={{
        background: "linear-gradient(135deg, rgba(242, 169, 40, 0.08) 0%, rgba(20, 25, 34, 0.8) 100%)",
        border: "1px solid rgba(242, 169, 40, 0.25)",
        borderRadius: 16,
        padding: "24px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
        marginBottom: 24,
      }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", color: "#fff", margin: "0 0 6px", fontWeight: 700 }}>Personalized Live Bat Ping Demo Video</h3>
          <p style={{ color: "#cbd5e1", fontSize: "0.85rem", margin: 0, maxWidth: 520, lineHeight: 1.5 }}>
            Our team will prepare your custom bat and send an HD ball ping demonstration video on WhatsApp before final tracked express courier dispatch.
          </p>
        </div>

        <a
          href={whatsappUrl(whatsappConfirmationMsg)}
          target="_blank"
          rel="noreferrer"
          className="button whatsapp"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 8, whiteSpace: "nowrap", background: "#22c55e", color: "#fff", fontWeight: 700, textDecoration: "none" }}
        >
          <MessageCircle size={18} /> Connect on WhatsApp
        </a>
      </div>

      <div style={{ textAlign: "center" }}>
        <Link href="/shop" className="button primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #f2a928 0%, #d97706 100%)", color: "#000", padding: "12px 24px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
          <ShoppingBag size={18} /> Continue Browsing Catalogue <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>Loading order confirmation...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
