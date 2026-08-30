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
import { generateInvoiceHtml } from "@/src/lib/invoice-generator";
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
      const invoiceHtml = generateInvoiceHtml(order);
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
    <div className="standalone-invoice-page">
      {/* ── TOP FLOATING SCREEN TOOLBAR (Hidden in Print) ── */}
      <div className="invoice-screen-bar">
        <Link
          href={`/checkout/success?orderId=${encodeURIComponent(order.id)}`}
          className="btn-back-order"
        >
          <ArrowLeft size={16} /> Back to Order
        </Link>

        <div className="toolbar-actions-right">
          <button
            type="button"
            onClick={handlePrint}
            className="btn-print-action"
          >
            <Printer size={15} /> Print / Save PDF
          </button>

          <button
            type="button"
            onClick={handleDownloadOffline}
            disabled={isDownloading}
            className="btn-download-action"
          >
            <Download size={15} /> Save Invoice File
          </button>

          <a
            href={whatsappUrl(`Hello Sialkot Cricket Kits, regarding my invoice for order #${order.id}:`)}
            target="_blank"
            rel="noreferrer"
            className="btn-whatsapp-action"
          >
            <MessageCircle size={15} /> WhatsApp
          </a>
        </div>
      </div>

      {/* ── CLEAN PURE A4 INVOICE SHEET ── */}
      <div id="clean-invoice-sheet" className="invoice-sheet">
        {/* Header */}
        <div className="invoice-sheet-header">
          <div className="sheet-brand-group">
            <img
              src="/assets/brand/sialkot-cricket-kits-logo.png"
              alt="Sialkot Cricket Kits"
              className="sheet-logo"
            />
            <div className="sheet-brand-text">
              <h1 className="sheet-brand-title">
                {BUSINESS_CONFIG.businessName}
              </h1>
              <span className="sheet-brand-sub">
                {BUSINESS_CONFIG.factoryName} · Master Cricket Equipment Manufacturers
              </span>
              <span className="sheet-brand-address">
                📍 {BUSINESS_CONFIG.fullAddress}
              </span>
              <div className="sheet-brand-contacts">
                <span>📱 {BUSINESS_CONFIG.displayPhone}</span>
                <span>✉️ {BUSINESS_CONFIG.primaryEmail}</span>
              </div>
            </div>
          </div>

          <div className="sheet-meta-group">
            <div className="sheet-doc-title">
              OFFICIAL INVOICE
            </div>
            <div className="sheet-order-id">
              #{order.id}
            </div>
            <div className="sheet-issue-date">
              Issue Date: <strong>{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</strong>
            </div>
            <div className={`sheet-status-tag ${order.paymentStatus === "payment_verified" ? "verified" : "pending"}`}>
              Status: {order.paymentStatus === "payment_verified" ? "Payment Verified" : "Payment Under Verification"}
            </div>
          </div>
        </div>

        {/* Info Grid (Responsive) */}
        <div className="sheet-info-grid">
          <div className="sheet-info-card">
            <span className="sheet-section-tag">
              CUSTOMER &amp; DELIVERY DESTINATION
            </span>
            <strong className="sheet-customer-name">
              {order.customerName}
            </strong>
            {order.customerPhone && (
              <div className="sheet-info-item">
                📱 {order.customerPhone}
              </div>
            )}
            {order.customerEmail && (
              <div className="sheet-info-item">
                ✉️ {order.customerEmail}
              </div>
            )}
            <div className="sheet-info-item address">
              📍 {order.address ? `${order.address}, ` : ""}{order.city ? `${order.city}, ` : ""}{order.state ? `${order.state}, ` : ""}{order.postalCode ? `${order.postalCode}, ` : ""}{getCountryFlag(order.country)} {order.country}
            </div>
            {order.deliveryInstructions && (
              <div className="sheet-info-item instructions">
                Note: {order.deliveryInstructions}
              </div>
            )}
          </div>

          <div className="sheet-info-card payment-card">
            <span className="sheet-section-tag">
              PAYMENT &amp; BENEFICIARY SUMMARY
            </span>
            <strong className="sheet-payment-method">
              {order.paymentMethod || "Direct Bank Deposit"}
            </strong>
            <div className="sheet-info-item">
              <strong>Bank:</strong> {UBL_PAYMENT_CONFIG.bankName}
            </div>
            <div className="sheet-info-item">
              <strong>Beneficiary:</strong> {UBL_PAYMENT_CONFIG.beneficiaryFullName}
            </div>
            <div className="sheet-info-item flex-copy">
              <span><strong>Account:</strong> <code className="sheet-code">{UBL_PAYMENT_CONFIG.accountNumber}</code></span>
              <button
                type="button"
                onClick={() => handleCopy("acc", UBL_PAYMENT_CONFIG.accountNumber)}
                className="sheet-copy-btn"
              >
                {copiedKey === "acc" ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="sheet-info-item flex-copy">
              <span><strong>IBAN:</strong> <code className="sheet-code">{UBL_PAYMENT_CONFIG.iban}</code></span>
              <button
                type="button"
                onClick={() => handleCopy("iban", UBL_PAYMENT_CONFIG.iban)}
                className="sheet-copy-btn"
              >
                {copiedKey === "iban" ? "Copied" : "Copy"}
              </button>
            </div>
            {order.transferReference && (
              <div className="sheet-info-item ref">
                Transaction Ref: {order.transferReference}
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="sheet-table-wrapper">
          <table className="sheet-table">
            <thead>
              <tr>
                <th className="col-idx">#</th>
                <th className="col-desc">Item Description &amp; Specifications</th>
                <th className="col-qty">Qty</th>
                <th className="col-unit">Unit Price</th>
                <th className="col-total">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, idx) => (
                <tr key={idx} className="sheet-item-row">
                  <td className="col-idx">{idx + 1}</td>
                  <td className="col-desc">
                    <div className="item-title">{it.name}</div>
                    {it.category && (
                      <div className="item-sub">
                        Category: {it.category}
                      </div>
                    )}
                  </td>
                  <td className="col-qty">{it.quantity}</td>
                  <td className="col-unit">{formatPrice(it.price)}</td>
                  <td className="col-total">
                    {formatPrice(it.price * it.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="foot-label">
                  Subtotal:
                </td>
                <td className="foot-value">
                  {formatPrice(order.subtotal || order.totalAmount)}
                </td>
              </tr>
              {order.shippingFee !== undefined && (
                <tr>
                  <td colSpan={4} className="foot-label">
                    Tracked Courier ({order.country}):
                  </td>
                  <td className="foot-value">
                    {formatPrice(order.shippingFee)}
                  </td>
                </tr>
              )}
              <tr className="foot-grand-row">
                <td colSpan={4} className="foot-grand-label">
                  Total Order Value:
                </td>
                <td className="foot-grand-value">
                  {formatPrice(order.totalAmount)}
                </td>
              </tr>
              {order.depositPercent && order.depositPercent < 100 && (
                <>
                  <tr className="foot-deposit-row">
                    <td colSpan={4} className="foot-deposit-label">
                      Advance Deposit ({order.depositPercent}%):
                    </td>
                    <td className="foot-deposit-value">
                      {formatPrice(order.depositAmount || 0)}
                    </td>
                  </tr>
                  <tr className="foot-balance-row">
                    <td colSpan={4} className="foot-balance-label">
                      Remaining Balance (Due Before Dispatch):
                    </td>
                    <td className="foot-balance-value">
                      {formatPrice(order.balanceRemaining || 0)}
                    </td>
                  </tr>
                </>
              )}
            </tfoot>
          </table>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="sheet-notes">
            <strong className="notes-tag">Order Notes:</strong>
            {order.notes}
          </div>
        )}

        {/* Footer */}
        <div className="sheet-footer">
          <span>🛡️ Official Order Receipt · <strong>{BUSINESS_CONFIG.businessName}</strong></span>
          <span>WhatsApp: <strong>{BUSINESS_CONFIG.displayPhone}</strong></span>
        </div>
      </div>

      <style jsx global>{`
        .standalone-invoice-page {
          min-height: 100vh;
          background: #080c14;
          color: #0f172a;
          padding: 16px 12px 60px;
        }

        .invoice-screen-bar {
          max-width: 820px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          background: #111724;
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 10px 14px;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .btn-back-order {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
          font-size: 0.82rem;
          font-weight: 600;
          text-decoration: none;
        }

        .toolbar-actions-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-print-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #f2a928 0%, #d97706 100%);
          color: #000000;
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(242, 169, 40, 0.3);
        }

        .btn-download-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-whatsapp-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #22c55e;
          color: #000000;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          text-decoration: none;
        }

        .invoice-sheet {
          max-width: 820px;
          margin: 0 auto;
          background: #ffffff;
          color: #0f172a;
          border-radius: 12px;
          padding: 32px 28px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          box-sizing: border-box;
          line-height: 1.5;
        }

        .invoice-sheet-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 18px;
          margin-bottom: 22px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .sheet-brand-group {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          flex: 1 1 320px;
          min-width: 0;
        }

        .sheet-logo {
          width: 54px;
          height: 54px;
          object-fit: contain;
          background: #f8fafc;
          padding: 4px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          flex-shrink: 0;
        }

        .sheet-brand-title {
          font-size: 1.25rem;
          font-weight: 900;
          color: #b45309;
          text-transform: uppercase;
          margin: 0 0 2px;
          line-height: 1.2;
        }

        .sheet-brand-sub {
          font-size: 0.78rem;
          color: #334155;
          font-weight: 600;
          display: block;
          margin-bottom: 2px;
        }

        .sheet-brand-address {
          font-size: 0.74rem;
          color: #64748b;
          display: block;
          line-height: 1.4;
        }

        .sheet-brand-contacts {
          display: flex;
          gap: 12px;
          font-size: 0.74rem;
          color: #64748b;
          margin-top: 4px;
          flex-wrap: wrap;
        }

        .sheet-meta-group {
          text-align: right;
          flex: 0 0 auto;
        }

        .sheet-doc-title {
          font-size: 1.3rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: 0.04em;
          line-height: 1.2;
        }

        .sheet-order-id {
          font-size: 1rem;
          font-weight: 800;
          color: #b45309;
          font-family: monospace;
          margin-top: 2px;
        }

        .sheet-issue-date {
          font-size: 0.76rem;
          color: #64748b;
          margin-top: 3px;
        }

        .sheet-status-tag {
          display: inline-block;
          margin-top: 6px;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .sheet-status-tag.verified {
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid #16a34a;
          color: #15803d;
        }

        .sheet-status-tag.pending {
          background: #fef3c7;
          border: 1px solid #d97706;
          color: #92400e;
        }

        .sheet-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 22px;
        }

        .sheet-info-card {
          min-width: 0;
          word-break: break-word;
        }

        .sheet-section-tag {
          font-size: 0.68rem;
          text-transform: uppercase;
          font-weight: 800;
          color: #64748b;
          display: block;
          margin-bottom: 4px;
          letter-spacing: 0.06em;
        }

        .sheet-customer-name {
          font-size: 1rem;
          color: #0f172a;
          display: block;
          line-height: 1.3;
        }

        .sheet-info-item {
          font-size: 0.8rem;
          color: #334155;
          margin-top: 3px;
          line-height: 1.45;
        }

        .sheet-info-item.address {
          margin-top: 4px;
        }

        .sheet-info-item.instructions {
          font-size: 0.74rem;
          color: #64748b;
          font-style: italic;
          margin-top: 4px;
        }

        .sheet-info-item.ref {
          color: #b45309;
          font-weight: 700;
          margin-top: 4px;
        }

        .sheet-payment-method {
          font-size: 0.92rem;
          color: #b45309;
          display: block;
          margin-bottom: 4px;
        }

        .sheet-info-item.flex-copy {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          margin-top: 3px;
        }

        .sheet-code {
          background: #ffffff;
          padding: 1px 5px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.76rem;
        }

        .sheet-copy-btn {
          background: #e2e8f0;
          border: none;
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 0.66rem;
          cursor: pointer;
          font-weight: 700;
          color: #0f172a;
        }

        .sheet-table-wrapper {
          width: 100%;
          overflow-x: auto;
          margin-bottom: 22px;
        }

        .sheet-table {
          width: 100%;
          border-collapse: collapse;
          line-height: 1.45;
        }

        .sheet-table thead tr {
          background: #f1f5f9;
          border-bottom: 2px solid #cbd5e1;
        }

        .sheet-table th {
          padding: 8px 6px;
          font-size: 0.74rem;
          color: #475569;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .col-idx { width: 32px; text-align: left; }
        .col-desc { text-align: left; }
        .col-qty { width: 50px; text-align: center; }
        .col-unit { width: 85px; text-align: right; }
        .col-total { width: 95px; text-align: right; }

        .sheet-item-row {
          border-bottom: 1px solid #e2e8f0;
        }

        .sheet-item-row td {
          padding: 10px 6px;
          vertical-align: top;
        }

        .sheet-item-row td.col-idx { font-size: 0.8rem; color: #64748b; }
        .sheet-item-row td.col-qty { font-size: 0.86rem; text-align: center; font-weight: 700; }
        .sheet-item-row td.col-unit { font-size: 0.82rem; text-align: right; color: #334155; }
        .sheet-item-row td.col-total { font-size: 0.86rem; text-align: right; font-weight: 800; color: #b45309; }

        .item-title {
          font-size: 0.86rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.35;
        }

        .item-sub {
          font-size: 0.72rem;
          color: #64748b;
          margin-top: 2px;
        }

        .foot-label {
          padding: 10px 6px 4px;
          text-align: right;
          color: #64748b;
          font-size: 0.82rem;
        }

        .foot-value {
          padding: 10px 6px 4px;
          text-align: right;
          color: #0f172a;
          font-weight: 700;
          font-size: 0.86rem;
        }

        .foot-grand-row td {
          padding-top: 10px;
          border-top: 2px solid #0f172a;
        }

        .foot-grand-label {
          text-align: right;
          font-size: 1rem;
          font-weight: 800;
          color: #0f172a;
        }

        .foot-grand-value {
          text-align: right;
          font-size: 1.2rem;
          font-weight: 900;
          color: #b45309;
        }

        .foot-deposit-row td, .foot-balance-row td {
          padding-top: 4px;
        }

        .foot-deposit-label {
          text-align: right;
          font-size: 0.82rem;
          color: #16a34a;
          font-weight: 700;
        }

        .foot-deposit-value {
          text-align: right;
          font-size: 0.92rem;
          color: #16a34a;
          font-weight: 800;
        }

        .foot-balance-label {
          text-align: right;
          font-size: 0.82rem;
          color: #dc2626;
          font-weight: 700;
        }

        .foot-balance-value {
          text-align: right;
          font-size: 0.92rem;
          color: #dc2626;
          font-weight: 800;
        }

        .sheet-notes {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 0.78rem;
          color: #475569;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .notes-tag {
          color: #b45309;
          display: block;
          margin-bottom: 2px;
        }

        .sheet-footer {
          border-top: 1px solid #cbd5e1;
          padding-top: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.74rem;
          color: #64748b;
          flex-wrap: wrap;
          gap: 8px;
        }

        @media (max-width: 640px) {
          .invoice-sheet {
            padding: 18px 14px !important;
          }
          .sheet-info-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .sheet-meta-group {
            text-align: left !important;
          }
          .col-unit {
            display: none !important;
          }
          .sheet-table th.col-unit {
            display: none !important;
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
          .invoice-sheet {
            box-shadow: none !important;
            padding: 0 !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
