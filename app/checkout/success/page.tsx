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
  Copy,
  Check,
  MapPin,
  ExternalLink,
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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const handleCopy = (key: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const whatsappConfirmationMsg = order
    ? `Hello Sialkot Cricket Kits,\n\nI have submitted my order #${order.id}.\nCustomer: ${order.customerName}\nBank/Transfer Reference: ${order.transferReference || "Attached on site"}\nTotal Value: £${order.totalAmount}\nAmount Paid / Due: £${order.depositAmount || order.totalAmount}\n\nPlease confirm when payment is verified. Thank you!`
    : "Hello Sialkot Cricket Kits, I just submitted my order and payment evidence. Please check my transfer.";

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          COMPREHENSIVE RESPONSIVE & PRINT INVOICE STYLESHEET
          ═══════════════════════════════════════════════════════════ */}
      <style jsx global>{`
        /* ── Base / Screen Wrapper ── */
        .order-success-page {
          max-width: 980px;
          margin: 32px auto 80px;
          padding: 0 16px;
          color: var(--text-primary, #f8fafc);
          box-sizing: border-box;
          width: 100%;
        }

        /* ── Printable Invoice Document Frame ── */
        #printable-invoice {
          background: #111722;
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 30px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        /* ── Header Section ── */
        .invoice-header-box {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid rgba(255, 255, 255, 0.12);
          padding-bottom: 22px;
          margin-bottom: 24px;
          gap: 20px;
          width: 100%;
          box-sizing: border-box;
        }

        .invoice-brand-col {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          min-width: 0;
          flex: 1;
        }

        .invoice-logo-img {
          width: 58px;
          height: 58px;
          min-width: 58px;
          object-fit: contain;
          background: #ffffff;
          padding: 4px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .invoice-brand-title {
          font-size: 1.28rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #f2a928;
          margin: 0 0 3px;
          line-height: 1.25;
        }

        .invoice-brand-subtitle {
          font-size: 0.8rem;
          color: #cbd5e1;
          display: block;
          font-weight: 600;
          line-height: 1.35;
        }

        .invoice-brand-address {
          font-size: 0.75rem;
          color: #94a3b8;
          display: block;
          margin-top: 3px;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .invoice-brand-contacts {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 5px;
          font-size: 0.74rem;
          color: #94a3b8;
        }

        .invoice-meta-col {
          text-align: right;
          flex-shrink: 0;
          min-width: 0;
        }

        .invoice-doc-title {
          font-size: 1.35rem;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: 0.05em;
        }

        .invoice-doc-ref {
          font-size: 1.05rem;
          font-weight: 800;
          color: #f2a928;
          font-family: monospace;
          margin-top: 2px;
        }

        .invoice-doc-date {
          font-size: 0.78rem;
          color: #94a3b8;
          margin-top: 4px;
        }

        .invoice-badge-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 8px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid #f59e0b;
          color: #fbbf24;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.74rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          white-space: normal;
          text-align: left;
        }

        .invoice-badge-status.verified {
          background: rgba(34, 197, 94, 0.15);
          border-color: #22c55e;
          color: #4ade80;
        }

        /* ── Information Cards Grid (Customer & Payment) ── */
        .invoice-info-grid {
          display: grid;
          grid-template-columns: 1fr 1.08fr;
          gap: 18px;
          background: rgba(0, 0, 0, 0.35);
          padding: 18px;
          border-radius: 12px;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 24px;
          width: 100%;
          box-sizing: border-box;
          min-width: 0;
        }

        .invoice-card-customer,
        .invoice-card-payment {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
          box-sizing: border-box;
        }

        .invoice-card-section-label {
          color: #94a3b8;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 800;
          display: block;
          margin-bottom: 4px;
        }

        .invoice-customer-name {
          color: #ffffff;
          font-size: 1.05rem;
          font-weight: 800;
          display: block;
          margin-bottom: 4px;
          overflow-wrap: anywhere;
        }

        .invoice-customer-row {
          color: #cbd5e1;
          font-size: 0.82rem;
          display: flex;
          align-items: flex-start;
          gap: 6px;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .invoice-address-box {
          color: #cbd5e1;
          font-size: 0.82rem;
          line-height: 1.45;
          margin-top: 4px;
          overflow-wrap: anywhere;
          word-break: normal;
        }

        .invoice-delivery-note {
          color: #94a3b8;
          font-size: 0.76rem;
          font-style: italic;
          margin-top: 5px;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        /* Payment Details Rows */
        .invoice-pay-method-badge {
          color: #f2a928;
          font-size: 0.94rem;
          font-weight: 800;
          display: block;
          margin-bottom: 4px;
        }

        .invoice-data-item {
          margin-bottom: 4px;
          font-size: 0.82rem;
          color: #cbd5e1;
          overflow-wrap: anywhere;
        }

        .invoice-data-item-label {
          display: block;
          font-size: 0.7rem;
          color: #94a3b8;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 1px;
        }

        .invoice-data-item-val {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          min-width: 0;
          flex-wrap: wrap;
        }

        .invoice-data-code {
          color: #38bdf8;
          font-size: 0.84rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
          background: rgba(56, 189, 248, 0.08);
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid rgba(56, 189, 248, 0.2);
          overflow-wrap: anywhere;
          word-break: break-all;
          max-width: 100%;
          min-width: 0;
          font-weight: 600;
        }

        .invoice-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #cbd5e1;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .invoice-copy-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          color: #ffffff;
        }

        .invoice-copy-btn.copied {
          background: rgba(34, 197, 94, 0.2);
          border-color: #22c55e;
          color: #4ade80;
        }

        /* ── Traditional Desktop Itemized Table ── */
        .invoice-desktop-table-wrap {
          width: 100%;
          overflow-x: auto;
          margin-bottom: 22px;
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: auto;
        }

        .invoice-table th {
          border-bottom: 2px solid #334155;
          text-align: left;
          color: #94a3b8;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 10px 8px;
          font-weight: 800;
        }

        .invoice-table td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 0.88rem;
          color: #cbd5e1;
          padding: 12px 8px;
          vertical-align: middle;
        }

        .invoice-table tr {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        /* ── Mobile Item Cards (< 768px on screen) ── */
        .invoice-mobile-items-wrap {
          display: none;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 22px;
          width: 100%;
          box-sizing: border-box;
        }

        .invoice-mobile-item-card {
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          box-sizing: border-box;
        }

        .invoice-mobile-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .invoice-mobile-item-title {
          font-size: 0.94rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .invoice-mobile-item-cat {
          font-size: 0.74rem;
          color: #94a3b8;
          margin-top: 2px;
        }

        .invoice-mobile-item-specs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1.2fr;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 0.78rem;
          align-items: center;
        }

        .invoice-mobile-spec-label {
          display: block;
          font-size: 0.68rem;
          color: #94a3b8;
          text-transform: uppercase;
          font-weight: 700;
        }

        .invoice-mobile-spec-val {
          font-weight: 800;
          color: #ffffff;
        }

        .invoice-mobile-spec-val.total {
          color: #f2a928;
          font-size: 0.88rem;
        }

        /* ── Totals Section ── */
        .invoice-totals-table {
          width: 100%;
          border-collapse: collapse;
        }

        .invoice-total-strong {
          color: #f2a928;
          font-size: 1.25rem;
          font-weight: 900;
        }

        /* ── Notes Block ── */
        .invoice-notes-block {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 12px 14px;
          border-radius: 8px;
          font-size: 0.8rem;
          color: #cbd5e1;
          margin-bottom: 20px;
          white-space: pre-line;
          overflow-wrap: anywhere;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        /* ── Official Footer ── */
        .invoice-footer-box {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 0.76rem;
          color: #94a3b8;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        /* ═══════════════════════════════════════════════════════════
            RESPONSIVE BREAKPOINTS (Mobile < 768px)
            ═══════════════════════════════════════════════════════════ */
        @media (max-width: 767px) {
          .order-success-page {
            padding: 0 12px;
            margin: 16px auto 60px;
          }

          #printable-invoice {
            padding: 18px 14px;
            border-radius: 12px;
          }

          /* Header goes vertical */
          .invoice-header-box {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
            padding-bottom: 16px;
          }

          .invoice-brand-col {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .invoice-logo-img {
            width: 48px;
            height: 48px;
            min-width: 48px;
          }

          .invoice-brand-title {
            font-size: 1.15rem;
          }

          .invoice-brand-contacts {
            flex-direction: column;
            gap: 4px;
          }

          .invoice-meta-col {
            text-align: left;
            border-top: 1px dashed rgba(255, 255, 255, 0.1);
            padding-top: 12px;
          }

          .invoice-doc-title {
            font-size: 1.15rem;
          }

          .invoice-doc-ref {
            font-size: 1.05rem;
          }

          .invoice-badge-status {
            width: 100%;
            justify-content: center;
            box-sizing: border-box;
          }

          /* Grid becomes 1-column stack */
          .invoice-info-grid {
            grid-template-columns: 1fr;
            gap: 16px;
            padding: 14px;
          }

          .invoice-card-payment {
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            padding-top: 14px;
          }

          /* Hide cramped table on mobile screen, show clean cards */
          .invoice-desktop-table-wrap {
            display: none;
          }

          .invoice-mobile-items-wrap {
            display: flex;
          }

          .invoice-mobile-item-specs-grid {
            grid-template-columns: 1fr 1fr;
          }

          .invoice-mobile-spec-val.total {
            grid-column: span 2;
            padding-top: 4px;
            border-top: 1px dashed rgba(255, 255, 255, 0.08);
          }

          /* Totals on Mobile */
          .invoice-totals-mobile-box {
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            padding: 14px;
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .invoice-totals-mobile-line {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.86rem;
            color: #cbd5e1;
          }

          .invoice-totals-mobile-line.grand {
            border-top: 1.5px solid rgba(255, 255, 255, 0.15);
            padding-top: 10px;
            margin-top: 4px;
            color: #ffffff;
            font-size: 1rem;
            font-weight: 800;
          }

          .invoice-totals-mobile-line.grand strong {
            color: #f2a928;
            font-size: 1.25rem;
            font-weight: 900;
          }

          .invoice-footer-box {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }

        /* ═══════════════════════════════════════════════════════════
            DEDICATED PRINT / PDF STYLESHEET (@media print)
            ═══════════════════════════════════════════════════════════ */
        @media print {
          /* 1. Page Configuration: Pure A4 Portrait */
          @page {
            size: A4 portrait;
            margin: 12mm 14mm;
          }

          /* 2. Global Reset for Crisp Clean Print */
          html, body {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 10pt !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* 3. Hide all screen-only layout elements */
          .site-header,
          .site-footer,
          .announcement-bar,
          .screen-only,
          .order-success-hero,
          .actions-bar,
          .invoice-copy-btn,
          .whatsapp-float-btn,
          button,
          nav,
          footer {
            display: none !important;
          }

          .order-success-page {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* 4. Official Printable Invoice Container */
          #printable-invoice {
            display: block !important;
            background: #ffffff !important;
            color: #0f172a !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }

          #printable-invoice * {
            color: #0f172a !important;
            text-shadow: none !important;
          }

          /* 5. Header in Print */
          .invoice-header-box {
            border-bottom: 2px solid #0f172a !important;
            padding-bottom: 14px !important;
            margin-bottom: 16px !important;
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .invoice-brand-col {
            display: flex !important;
            flex-direction: row !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }

          .invoice-logo-img {
            width: 52px !important;
            height: 52px !important;
            border: 1px solid #94a3b8 !important;
          }

          .invoice-brand-title {
            color: #b45309 !important;
            font-size: 14pt !important;
          }

          .invoice-brand-subtitle {
            color: #334155 !important;
            font-size: 8.5pt !important;
          }

          .invoice-brand-address {
            color: #475569 !important;
            font-size: 8pt !important;
          }

          .invoice-brand-contacts {
            color: #475569 !important;
            font-size: 8pt !important;
          }

          .invoice-meta-col {
            text-align: right !important;
            border: none !important;
            padding: 0 !important;
          }

          .invoice-doc-title {
            color: #0f172a !important;
            font-size: 15pt !important;
          }

          .invoice-doc-ref {
            color: #b45309 !important;
            font-size: 12pt !important;
          }

          .invoice-doc-date {
            color: #475569 !important;
            font-size: 8.5pt !important;
          }

          .invoice-badge-status {
            border: 1.5px solid #0f172a !important;
            background: #f8fafc !important;
            color: #0f172a !important;
            font-size: 7.5pt !important;
            padding: 3px 8px !important;
          }

          /* 6. Two-Column Customer / Payment Cards in Print */
          .invoice-info-grid {
            display: grid !important;
            grid-template-columns: 46% 54% !important;
            gap: 14px !important;
            background: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 6px !important;
            padding: 12px !important;
            margin-bottom: 16px !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .invoice-card-payment {
            border: none !important;
            padding: 0 !important;
          }

          .invoice-card-section-label {
            color: #475569 !important;
            font-size: 7.5pt !important;
            border-bottom: 1px solid #e2e8f0 !important;
            padding-bottom: 2px !important;
            margin-bottom: 4px !important;
          }

          .invoice-customer-name {
            color: #0f172a !important;
            font-size: 10.5pt !important;
          }

          .invoice-customer-row,
          .invoice-address-box,
          .invoice-data-item {
            color: #1e293b !important;
            font-size: 8.5pt !important;
          }

          .invoice-pay-method-badge {
            color: #b45309 !important;
            font-size: 9.5pt !important;
          }

          .invoice-data-code {
            color: #0f172a !important;
            background: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
            font-size: 8.5pt !important;
            padding: 1px 4px !important;
          }

          /* 7. Product Table in Print */
          .invoice-desktop-table-wrap {
            display: block !important;
            margin-bottom: 16px !important;
          }

          .invoice-mobile-items-wrap,
          .invoice-totals-mobile-box {
            display: none !important;
          }

          .invoice-table {
            display: table !important;
            width: 100% !important;
          }

          .invoice-table thead {
            display: table-header-group !important;
          }

          .invoice-table tfoot {
            display: table-footer-group !important;
          }

          .invoice-table th {
            background: #f1f5f9 !important;
            color: #0f172a !important;
            border-bottom: 2px solid #cbd5e1 !important;
            padding: 7px 6px !important;
            font-size: 8pt !important;
          }

          .invoice-table td {
            border-bottom: 1px solid #e2e8f0 !important;
            padding: 7px 6px !important;
            font-size: 8.5pt !important;
            color: #1e293b !important;
          }

          .invoice-table tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .invoice-total-strong {
            color: #b45309 !important;
            font-size: 12pt !important;
          }

          /* 8. Notes & Footer in Print */
          .invoice-notes-block {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            color: #334155 !important;
            font-size: 8pt !important;
            padding: 8px 10px !important;
            margin-bottom: 14px !important;
          }

          .invoice-footer-box {
            border-top: 1px solid #cbd5e1 !important;
            padding-top: 10px !important;
            font-size: 7.5pt !important;
            color: #475569 !important;
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
          }
        }
      `}</style>

      <main className="order-success-page">
        {/* ── SCREEN ONLY HERO CARD ── */}
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
                border: "1px solid var(--border, rgba(255,255,255,0.15))",
                color: "var(--text-secondary, #94a3b8)",
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
          <div id="printable-invoice">
            {/* 1. Header with Logo & Official Business Information */}
            <div className="invoice-header-box">
              <div className="invoice-brand-col">
                <img
                  src="/assets/brand/sialkot-cricket-kits-logo.png"
                  alt="Sialkot Cricket Kits"
                  className="invoice-logo-img"
                />
                <div>
                  <h2 className="invoice-brand-title">
                    {BUSINESS_CONFIG.businessName}
                  </h2>
                  <span className="invoice-brand-subtitle">
                    {BUSINESS_CONFIG.factoryName} · Master Cricket Equipment Manufacturers
                  </span>
                  <span className="invoice-brand-address">
                    📍 {BUSINESS_CONFIG.fullAddress}
                  </span>
                  <div className="invoice-brand-contacts">
                    <span>📱 WhatsApp: {BUSINESS_CONFIG.displayPhone}</span>
                    <span>✉️ {BUSINESS_CONFIG.primaryEmail}</span>
                  </div>
                </div>
              </div>

              <div className="invoice-meta-col">
                <div className="invoice-doc-title">
                  OFFICIAL INVOICE
                </div>
                <div className="invoice-doc-ref">
                  #{order.id}
                </div>
                <div className="invoice-doc-date">
                  Issue Date: <strong>{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</strong>
                </div>
                <div className={`invoice-badge-status ${order.paymentStatus === "payment_verified" ? "verified" : ""}`}>
                  Status: {order.paymentStatus === "payment_verified" ? "Payment Verified" : "Payment Under Verification"}
                </div>
              </div>
            </div>

            {/* 2. Customer & Payment Details Grid (2-Col Desktop, 1-Col Mobile) */}
            <div className="invoice-info-grid">
              {/* Customer & Delivery Destination Card */}
              <div className="invoice-card-customer">
                <span className="invoice-card-section-label">
                  CUSTOMER &amp; DELIVERY DESTINATION
                </span>
                <strong className="invoice-customer-name">
                  {order.customerName}
                </strong>
                {order.customerPhone && (
                  <div className="invoice-customer-row">
                    <span>📱</span>
                    <span>{order.customerPhone}</span>
                  </div>
                )}
                {order.customerEmail && (
                  <div className="invoice-customer-row">
                    <span>✉️</span>
                    <span style={{ overflowWrap: "anywhere", wordBreak: "break-all" }}>{order.customerEmail}</span>
                  </div>
                )}
                <div className="invoice-address-box">
                  <span>📍</span> {order.address ? `${order.address}, ` : ""}{order.city ? `${order.city}, ` : ""}{order.state ? `${order.state}, ` : ""}{order.postalCode ? `${order.postalCode}, ` : ""}{getCountryFlag(order.country)} {order.country}
                </div>
                {order.deliveryInstructions && (
                  <div className="invoice-delivery-note">
                    Note: {order.deliveryInstructions}
                  </div>
                )}
              </div>

              {/* Payment & Bank Beneficiary Summary Card */}
              <div className="invoice-card-payment">
                <span className="invoice-card-section-label">
                  PAYMENT &amp; BENEFICIARY SUMMARY
                </span>
                <strong className="invoice-pay-method-badge">
                  {order.paymentMethod}
                </strong>

                {/* Beneficiary */}
                <div className="invoice-data-item">
                  <span className="invoice-data-item-label">Beneficiary Name</span>
                  <strong style={{ color: "#ffffff", fontSize: ".88rem" }}>
                    {UBL_PAYMENT_CONFIG.beneficiaryFullName} ({UBL_PAYMENT_CONFIG.bankName})
                  </strong>
                </div>

                {/* Account Number */}
                <div className="invoice-data-item">
                  <span className="invoice-data-item-label">Account Number</span>
                  <div className="invoice-data-item-val">
                    <code className="invoice-data-code">{UBL_PAYMENT_CONFIG.accountNumber}</code>
                    <button
                      type="button"
                      className={`invoice-copy-btn ${copiedKey === "acc" ? "copied" : ""}`}
                      onClick={() => handleCopy("acc", UBL_PAYMENT_CONFIG.accountNumber)}
                    >
                      {copiedKey === "acc" ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedKey === "acc" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {/* IBAN */}
                <div className="invoice-data-item">
                  <span className="invoice-data-item-label">IBAN</span>
                  <div className="invoice-data-item-val">
                    <code className="invoice-data-code">{UBL_PAYMENT_CONFIG.iban}</code>
                    <button
                      type="button"
                      className={`invoice-copy-btn ${copiedKey === "iban" ? "copied" : ""}`}
                      onClick={() => handleCopy("iban", UBL_PAYMENT_CONFIG.iban)}
                    >
                      {copiedKey === "iban" ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedKey === "iban" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {/* Transaction Reference */}
                {order.transferReference && (
                  <div className="invoice-data-item" style={{ marginTop: 2 }}>
                    <span className="invoice-data-item-label">Transaction Reference</span>
                    <div className="invoice-data-item-val">
                      <code className="invoice-data-code" style={{ color: "#f2a928", borderColor: "rgba(242, 169, 40, 0.4)" }}>
                        {order.transferReference}
                      </code>
                      <button
                        type="button"
                        className={`invoice-copy-btn ${copiedKey === "ref" ? "copied" : ""}`}
                        onClick={() => handleCopy("ref", order.transferReference!)}
                      >
                        {copiedKey === "ref" ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedKey === "ref" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Traditional Desktop / Tablet / Print Table */}
            <div className="invoice-desktop-table-wrap">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th style={{ width: "6%" }}>#</th>
                    <th style={{ width: "48%" }}>Item Description &amp; Specifications</th>
                    <th style={{ width: "12%", textAlign: "center" }}>Qty</th>
                    <th style={{ width: "17%", textAlign: "right" }}>Unit Price</th>
                    <th style={{ width: "17%", textAlign: "right" }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it, idx) => (
                    <tr key={idx}>
                      <td style={{ color: "#94a3b8", fontSize: ".8rem" }}>{idx + 1}</td>
                      <td>
                        <strong style={{ color: "#ffffff", display: "block" }}>{it.name}</strong>
                        {it.category && (
                          <span style={{ display: "block", color: "#94a3b8", fontSize: ".74rem" }}>
                            Category: {it.category}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>{it.quantity}</td>
                      <td style={{ textAlign: "right" }}>{formatPrice(it.price)}</td>
                      <td style={{ textAlign: "right", color: "#f2a928", fontWeight: 800 }}>
                        {formatPrice(it.price * it.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ padding: "14px 8px 4px", textAlign: "right", color: "#94a3b8" }}>
                      Subtotal:
                    </td>
                    <td style={{ padding: "14px 8px 4px", textAlign: "right", color: "#ffffff", fontWeight: 700 }}>
                      {formatPrice(order.subtotal || order.totalAmount)}
                    </td>
                  </tr>
                  {order.shippingFee !== undefined && (
                    <tr>
                      <td colSpan={4} style={{ padding: "4px 8px", textAlign: "right", color: "#94a3b8" }}>
                        Tracked Courier ({order.country}):
                      </td>
                      <td style={{ padding: "4px 8px", textAlign: "right", color: "#ffffff", fontWeight: 700 }}>
                        {formatPrice(order.shippingFee)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={4} style={{ padding: "12px 8px 0", textAlign: "right", fontSize: "1.05rem", fontWeight: 800, color: "#ffffff" }}>
                      Total Order Value:
                    </td>
                    <td style={{ padding: "12px 8px 0", textAlign: "right" }}>
                      <span className="invoice-total-strong">{formatPrice(order.totalAmount)}</span>
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
            </div>

            {/* 4. Mobile Screen Item Cards (< 768px on screen) */}
            <div className="invoice-mobile-items-wrap">
              <span className="invoice-card-section-label" style={{ marginBottom: 0 }}>
                ORDER ITEMS ({order.items.length})
              </span>
              {order.items.map((it, idx) => (
                <div key={idx} className="invoice-mobile-item-card">
                  <div className="invoice-mobile-item-header">
                    <div>
                      <strong className="invoice-mobile-item-title">
                        {idx + 1}. {it.name}
                      </strong>
                      {it.category && (
                        <div className="invoice-mobile-item-cat">
                          Category: {it.category}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="invoice-mobile-item-specs-grid">
                    <div>
                      <span className="invoice-mobile-spec-label">Qty</span>
                      <strong className="invoice-mobile-spec-val">{it.quantity}</strong>
                    </div>
                    <div>
                      <span className="invoice-mobile-spec-label">Unit Price</span>
                      <span className="invoice-mobile-spec-val">{formatPrice(it.price)}</span>
                    </div>
                    <div>
                      <span className="invoice-mobile-spec-label">Line Total</span>
                      <strong className="invoice-mobile-spec-val total">
                        {formatPrice(it.price * it.quantity)}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}

              {/* Mobile Totals Box */}
              <div className="invoice-totals-mobile-box">
                <div className="invoice-totals-mobile-line">
                  <span>Subtotal:</span>
                  <strong>{formatPrice(order.subtotal || order.totalAmount)}</strong>
                </div>

                {order.shippingFee !== undefined && (
                  <div className="invoice-totals-mobile-line">
                    <span>Tracked Courier ({order.country}):</span>
                    <strong>{formatPrice(order.shippingFee)}</strong>
                  </div>
                )}

                <div className="invoice-totals-mobile-line grand">
                  <span>TOTAL ORDER VALUE:</span>
                  <strong>{formatPrice(order.totalAmount)}</strong>
                </div>

                {order.depositPercent && order.depositPercent < 100 && (
                  <>
                    <div className="invoice-totals-mobile-line" style={{ color: "#4ade80", fontWeight: 700, paddingTop: 4 }}>
                      <span>Advance Deposit ({order.depositPercent}%):</span>
                      <strong>{formatPrice(order.depositAmount || 0)}</strong>
                    </div>
                    <div className="invoice-totals-mobile-line" style={{ color: "#f87171", fontWeight: 700 }}>
                      <span>Remaining Balance:</span>
                      <strong>{formatPrice(order.balanceRemaining || 0)}</strong>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 5. Notes & Official Information Box */}
            {order.notes && (
              <div className="invoice-notes-block">
                <strong style={{ color: "#f2a928", display: "block", marginBottom: 3 }}>
                  Order &amp; Evidence Notes:
                </strong>
                {order.notes}
              </div>
            )}

            {/* 6. Official Footer & Verification Statement */}
            <div className="invoice-footer-box">
              <div>
                <span>🛡️ Official Order Receipt · <strong>{BUSINESS_CONFIG.businessName}</strong></span>
                <span style={{ display: "block", marginTop: 2 }}>
                  For ping videos &amp; dispatch tracking, WhatsApp: <strong>{BUSINESS_CONFIG.displayPhone}</strong> · Email: <strong>{BUSINESS_CONFIG.primaryEmail}</strong>
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span>Official Sialkot Factory Direct Export Hub</span>
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
