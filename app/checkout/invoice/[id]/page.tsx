"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Printer,
  Download,
  MessageCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Check,
  Copy,
  MapPin,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { useStore } from "@/src/components/StoreProvider";
import { whatsappUrl } from "@/src/lib/whatsapp";
import { UBL_PAYMENT_CONFIG } from "@/src/lib/payment-config";
import { BUSINESS_CONFIG } from "@/src/lib/business-config";
import { getCountryFlag } from "@/src/lib/shipping";
import type { DBOrder } from "@/src/lib/data-service";

export default function StandaloneInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const { formatPrice } = useStore();

  const [order, setOrder] = useState<DBOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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
    try {
      window.print();
    } catch {
      handleDownloadOffline();
    }
  };

  const handleCopy = (key: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleDownloadOffline = () => {
    if (!order) return;
    setIsDownloading(true);

    try {
      const itemsHtml = order.items
        .map(
          (it, idx) => `
        <tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">${idx + 1}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 600; color: #0f172a;">
            ${it.name}
            ${it.category ? `<div style="font-size: 12px; color: #64748b; font-weight: 400; margin-top: 2px;">Category: ${it.category}</div>` : ""}
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 14px; font-weight: 700; color: #0f172a;">${it.quantity}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 14px; color: #334155;">£${it.price}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 14px; font-weight: 700; color: #b45309;">£${it.price * it.quantity}</td>
        </tr>
      `
        )
        .join("");

      const invoiceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Invoice #${order.id} — Sialkot Cricket Kits</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; padding: 20px 12px; }
    .invoice-card { max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 28px 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
    .brand h1 { font-size: 20px; color: #b45309; font-weight: 800; text-transform: uppercase; }
    .brand p { font-size: 12px; color: #475569; margin-top: 3px; line-height: 1.4; }
    .meta { text-align: right; }
    .meta h2 { font-size: 20px; font-weight: 900; color: #0f172a; }
    .meta .ref { font-size: 16px; font-weight: 800; color: #b45309; font-family: monospace; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px; }
    @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } .meta { text-align: left; } }
    .section-title { font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748b; margin-bottom: 6px; letter-spacing: 0.05em; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { text-align: left; padding: 8px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 12px; text-transform: uppercase; color: #475569; font-weight: 700; }
    .totals { margin-top: 10px; border-top: 2px solid #0f172a; padding-top: 10px; }
    .tot-row { display: flex; justify-content: space-between; font-size: 13px; color: #475569; margin-bottom: 4px; }
    .tot-row.grand { font-size: 18px; font-weight: 900; color: #b45309; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1; }
    .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
    .print-btn { display: inline-flex; align-items: center; gap: 6px; background: #b45309; color: #ffffff; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; margin-bottom: 16px; }
    @media print { .print-btn { display: none; } body { padding: 0; background: #ffffff; } .invoice-card { border: none; box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div style="max-width: 800px; margin: 0 auto; text-align: right;">
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  <div class="invoice-card">
    <div class="header">
      <div class="brand">
        <h1>${BUSINESS_CONFIG.businessName}</h1>
        <p>${BUSINESS_CONFIG.factoryName} · Master Cricket Batmakers</p>
        <p>📍 ${BUSINESS_CONFIG.fullAddress}</p>
        <p>📱 WhatsApp: ${BUSINESS_CONFIG.displayPhone} | ✉️ ${BUSINESS_CONFIG.primaryEmail}</p>
      </div>
      <div class="meta">
        <h2>OFFICIAL INVOICE</h2>
        <div class="ref">#${order.id}</div>
        <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Issue Date: ${new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
        <p style="font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 2px;">Status: ${order.paymentStatus === "payment_verified" ? "Payment Verified" : "Payment Under Verification"}</p>
      </div>
    </div>

    <div class="grid">
      <div>
        <div class="section-title">Customer & Delivery Destination</div>
        <div style="font-weight: 800; font-size: 15px; color: #0f172a;">${order.customerName}</div>
        ${order.customerPhone ? `<div style="font-size: 13px; color: #334155; margin-top: 2px;">📱 ${order.customerPhone}</div>` : ""}
        ${order.customerEmail ? `<div style="font-size: 13px; color: #334155; margin-top: 2px;">✉️ ${order.customerEmail}</div>` : ""}
        <div style="font-size: 13px; color: #334155; margin-top: 4px; line-height: 1.4;">📍 ${order.address || ""}, ${order.city || ""}, ${order.state || ""}, ${order.postalCode || ""}, ${order.country}</div>
      </div>
      <div>
        <div class="section-title">Payment & Beneficiary Summary</div>
        <div style="font-weight: 800; font-size: 14px; color: #b45309;">${order.paymentMethod}</div>
        <div style="font-size: 13px; color: #334155; margin-top: 4px;"><strong>Bank:</strong> ${UBL_PAYMENT_CONFIG.bankName}</div>
        <div style="font-size: 13px; color: #334155;"><strong>Title:</strong> ${UBL_PAYMENT_CONFIG.beneficiaryFullName}</div>
        <div style="font-size: 13px; color: #334155;"><strong>Account:</strong> ${UBL_PAYMENT_CONFIG.accountNumber}</div>
        <div style="font-size: 13px; color: #334155;"><strong>IBAN:</strong> ${UBL_PAYMENT_CONFIG.iban}</div>
        ${order.transferReference ? `<div style="font-size: 13px; color: #b45309; margin-top: 2px;"><strong>Transaction Ref:</strong> ${order.transferReference}</div>` : ""}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 6%;">#</th>
          <th style="width: 50%;">Item Description</th>
          <th style="width: 12%; text-align: center;">Qty</th>
          <th style="width: 16%; text-align: right;">Price</th>
          <th style="width: 16%; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals">
      <div class="tot-row">
        <span>Subtotal:</span>
        <strong style="color: #0f172a;">£${order.subtotal || order.totalAmount}</strong>
      </div>
      ${order.shippingFee !== undefined ? `
      <div class="tot-row">
        <span>Tracked Courier (${order.country}):</span>
        <strong style="color: #0f172a;">£${order.shippingFee}</strong>
      </div>` : ""}
      <div class="tot-row grand">
        <span>Total Order Value:</span>
        <span>£${order.totalAmount}</span>
      </div>
      ${order.depositPercent && order.depositPercent < 100 ? `
      <div class="tot-row" style="color: #16a34a; font-weight: 700; margin-top: 6px;">
        <span>Advance Deposit (${order.depositPercent}%):</span>
        <span>£${order.depositAmount || 0}</span>
      </div>
      <div class="tot-row" style="color: #dc2626; font-weight: 700;">
        <span>Remaining Balance (Due Before Dispatch):</span>
        <span>£${order.balanceRemaining || 0}</span>
      </div>` : ""}
    </div>

    <div class="footer">
      <span>🛡️ Official Factory Dispatch Invoice · ${BUSINESS_CONFIG.businessName}</span>
      <span>WhatsApp: ${BUSINESS_CONFIG.displayPhone}</span>
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob([invoiceHtml], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Sialkot-Cricket-Kits-Invoice-${order.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download invoice:", e);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0f17", color: "#ffffff", padding: 20 }}>
        <div>Loading official invoice...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0f17", color: "#ffffff", padding: 20, textAlign: "center" }}>
        <div>
          <h2>Invoice Not Found</h2>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>Order reference #{orderId} could not be located.</p>
          <Link href="/shop" style={{ display: "inline-block", marginTop: 16, background: "#f2a928", color: "#000", padding: "8px 16px", borderRadius: 8, fontWeight: 700 }}>
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="standalone-invoice-page" style={{ minHeight: "100vh", background: "#080c14", color: "#0f172a", padding: "16px 12px 60px" }}>
      {/* ── TOP FLOATING SCREEN TOOLBAR (Hidden in Print) ── */}
      <div
        className="invoice-screen-bar"
        style={{
          maxWidth: 820,
          margin: "0 auto 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
          background: "#111724",
          border: "1px solid rgba(255,255,255,0.12)",
          padding: "10px 14px",
          borderRadius: 12,
          boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
        }}
      >
        <Link
          href={`/checkout/success?orderId=${encodeURIComponent(order.id)}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#94a3b8",
            fontSize: ".82rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} /> Back to Order
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "linear-gradient(135deg, #f2a928 0%, #d97706 100%)",
              color: "#000000",
              border: "none",
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: ".82rem",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(242,169,40,0.3)",
            }}
          >
            <Printer size={15} /> Print / Save PDF
          </button>

          <button
            type="button"
            onClick={handleDownloadOffline}
            disabled={isDownloading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.08)",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: ".82rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Download size={15} /> Save Invoice File
          </button>

          <a
            href={whatsappUrl(`Hello Sialkot Cricket Kits, regarding my invoice for order #${order.id}:`)}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#22c55e",
              color: "#000000",
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: ".82rem",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <MessageCircle size={15} /> WhatsApp
          </a>
        </div>
      </div>

      {/* ── CLEAN PURE A4 INVOICE SHEET ── */}
      <div
        id="clean-invoice-sheet"
        style={{
          maxWidth: 820,
          margin: "0 auto",
          background: "#ffffff",
          color: "#0f172a",
          borderRadius: 12,
          padding: "32px 28px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "2px solid #0f172a",
            paddingBottom: 18,
            marginBottom: 20,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <img
              src="/assets/brand/sialkot-cricket-kits-logo.png"
              alt="Sialkot Cricket Kits"
              style={{ width: 54, height: 54, objectFit: "contain", background: "#f8fafc", padding: 4, borderRadius: 8, border: "1px solid #cbd5e1" }}
            />
            <div>
              <h1 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#b45309", textTransform: "uppercase", margin: 0, lineHeight: 1.2 }}>
                {BUSINESS_CONFIG.businessName}
              </h1>
              <span style={{ fontSize: ".8rem", color: "#334155", fontWeight: 600, display: "block", marginTop: 2 }}>
                {BUSINESS_CONFIG.factoryName} · Master Cricket Equipment Manufacturers
              </span>
              <span style={{ fontSize: ".76rem", color: "#64748b", display: "block", marginTop: 2 }}>
                📍 {BUSINESS_CONFIG.fullAddress}
              </span>
              <div style={{ display: "flex", gap: 12, fontSize: ".76rem", color: "#64748b", marginTop: 4, flexWrap: "wrap" }}>
                <span>📱 {BUSINESS_CONFIG.displayPhone}</span>
                <span>✉️ {BUSINESS_CONFIG.primaryEmail}</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#0f172a", letterSpacing: ".04em" }}>
              OFFICIAL INVOICE
            </div>
            <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#b45309", fontFamily: "monospace", marginTop: 2 }}>
              #{order.id}
            </div>
            <div style={{ fontSize: ".78rem", color: "#64748b", marginTop: 3 }}>
              Issue Date: <strong>{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</strong>
            </div>
            <div
              style={{
                display: "inline-block",
                marginTop: 6,
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: ".74rem",
                fontWeight: 800,
                textTransform: "uppercase",
                background: order.paymentStatus === "payment_verified" ? "rgba(34, 197, 94, 0.15)" : "#fef3c7",
                border: order.paymentStatus === "payment_verified" ? "1px solid #16a34a" : "1px solid #d97706",
                color: order.paymentStatus === "payment_verified" ? "#15803d" : "#92400e",
              }}
            >
              Status: {order.paymentStatus === "payment_verified" ? "Payment Verified" : "Payment Under Verification"}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.05fr",
            gap: 16,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <span style={{ fontSize: ".7rem", textTransform: "uppercase", fontWeight: 800, color: "#64748b", display: "block", marginBottom: 4, letterSpacing: ".06em" }}>
              CUSTOMER &amp; DELIVERY DESTINATION
            </span>
            <strong style={{ fontSize: "1.05rem", color: "#0f172a", display: "block" }}>
              {order.customerName}
            </strong>
            {order.customerPhone && (
              <div style={{ fontSize: ".82rem", color: "#334155", marginTop: 3 }}>
                📱 {order.customerPhone}
              </div>
            )}
            {order.customerEmail && (
              <div style={{ fontSize: ".82rem", color: "#334155", marginTop: 2, overflowWrap: "anywhere" }}>
                ✉️ {order.customerEmail}
              </div>
            )}
            <div style={{ fontSize: ".82rem", color: "#334155", marginTop: 4, lineHeight: 1.45 }}>
              📍 {order.address ? `${order.address}, ` : ""}{order.city ? `${order.city}, ` : ""}{order.state ? `${order.state}, ` : ""}{order.postalCode ? `${order.postalCode}, ` : ""}{getCountryFlag(order.country)} {order.country}
            </div>
            {order.deliveryInstructions && (
              <div style={{ fontSize: ".76rem", color: "#64748b", fontStyle: "italic", marginTop: 4 }}>
                Note: {order.deliveryInstructions}
              </div>
            )}
          </div>

          <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 16 }}>
            <span style={{ fontSize: ".7rem", textTransform: "uppercase", fontWeight: 800, color: "#64748b", display: "block", marginBottom: 4, letterSpacing: ".06em" }}>
              PAYMENT &amp; BENEFICIARY SUMMARY
            </span>
            <strong style={{ fontSize: ".95rem", color: "#b45309", display: "block", marginBottom: 4 }}>
              {order.paymentMethod}
            </strong>
            <div style={{ fontSize: ".82rem", color: "#334155" }}>
              <strong>Bank:</strong> {UBL_PAYMENT_CONFIG.bankName}
            </div>
            <div style={{ fontSize: ".82rem", color: "#334155" }}>
              <strong>Beneficiary:</strong> {UBL_PAYMENT_CONFIG.beneficiaryFullName}
            </div>
            <div style={{ fontSize: ".82rem", color: "#334155", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginTop: 2 }}>
              <span><strong>Account:</strong> <code style={{ background: "#ffffff", padding: "1px 4px", border: "1px solid #cbd5e1", borderRadius: 4 }}>{UBL_PAYMENT_CONFIG.accountNumber}</code></span>
              <button
                type="button"
                onClick={() => handleCopy("acc", UBL_PAYMENT_CONFIG.accountNumber)}
                style={{ background: "#e2e8f0", border: "none", borderRadius: 4, padding: "2px 6px", fontSize: ".68rem", cursor: "pointer", fontWeight: 700 }}
              >
                {copiedKey === "acc" ? "Copied" : "Copy"}
              </button>
            </div>
            <div style={{ fontSize: ".82rem", color: "#334155", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginTop: 2 }}>
              <span><strong>IBAN:</strong> <code style={{ background: "#ffffff", padding: "1px 4px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: ".76rem" }}>{UBL_PAYMENT_CONFIG.iban}</code></span>
              <button
                type="button"
                onClick={() => handleCopy("iban", UBL_PAYMENT_CONFIG.iban)}
                style={{ background: "#e2e8f0", border: "none", borderRadius: 4, padding: "2px 6px", fontSize: ".68rem", cursor: "pointer", fontWeight: 700 }}
              >
                {copiedKey === "iban" ? "Copied" : "Copy"}
              </button>
            </div>
            {order.transferReference && (
              <div style={{ fontSize: ".82rem", color: "#b45309", marginTop: 4, fontWeight: 700 }}>
                Transaction Ref: {order.transferReference}
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
          <thead>
            <tr style={{ background: "#f1f5f9", borderBottom: "2px solid #cbd5e1" }}>
              <th style={{ padding: "8px 6px", textAlign: "left", fontSize: ".76rem", color: "#475569", textTransform: "uppercase", width: "6%" }}>#</th>
              <th style={{ padding: "8px 6px", textAlign: "left", fontSize: ".76rem", color: "#475569", textTransform: "uppercase", width: "50%" }}>Item Description &amp; Specifications</th>
              <th style={{ padding: "8px 6px", textAlign: "center", fontSize: ".76rem", color: "#475569", textTransform: "uppercase", width: "12%" }}>Qty</th>
              <th style={{ padding: "8px 6px", textAlign: "right", fontSize: ".76rem", color: "#475569", textTransform: "uppercase", width: "16%" }}>Unit Price</th>
              <th style={{ padding: "8px 6px", textAlign: "right", fontSize: ".76rem", color: "#475569", textTransform: "uppercase", width: "16%" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px 6px", fontSize: ".82rem", color: "#64748b" }}>{idx + 1}</td>
                <td style={{ padding: "10px 6px", fontSize: ".88rem", fontWeight: 700, color: "#0f172a" }}>
                  {it.name}
                  {it.category && (
                    <span style={{ display: "block", fontSize: ".74rem", fontWeight: 400, color: "#64748b", marginTop: 2 }}>
                      Category: {it.category}
                    </span>
                  )}
                </td>
                <td style={{ padding: "10px 6px", fontSize: ".88rem", textAlign: "center", fontWeight: 700 }}>{it.quantity}</td>
                <td style={{ padding: "10px 6px", fontSize: ".88rem", textAlign: "right", color: "#334155" }}>{formatPrice(it.price)}</td>
                <td style={{ padding: "10px 6px", fontSize: ".88rem", textAlign: "right", fontWeight: 800, color: "#b45309" }}>
                  {formatPrice(it.price * it.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} style={{ padding: "12px 6px 4px", textAlign: "right", color: "#64748b", fontSize: ".85rem" }}>
                Subtotal:
              </td>
              <td style={{ padding: "12px 6px 4px", textAlign: "right", color: "#0f172a", fontWeight: 700, fontSize: ".88rem" }}>
                {formatPrice(order.subtotal || order.totalAmount)}
              </td>
            </tr>
            {order.shippingFee !== undefined && (
              <tr>
                <td colSpan={4} style={{ padding: "4px 6px", textAlign: "right", color: "#64748b", fontSize: ".85rem" }}>
                  Tracked Courier ({order.country}):
                </td>
                <td style={{ padding: "4px 6px", textAlign: "right", color: "#0f172a", fontWeight: 700, fontSize: ".88rem" }}>
                  {formatPrice(order.shippingFee)}
                </td>
              </tr>
            )}
            <tr>
              <td colSpan={4} style={{ padding: "10px 6px 0", textAlign: "right", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                Total Order Value:
              </td>
              <td style={{ padding: "10px 6px 0", textAlign: "right" }}>
                <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "#b45309" }}>{formatPrice(order.totalAmount)}</span>
              </td>
            </tr>
            {order.depositPercent && order.depositPercent < 100 && (
              <>
                <tr>
                  <td colSpan={4} style={{ padding: "6px 6px 0", textAlign: "right", fontSize: ".85rem", color: "#16a34a", fontWeight: 700 }}>
                    Advance Deposit ({order.depositPercent}%):
                  </td>
                  <td style={{ padding: "6px 6px 0", textAlign: "right", fontSize: ".95rem", color: "#16a34a", fontWeight: 800 }}>
                    {formatPrice(order.depositAmount || 0)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} style={{ padding: "4px 6px 0", textAlign: "right", fontSize: ".85rem", color: "#dc2626", fontWeight: 700 }}>
                    Remaining Balance (Due Before Dispatch):
                  </td>
                  <td style={{ padding: "4px 6px 0", textAlign: "right", fontSize: ".95rem", color: "#dc2626", fontWeight: 800 }}>
                    {formatPrice(order.balanceRemaining || 0)}
                  </td>
                </tr>
              </>
            )}
          </tfoot>
        </table>

        {/* Notes */}
        {order.notes && (
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px 12px", borderRadius: 6, fontSize: ".8rem", color: "#475569", marginBottom: 16 }}>
            <strong style={{ color: "#b45309", display: "block", marginBottom: 2 }}>Order Notes:</strong>
            {order.notes}
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid #cbd5e1", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".76rem", color: "#64748b", flexWrap: "wrap", gap: 8 }}>
          <span>🛡️ Official Order Receipt · <strong>{BUSINESS_CONFIG.businessName}</strong></span>
          <span>WhatsApp: <strong>{BUSINESS_CONFIG.displayPhone}</strong></span>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 767px) {
          #clean-invoice-sheet {
            padding: 18px 14px !important;
          }
        }
        @media print {
          body {
            background: #ffffff !important;
            padding: 0 !important;
          }
          .invoice-screen-bar {
            display: none !important;
          }
          .standalone-invoice-page {
            background: #ffffff !important;
            padding: 0 !important;
          }
          #clean-invoice-sheet {
            box-shadow: none !important;
            padding: 0 !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
