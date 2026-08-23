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
} from "lucide-react";
import { formatPrice } from "@/src/data/products";
import { whatsappUrl } from "@/src/lib/whatsapp";
import type { DBOrder } from "@/src/lib/data-service";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

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
    ? `Hello Sialkot Cricket Kits,\n\nI have placed an order directly on your website:\nOrder ID: #${order.id}\nCustomer: ${order.customerName}\nTotal: ${formatPrice(order.totalAmount)}\nPayment Method: ${order.paymentMethod}\n\nPlease confirm my order and share the live bat ping demonstration video. Thank you!`
    : "Hello Sialkot Cricket Kits, I just completed my order online. Please confirm my order details.";

  return (
    <main className="order-success-page" style={{ maxWidth: 850, margin: "40px auto 80px", padding: "0 24px" }}>
      {/* Top Banner */}
      <div style={{
        background: "var(--card-bg, #181c24)",
        border: "1px solid var(--border-color, #2a313d)",
        borderRadius: 16,
        padding: "36px 32px",
        textAlign: "center",
        marginBottom: 24,
      }}>
        <div style={{
          width: 68,
          height: 68,
          borderRadius: "50%",
          background: "rgba(34, 197, 94, 0.15)",
          color: "#22c55e",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}>
          <CheckCircle2 size={38} />
        </div>

        <h1 style={{ fontSize: "2rem", color: "#fff", margin: "0 0 8px" }}>Order Confirmed!</h1>
        <p style={{ color: "#cbd5e1", fontSize: "0.95rem", maxWidth: 540, margin: "0 auto 16px" }}>
          Thank you for choosing <strong>Sialkot Cricket Kits</strong>. Your order has been placed and received by our master craftsmen in Sialkot.
        </p>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "6px 16px", borderRadius: 20, color: "var(--accent, #f59e0b)", fontWeight: 700, fontSize: "0.95rem" }}>
          Order ID: #{orderId || "SCK-CONFIRMED"}
        </div>
      </div>

      {/* Invoice Details Card */}
      {order && (
        <div className="printable-invoice" style={{
          background: "var(--card-bg, #181c24)",
          border: "1px solid var(--border-color, #2a313d)",
          borderRadius: 16,
          padding: "28px 32px",
          marginBottom: 24,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color, #2a313d)", paddingBottom: 16, marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: "1.3rem", color: "#fff", margin: "0 0 4px" }}>Official Order Invoice</h2>
              <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                Date: {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <button
              onClick={handlePrint}
              className="button secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: "0.85rem" }}
            >
              <Printer size={16} /> Print / Save PDF Receipt
            </button>
          </div>

          {/* Customer & Payment Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24, background: "rgba(0,0,0,0.25)", padding: 16, borderRadius: 10 }}>
            <div>
              <span style={{ color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 2 }}>Customer Details</span>
              <strong style={{ color: "#fff", fontSize: "0.9rem", display: "block" }}>{order.customerName}</strong>
              {order.customerEmail && <span style={{ color: "#cbd5e1", fontSize: "0.82rem", display: "block" }}>{order.customerEmail}</span>}
              {order.customerPhone && <span style={{ color: "#cbd5e1", fontSize: "0.82rem", display: "block" }}>{order.customerPhone}</span>}
            </div>

            <div>
              <span style={{ color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 2 }}>Payment & Destination</span>
              <strong style={{ color: "var(--accent, #f59e0b)", fontSize: "0.9rem", display: "block" }}>{order.paymentMethod}</strong>
              <span style={{ color: "#cbd5e1", fontSize: "0.82rem", display: "block" }}>Destination: {order.country}</span>
              <span style={{ color: "#4ade80", fontSize: "0.82rem", display: "block", fontWeight: 600 }}>Status: Order Placed ({order.status})</span>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155", textAlign: "left", color: "#94a3b8", fontSize: "0.8rem" }}>
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
                  <td style={{ padding: "12px 0", textAlign: "right", color: "#fff", fontWeight: 600 }}>
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ padding: "16px 0 0", textAlign: "right", fontSize: "1rem", fontWeight: 600, color: "#fff" }}>
                  Grand Total:
                </td>
                <td style={{ padding: "16px 0 0", textAlign: "right", fontSize: "1.3rem", fontWeight: 700, color: "var(--accent, #f59e0b)" }}>
                  {formatPrice(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>

          {order.notes && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #334155", padding: "12px 16px", borderRadius: 8, fontSize: "0.82rem", color: "#94a3b8", whiteSpace: "pre-line" }}>
              {order.notes}
            </div>
          )}
        </div>
      )}

      {/* Next Steps Card */}
      <div style={{
        background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(30, 41, 59, 0.6) 100%)",
        border: "1px solid rgba(245, 158, 11, 0.25)",
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
          <h3 style={{ fontSize: "1.1rem", color: "#fff", margin: "0 0 6px" }}>Receive Live Bat Ping Video on WhatsApp</h3>
          <p style={{ color: "#cbd5e1", fontSize: "0.85rem", margin: 0, maxWidth: 500 }}>
            Connect with our team to verify your order number and receive a personalized preparation and ping video before international courier dispatch.
          </p>
        </div>

        <a
          href={whatsappUrl(whatsappConfirmationMsg)}
          target="_blank"
          rel="noreferrer"
          className="button whatsapp"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 8, whiteSpace: "nowrap" }}
        >
          <MessageCircle size={18} /> Connect on WhatsApp
        </a>
      </div>

      <div style={{ textAlign: "center" }}>
        <Link href="/shop" className="button primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <ShoppingBag size={18} /> Continue Shopping <ArrowRight size={16} />
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
