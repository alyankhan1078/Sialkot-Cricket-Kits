/**
 * SIALKOT CRICKET KITS — OFFICIAL INVOICE TEMPLATE GENERATOR
 * Generates an executive A4-styled, mobile-responsive, print-ready standalone HTML invoice document.
 * Prevents line collisions, text clipping, and responsive overlap on all mobile & desktop screens.
 */

import { BUSINESS_CONFIG } from "./business-config.ts";
import { UBL_PAYMENT_CONFIG } from "./payment-config.ts";
import { getCountryFlag } from "./shipping.ts";

export interface InvoiceOrderItem {
  productId?: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
}

export interface InvoiceOrderData {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
  deliveryInstructions?: string;
  items: InvoiceOrderItem[];
  subtotal?: number;
  shippingFee?: number;
  totalAmount: number;
  depositPercent?: number;
  depositAmount?: number;
  balanceRemaining?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  transferReference?: string;
  senderName?: string;
  senderAccountNumber?: string;
  createdAt: string | Date;
  notes?: string;
}

export function generateInvoiceHtml(order: InvoiceOrderData): string {
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const subtotal = order.subtotal ?? (order.totalAmount - (order.shippingFee || 0));
  const isVerified = order.paymentStatus === "payment_verified";

  const rowsHtml = order.items
    .map((item, idx) => {
      const lineTotal = (item.price * item.quantity).toFixed(2);
      return `
        <tr class="invoice-item-row">
          <td class="col-num">${idx + 1}</td>
          <td class="col-desc">
            <div class="item-name">${escapeHtml(item.name)}</div>
            ${item.category ? `<div class="item-category">Category: ${escapeHtml(item.category)}</div>` : ""}
          </td>
          <td class="col-qty">${item.quantity}</td>
          <td class="col-price">£${Number(item.price).toFixed(2)}</td>
          <td class="col-total">£${lineTotal}</td>
        </tr>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Invoice #${escapeHtml(order.id)} — Sialkot Cricket Kits</title>
  <style>
    /* Reset & Base Styles */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f1f5f9;
      color: #0f172a;
      line-height: 1.5;
      padding: 24px 12px 48px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .invoice-wrapper {
      max-width: 820px;
      margin: 0 auto;
    }

    /* Screen Action Bar */
    .screen-actions-bar {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }

    .btn-print {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #b45309;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 3px 10px rgba(180, 83, 9, 0.25);
      transition: background 0.15s ease;
    }

    .btn-print:hover {
      background: #92400e;
    }

    /* Main Invoice Card */
    .invoice-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 36px 32px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    }

    /* Header Section */
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 24px;
      gap: 20px;
      flex-wrap: wrap;
    }

    .brand-section {
      flex: 1 1 320px;
      min-width: 0;
    }

    .brand-title {
      font-size: 22px;
      font-weight: 900;
      color: #b45309;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      line-height: 1.2;
      margin-bottom: 4px;
    }

    .brand-subtitle {
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 3px;
    }

    .brand-address, .brand-contact {
      font-size: 12px;
      color: #64748b;
      line-height: 1.45;
    }

    .meta-section {
      flex: 0 0 auto;
      text-align: right;
    }

    .doc-type {
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 0.04em;
      line-height: 1.2;
    }

    .order-ref {
      font-size: 15px;
      font-weight: 800;
      color: #b45309;
      font-family: monospace, Consolas, "Courier New";
      margin-top: 3px;
    }

    .order-date {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }

    .status-badge {
      display: inline-block;
      margin-top: 6px;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: ${isVerified ? "rgba(34, 197, 94, 0.15)" : "#fef3c7"};
      border: 1px solid ${isVerified ? "#16a34a" : "#d97706"};
      color: ${isVerified ? "#15803d" : "#92400e"};
    }

    /* Info Grid (Customer & Payment) */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 28px;
    }

    .info-block {
      min-width: 0;
      word-break: break-word;
    }

    .info-label {
      font-size: 11px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
    }

    .customer-name {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
      line-height: 1.3;
    }

    .info-line {
      font-size: 13px;
      color: #334155;
      line-height: 1.5;
      margin-top: 3px;
    }

    .bank-method-badge {
      font-size: 14px;
      font-weight: 800;
      color: #b45309;
      margin-bottom: 6px;
    }

    .code-chip {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace, Consolas, "Courier New";
      font-size: 12px;
      color: #0f172a;
    }

    /* Items Table */
    .table-container {
      width: 100%;
      overflow-x: auto;
      margin-bottom: 24px;
    }

    table.invoice-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: auto;
    }

    table.invoice-table thead tr {
      background: #f1f5f9;
      border-bottom: 2px solid #cbd5e1;
    }

    table.invoice-table th {
      padding: 10px 8px;
      font-size: 11px;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .col-num { width: 32px; text-align: left; }
    .col-desc { text-align: left; }
    .col-qty { width: 50px; text-align: center; }
    .col-price { width: 85px; text-align: right; }
    .col-total { width: 95px; text-align: right; }

    table.invoice-table tbody tr.invoice-item-row {
      border-bottom: 1px solid #e2e8f0;
    }

    table.invoice-table td {
      padding: 12px 8px;
      vertical-align: top;
      line-height: 1.45;
    }

    .item-name {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.35;
    }

    .item-category {
      font-size: 12px;
      color: #64748b;
      margin-top: 3px;
    }

    table.invoice-table td.col-num { font-size: 13px; color: #64748b; }
    table.invoice-table td.col-qty { font-size: 14px; font-weight: 700; color: #0f172a; text-align: center; }
    table.invoice-table td.col-price { font-size: 13px; color: #334155; text-align: right; }
    table.invoice-table td.col-total { font-size: 14px; font-weight: 800; color: #b45309; text-align: right; }

    /* Totals Summary */
    .totals-container {
      margin-top: 8px;
      border-top: 2px solid #0f172a;
      padding-top: 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: #475569;
      line-height: 1.4;
    }

    .totals-row strong {
      color: #0f172a;
      font-weight: 700;
    }

    .totals-row.grand-total {
      font-size: 18px;
      font-weight: 900;
      color: #b45309;
      border-top: 1px dashed #cbd5e1;
      padding-top: 10px;
      margin-top: 4px;
    }

    .totals-row.deposit-row {
      color: #15803d;
      font-weight: 800;
      font-size: 14px;
      margin-top: 4px;
    }

    .totals-row.balance-row {
      color: #b91c1c;
      font-weight: 800;
      font-size: 14px;
    }

    /* Notes Block */
    .order-notes-block {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 12px;
      color: #475569;
      margin-top: 20px;
      line-height: 1.5;
    }

    .notes-heading {
      color: #b45309;
      font-weight: 800;
      margin-bottom: 2px;
    }

    /* Footer */
    .invoice-footer {
      margin-top: 32px;
      border-top: 1px solid #cbd5e1;
      padding-top: 16px;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }

    /* Responsive Mobile Rules */
    @media (max-width: 640px) {
      body {
        padding: 12px 8px 36px;
      }
      .invoice-card {
        padding: 20px 16px;
      }
      .info-grid {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 14px;
      }
      .meta-section {
        text-align: left;
        margin-top: 6px;
      }
      .brand-title {
        font-size: 18px;
      }
      .doc-type {
        font-size: 17px;
      }
      .col-price {
        display: none;
      }
      table.invoice-table th.col-price {
        display: none;
      }
    }

    /* Clean A4 Print Rules */
    @media print {
      @page {
        size: A4 portrait;
        margin: 12mm 15mm;
      }
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .screen-actions-bar {
        display: none !important;
      }
      .invoice-card {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
      }
      .invoice-item-row {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <div class="screen-actions-bar">
      <button class="btn-print" onclick="window.print()">
        🖨️ Print / Save as PDF
      </button>
    </div>

    <div class="invoice-card">
      <!-- Header -->
      <div class="invoice-header">
        <div class="brand-section">
          <h1 class="brand-title">${escapeHtml(BUSINESS_CONFIG.businessName)}</h1>
          <p class="brand-subtitle">${escapeHtml(BUSINESS_CONFIG.factoryName)} · Master Cricket Batmakers</p>
          <p class="brand-address">📍 ${escapeHtml(BUSINESS_CONFIG.fullAddress)}</p>
          <p class="brand-contact">📱 WhatsApp: ${escapeHtml(BUSINESS_CONFIG.displayPhone)} | ✉️ ${escapeHtml(BUSINESS_CONFIG.primaryEmail)}</p>
        </div>
        <div class="meta-section">
          <div class="doc-type">OFFICIAL INVOICE</div>
          <div class="order-ref">#${escapeHtml(order.id)}</div>
          <div class="order-date">Issue Date: <strong>${formattedDate}</strong></div>
          <div class="status-badge">${isVerified ? "Payment Verified" : "Payment Under Verification"}</div>
        </div>
      </div>

      <!-- Customer & Beneficiary Grid -->
      <div class="info-grid">
        <div class="info-block">
          <div class="info-label">Customer &amp; Delivery Destination</div>
          <div class="customer-name">${escapeHtml(order.customerName)}</div>
          ${order.customerPhone ? `<div class="info-line">📱 ${escapeHtml(order.customerPhone)}</div>` : ""}
          ${order.customerEmail ? `<div class="info-line">✉️ ${escapeHtml(order.customerEmail)}</div>` : ""}
          <div class="info-line">📍 ${escapeHtml(order.address || "")}${order.city ? `, ${escapeHtml(order.city)}` : ""}${order.state ? `, ${escapeHtml(order.state)}` : ""}${order.postalCode ? `, ${escapeHtml(order.postalCode)}` : ""}, ${escapeHtml(order.country)}</div>
          ${order.deliveryInstructions ? `<div class="info-line" style="font-style: italic; color: #64748b; margin-top: 4px;">Note: ${escapeHtml(order.deliveryInstructions)}</div>` : ""}
        </div>

        <div class="info-block">
          <div class="info-label">Payment &amp; Beneficiary Summary</div>
          <div class="bank-method-badge">${escapeHtml(order.paymentMethod || "Direct Bank Deposit")}</div>
          <div class="info-line"><strong>Bank:</strong> ${escapeHtml(UBL_PAYMENT_CONFIG.bankName)}</div>
          <div class="info-line"><strong>Account Title:</strong> ${escapeHtml(UBL_PAYMENT_CONFIG.beneficiaryFullName)}</div>
          <div class="info-line"><strong>Account No:</strong> <span class="code-chip">${escapeHtml(UBL_PAYMENT_CONFIG.accountNumber)}</span></div>
          <div class="info-line"><strong>IBAN:</strong> <span class="code-chip">${escapeHtml(UBL_PAYMENT_CONFIG.iban)}</span></div>
          ${order.transferReference ? `<div class="info-line" style="color: #b45309; font-weight: 700; margin-top: 4px;">Transaction Ref: ${escapeHtml(order.transferReference)}</div>` : ""}
        </div>
      </div>

      <!-- Items Table -->
      <div class="table-container">
        <table class="invoice-table">
          <thead>
            <tr>
              <th class="col-num">#</th>
              <th class="col-desc">Item Description &amp; Specifications</th>
              <th class="col-qty">Qty</th>
              <th class="col-price">Unit Price</th>
              <th class="col-total">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div class="totals-container">
        <div class="totals-row">
          <span>Subtotal:</span>
          <strong>£${Number(subtotal).toFixed(2)}</strong>
        </div>
        ${order.shippingFee !== undefined ? `
        <div class="totals-row">
          <span>Tracked Courier Delivery (${escapeHtml(order.country)}):</span>
          <strong>£${Number(order.shippingFee).toFixed(2)}</strong>
        </div>` : ""}
        <div class="totals-row grand-total">
          <span>Total Order Value:</span>
          <span>£${Number(order.totalAmount).toFixed(2)}</span>
        </div>
        ${order.depositPercent && order.depositPercent < 100 ? `
        <div class="totals-row deposit-row">
          <span>Advance Deposit Paid (${order.depositPercent}%):</span>
          <span>£${Number(order.depositAmount || 0).toFixed(2)}</span>
        </div>
        <div class="totals-row balance-row">
          <span>Remaining Balance (Due Before Factory Dispatch):</span>
          <span>£${Number(order.balanceRemaining || 0).toFixed(2)}</span>
        </div>` : ""}
      </div>

      ${order.notes ? `
      <div class="order-notes-block">
        <div class="notes-heading">Order Notes:</div>
        <div>${escapeHtml(order.notes)}</div>
      </div>` : ""}

      <!-- Footer -->
      <div class="invoice-footer">
        <span>🛡️ Official Factory Dispatch Invoice · <strong>${escapeHtml(BUSINESS_CONFIG.businessName)}</strong></span>
        <span>WhatsApp: <strong>${escapeHtml(BUSINESS_CONFIG.displayPhone)}</strong></span>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
