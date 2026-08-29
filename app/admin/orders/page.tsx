"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Download,
  Trash2,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Printer,
  ShoppingBag,
  Mail,
  MessageCircle,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  FileText,
  ExternalLink,
  Check,
  X,
  Building2,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { formatPrice } from "@/src/data/products";
import type { DBOrder, DBPaymentSubmission, DBPaymentStatusHistory } from "@/src/lib/data-service";
import { useAdminFeedback } from "@/src/components/AdminFeedbackContext";
import { whatsappUrl, generateOrderConfirmationWhatsAppMessage } from "@/src/lib/whatsapp";
import { UBL_PAYMENT_CONFIG } from "@/src/lib/payment-config";

export default function AdminOrdersPage() {
  const { showToast, confirmAction } = useAdminFeedback();

  const [activeView, setActiveView] = useState<"verifications" | "orders">("verifications");
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [submissions, setSubmissions] = useState<(DBPaymentSubmission & { isDuplicateReference?: boolean; duplicateMatchedOrders?: string[]; history?: DBPaymentStatusHistory[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState<DBOrder | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<(DBPaymentSubmission & { isDuplicateReference?: boolean; duplicateMatchedOrders?: string[]; history?: DBPaymentStatusHistory[] }) | null>(null);

  // Verification & Rejection Modal State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [confirmUblChecked, setConfirmUblChecked] = useState(false);
  const [adminVerifyNote, setAdminVerifyNote] = useState("");
  const [adminRejectReason, setAdminRejectReason] = useState("");
  const [requestReupload, setRequestReupload] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // New order form state
  const [newOrder, setNewOrder] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    country: "Pakistan",
    productName: "",
    price: "",
    quantity: "1",
    paymentMethod: "Direct Bank Transfer",
    status: "completed" as const,
    notes: "",
  });
  const [savingOrder, setSavingOrder] = useState(false);

  const fetchOrdersAndSubmissions = async () => {
    setLoading(true);
    try {
      const [ordersRes, psubsRes] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/admin/payments"),
      ]);

      const [ordersJson, psubsJson] = await Promise.all([
        ordersRes.json(),
        psubsRes.json(),
      ]);

      if (ordersJson.success) setOrders(ordersJson.data);
      if (psubsJson.success) setSubmissions(psubsJson.data);
    } catch {
      showToast("Failed to load orders or payment submissions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndSubmissions();
  }, []);

  const handleDownloadReport = async () => {
    setIsExporting(true);
    try {
      const link = document.createElement("a");
      link.href = "/api/admin/sales/export?range=all";
      link.setAttribute("download", `Sialkot_Cricket_Kits_Orders_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Sales Report CSV downloaded successfully!", "success");
    } catch {
      showToast("Failed to export sales report", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!selectedSubmission) return;
    if (!confirmUblChecked) {
      showToast("Please check the box confirming verification in the official UBL account", "error");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/payments/${selectedSubmission.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmedInUblAccount: true,
          note: adminVerifyNote,
          adminEmail: "admin@sialkotcricketkits.co.uk",
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Payment for Order #${selectedSubmission.orderId} verified successfully!`, "success");
        setShowVerifyModal(false);
        setConfirmUblChecked(false);
        setAdminVerifyNote("");
        fetchOrdersAndSubmissions();
      } else {
        showToast(data.error || "Failed to verify payment", "error");
      }
    } catch {
      showToast("Network error while verifying payment", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedSubmission) return;
    if (!adminRejectReason.trim()) {
      showToast("Please provide a rejection reason", "error");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/payments/${selectedSubmission.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rejectionReason: adminRejectReason,
          requestReupload,
          adminEmail: "admin@sialkotcricketkits.co.uk",
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Payment marked as ${requestReupload ? "re-upload requested" : "rejected"}`, "info");
        setShowRejectModal(false);
        setAdminRejectReason("");
        setRequestReupload(false);
        fetchOrdersAndSubmissions();
      } else {
        showToast(data.error || "Failed to reject payment", "error");
      }
    } catch {
      showToast("Network error while rejecting payment", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.customerName || !newOrder.productName || !newOrder.price) return;
    setSavingOrder(true);

    try {
      const priceNum = Number(newOrder.price);
      const qtyNum = Number(newOrder.quantity) || 1;
      const totalAmount = priceNum * qtyNum;

      const payload = {
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone || undefined,
        customerEmail: newOrder.customerEmail || undefined,
        country: newOrder.country,
        items: [
          {
            name: newOrder.productName,
            price: priceNum,
            quantity: qtyNum,
          },
        ],
        totalAmount,
        paymentStatus: "payment_verified" as const,
        fulfilmentStatus: "new" as const,
        status: "completed" as const,
        paymentMethod: newOrder.paymentMethod,
        notes: newOrder.notes || "Manual sale recorded from admin panel.",
      };

      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Order "${data.data.id}" recorded successfully!`, "success");
        setShowAddModal(false);
        setNewOrder({
          customerName: "",
          customerPhone: "",
          customerEmail: "",
          country: "Pakistan",
          productName: "",
          price: "",
          quantity: "1",
          paymentMethod: "Direct Bank Transfer",
          status: "completed",
          notes: "",
        });
        fetchOrdersAndSubmissions();
      } else {
        showToast(data.error || "Failed to record order", "error");
      }
    } catch {
      showToast("Network error while recording order", "error");
    } finally {
      setSavingOrder(false);
    }
  };

  const handleSendEmailConfirmation = async (order: DBOrder) => {
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/email`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast(`Confirmation email dispatched to ${order.customerEmail || "customer"}!`, "success");
      } else {
        showToast(data.error || "Failed to dispatch email", "error");
      }
    } catch {
      showToast("Network error while sending confirmation email", "error");
    }
  };

  const handleSendWhatsAppConfirmation = (order: DBOrder) => {
    const msg = generateOrderConfirmationWhatsAppMessage(order);
    const targetPhone = order.customerPhone || "";
    const cleanPhone = targetPhone.replace(/[^0-9]/g, "");
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}` : whatsappUrl(msg);
    window.open(url, "_blank");
    showToast(`WhatsApp confirmation message opened for ${order.customerName}!`, "success");
  };

  const pendingSubmissionsCount = submissions.filter((s) => s.status === "payment_submitted").length;

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.orderId.toLowerCase().includes(search.toLowerCase()) ||
      s.senderName.toLowerCase().includes(search.toLowerCase()) ||
      s.transferReference.toLowerCase().includes(search.toLowerCase()) ||
      s.provider.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.country.toLowerCase().includes(search.toLowerCase()) ||
      (o.transferReference && o.transferReference.toLowerCase().includes(search.toLowerCase())) ||
      o.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || o.status === statusFilter || o.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalFilteredRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div>
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>Payment Verification &amp; Orders</h1>
          <p>Verify manual UBL bank transfers, review customer evidence, and manage order fulfilment.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={handleDownloadReport}
            className="admin-btn admin-btn-secondary"
            disabled={isExporting}
          >
            <Download size={16} />
            <span>{isExporting ? "Exporting..." : "Download CSV"}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="admin-btn admin-btn-primary"
          >
            <Plus size={16} />
            <span>Record Manual Sale</span>
          </button>
        </div>
      </div>

      {/* Top View Selector Tabs */}
      <div style={{ display: "flex", gap: 12, borderBottom: "1px solid var(--adm-border)", marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => { setActiveView("verifications"); setStatusFilter("all"); }}
          style={{
            padding: "10px 18px",
            background: "none",
            border: "none",
            borderBottom: activeView === "verifications" ? "2px solid var(--adm-primary)" : "2px solid transparent",
            color: activeView === "verifications" ? "#fff" : "var(--adm-muted)",
            fontWeight: activeView === "verifications" ? 700 : 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: ".95rem",
          }}
        >
          <ShieldCheck size={18} color={activeView === "verifications" ? "var(--adm-primary)" : "#94a3b8"} />
          <span>Payment Submissions</span>
          {pendingSubmissionsCount > 0 && (
            <span
              style={{
                background: "#f59e0b",
                color: "#000",
                fontSize: ".74rem",
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              {pendingSubmissionsCount} Pending
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => { setActiveView("orders"); setStatusFilter("all"); }}
          style={{
            padding: "10px 18px",
            background: "none",
            border: "none",
            borderBottom: activeView === "orders" ? "2px solid var(--adm-primary)" : "2px solid transparent",
            color: activeView === "orders" ? "#fff" : "var(--adm-muted)",
            fontWeight: activeView === "orders" ? 700 : 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: ".95rem",
          }}
        >
          <ShoppingBag size={18} color={activeView === "orders" ? "var(--adm-primary)" : "#94a3b8"} />
          <span>All Store Orders ({orders.length})</span>
        </button>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="admin-card" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search
            size={18}
            style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--adm-muted)" }}
          />
          <input
            className="admin-input"
            style={{ paddingLeft: "2.75rem" }}
            placeholder={activeView === "verifications" ? "Search by order reference, sender, or transfer ref..." : "Search orders by name, country, or reference..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {activeView === "verifications" ? (
          <select
            className="admin-select"
            style={{ width: "auto", minWidth: "200px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Submission Statuses</option>
            <option value="payment_submitted">Pending Verification</option>
            <option value="payment_verified">Verified</option>
            <option value="payment_rejected">Rejected</option>
            <option value="payment_reupload_requested">Re-upload Requested</option>
          </select>
        ) : (
          <select
            className="admin-select"
            style={{ width: "auto", minWidth: "200px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Order Statuses</option>
            <option value="payment_submitted">Payment Under Verification</option>
            <option value="payment_verified">Payment Verified</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        )}

        <button
          type="button"
          onClick={fetchOrdersAndSubmissions}
          className="admin-btn admin-btn-secondary"
          style={{ padding: "8px 12px" }}
          title="Refresh Data"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* ── VIEW 1: PAYMENT SUBMISSIONS TABLE ── */}
      {activeView === "verifications" && (
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "3rem", color: "var(--adm-muted)", textAlign: "center" }}>
              Loading payment submissions...
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div style={{ padding: "3rem", color: "var(--adm-muted)", textAlign: "center" }}>
              No payment submissions found matching your filters.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order Reference</th>
                    <th>Date</th>
                    <th>Sender &amp; Provider</th>
                    <th>Transfer Ref</th>
                    <th>Amount Sent</th>
                    <th>Receipt Proof</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((sub) => {
                    const linkedOrder = orders.find((o) => o.id === sub.orderId);
                    return (
                      <tr key={sub.id} style={{ background: sub.isDuplicateReference ? "rgba(239, 68, 68, 0.06)" : undefined }}>
                        <td>
                          <strong style={{ color: "#fff", display: "block" }}>{sub.orderId}</strong>
                          <small style={{ color: "var(--adm-muted)" }}>{linkedOrder?.customerName || "Customer"}</small>
                        </td>
                        <td>
                          <span style={{ fontSize: ".85rem", color: "#cbd5e1" }}>
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: "#fff", display: "block" }}>{sub.senderName}</strong>
                          <small style={{ color: "#38bdf8" }}>
                            {sub.provider} · {sub.senderCountry}
                          </small>
                        </td>
                        <td>
                          <code style={{ color: "#f2a928", fontSize: ".82rem", background: "rgba(242,169,40,0.1)", padding: "2px 6px", borderRadius: 4 }}>
                            {sub.transferReference}
                          </code>
                          {sub.isDuplicateReference && (
                            <small style={{ color: "#f87171", display: "block", fontSize: ".72rem", marginTop: 2, fontWeight: 700 }}>
                              ⚠️ Duplicate Ref! ({sub.duplicateMatchedOrders?.join(", ")})
                            </small>
                          )}
                        </td>
                        <td>
                          <strong style={{ color: "var(--adm-primary)", fontSize: ".95rem", display: "block" }}>
                            {sub.currencySent} {sub.amountSent.toLocaleString()}
                          </strong>
                          {linkedOrder && (
                            <small style={{ color: "var(--adm-muted)", fontSize: ".74rem" }}>
                              Total: £{linkedOrder.totalAmount}
                            </small>
                          )}
                        </td>
                        <td>
                          <a
                            href={`/api/admin/receipts/${sub.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: "4px 8px", fontSize: ".76rem", display: "inline-flex", alignItems: "center", gap: 4 }}
                          >
                            <FileText size={13} /> View Receipt <ExternalLink size={11} />
                          </a>
                        </td>
                        <td>
                          <span
                            className="admin-badge"
                            style={{
                              background:
                                sub.status === "payment_verified"
                                  ? "rgba(34, 197, 94, 0.2)"
                                  : sub.status === "payment_submitted"
                                  ? "rgba(245, 158, 11, 0.2)"
                                  : sub.status === "payment_reupload_requested"
                                  ? "rgba(56, 189, 248, 0.2)"
                                  : "rgba(239, 68, 68, 0.2)",
                              color:
                                sub.status === "payment_verified"
                                  ? "#34d399"
                                  : sub.status === "payment_submitted"
                                  ? "#fbbf24"
                                  : sub.status === "payment_reupload_requested"
                                  ? "#38bdf8"
                                  : "#f87171",
                              fontWeight: 700,
                            }}
                          >
                            {sub.status === "payment_submitted"
                              ? "Verification Pending"
                              : sub.status === "payment_verified"
                              ? "Verified/Paid"
                              : sub.status === "payment_reupload_requested"
                              ? "New Proof Requested"
                              : sub.status === "awaiting_payment"
                              ? "Not Submitted"
                              : "Rejected"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            {sub.status === "payment_submitted" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSubmission(sub);
                                    setShowVerifyModal(true);
                                  }}
                                  className="admin-btn"
                                  style={{ background: "#22c55e", color: "#000", padding: "6px 10px", fontSize: ".76rem", fontWeight: 700 }}
                                  title="Mark as Verified/Paid"
                                >
                                  Verify/Paid
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSubmission(sub);
                                    setRequestReupload(true);
                                    setShowRejectModal(true);
                                  }}
                                  className="admin-btn admin-btn-secondary"
                                  style={{ padding: "6px 8px", fontSize: ".76rem" }}
                                  title="Request New Receipt"
                                >
                                  Request Receipt
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSubmission(sub);
                                    setRequestReupload(false);
                                    setShowRejectModal(true);
                                  }}
                                  className="admin-btn"
                                  style={{ background: "rgba(239, 68, 68, 0.2)", color: "#f87171", padding: "6px 8px", fontSize: ".76rem" }}
                                  title="Reject Payment Proof"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {linkedOrder && (
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(linkedOrder)}
                                className="admin-btn admin-btn-secondary"
                                style={{ padding: "6px 10px", fontSize: ".78rem" }}
                                title="View Full Order"
                              >
                                <Eye size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── VIEW 2: ALL ORDERS TABLE ── */}
      {activeView === "orders" && (
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "3rem", color: "var(--adm-muted)", textAlign: "center" }}>
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ padding: "3rem", color: "var(--adm-muted)", textAlign: "center" }}>
              No orders found matching your search.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer Details</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment Status</th>
                    <th>Fulfilment</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong style={{ color: "#fff" }}>{order.id}</strong>
                        <small style={{ display: "block", color: "var(--adm-muted)", fontSize: ".74rem" }}>
                          {order.paymentMethod}
                        </small>
                        {order.transferReference && (
                          <small style={{ color: "#38bdf8", fontSize: ".7rem", fontFamily: "monospace", display: "block" }}>
                            Ref: {order.transferReference}
                          </small>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: ".85rem", color: "#cbd5e1" }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: "#fff", display: "block" }}>{order.customerName}</strong>
                        <small style={{ color: "var(--adm-muted)" }}>
                          📍 {order.country} {order.customerPhone ? `· ${order.customerPhone}` : ""}
                        </small>
                      </td>
                      <td>
                        <span style={{ fontSize: ".85rem", color: "#cbd5e1" }}>
                          {order.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: "var(--adm-primary)", fontSize: ".95rem", display: "block" }}>
                          £ {order.totalAmount.toLocaleString("en-GB")}
                        </strong>
                      </td>
                      <td>
                        <span
                          className="admin-badge"
                          style={{
                            background:
                              order.paymentStatus === "payment_verified" || order.status === "completed"
                                ? "rgba(34, 197, 94, 0.2)"
                                : order.paymentStatus === "payment_submitted"
                                ? "rgba(245, 158, 11, 0.2)"
                                : "rgba(100, 116, 139, 0.2)",
                            color:
                              order.paymentStatus === "payment_verified" || order.status === "completed"
                                ? "#34d399"
                                : order.paymentStatus === "payment_submitted"
                                ? "#fbbf24"
                                : "#cbd5e1",
                            fontWeight: 700,
                          }}
                        >
                          {order.paymentStatus === "payment_submitted"
                            ? "Under Verification"
                            : order.paymentStatus === "payment_verified"
                            ? "Verified"
                            : order.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className="admin-badge admin-badge-confirmed" style={{ fontSize: ".75rem" }}>
                          {order.fulfilmentStatus || "new"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: "6px 12px", fontSize: ".78rem" }}
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL 1: VERIFY PAYMENT MODAL ── */}
      {showVerifyModal && selectedSubmission && (
        <div className="admin-modal-backdrop" onClick={() => setShowVerifyModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="admin-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="admin-modal-badge" style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#fff" }}>Verify UBL Bank Transfer</h3>
                  <span style={{ color: "var(--adm-muted)", fontSize: ".82rem" }}>Order Reference: #{selectedSubmission.orderId}</span>
                </div>
              </div>
              <button className="admin-modal-close" onClick={() => setShowVerifyModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 20 }}>
              {/* Evidence Details Summary */}
              <div style={{ background: "rgba(0,0,0,0.3)", padding: 14, borderRadius: 10, marginBottom: 16, fontSize: ".84rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><span style={{ color: "var(--adm-muted)", display: "block" }}>Sender Name</span><strong>{selectedSubmission.senderName}</strong></div>
                <div><span style={{ color: "var(--adm-muted)", display: "block" }}>Transfer Provider</span><strong>{selectedSubmission.provider} ({selectedSubmission.senderCountry})</strong></div>
                <div><span style={{ color: "var(--adm-muted)", display: "block" }}>Transfer Reference</span><strong style={{ color: "#f2a928", fontFamily: "monospace" }}>{selectedSubmission.transferReference}</strong></div>
                <div><span style={{ color: "var(--adm-muted)", display: "block" }}>Amount Sent</span><strong style={{ color: "#4ade80" }}>{selectedSubmission.currencySent} {selectedSubmission.amountSent}</strong></div>
              </div>

              {/* Receipt Link */}
              <div style={{ marginBottom: 16 }}>
                <a
                  href={`/api/admin/receipts/${selectedSubmission.id}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(56, 189, 248, 0.08)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    padding: "10px 14px",
                    borderRadius: 8,
                    color: "#38bdf8",
                    fontSize: ".84rem",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <FileText size={16} /> Open Customer Receipt Proof ({selectedSubmission.receiptOriginalName})
                  </span>
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Internal Note */}
              <div className="admin-form-group" style={{ marginBottom: 16 }}>
                <label>Internal Verification Note (Optional)</label>
                <input
                  className="admin-input"
                  placeholder="e.g. Verified in UBL app statement against ref TXN-12345"
                  value={adminVerifyNote}
                  onChange={(e) => setAdminVerifyNote(e.target.value)}
                />
              </div>

              {/* Required Confirmation Lock */}
              <div style={{ background: "rgba(242, 169, 40, 0.08)", border: "1px solid rgba(242, 169, 40, 0.3)", borderRadius: 10, padding: 14, marginBottom: 20 }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: ".82rem", color: "#f2a928", lineHeight: 1.4 }}>
                  <input
                    type="checkbox"
                    checked={confirmUblChecked}
                    onChange={(e) => setConfirmUblChecked(e.target.checked)}
                    style={{ marginTop: 2, accentColor: "#22c55e", width: 16, height: 16 }}
                  />
                  <span>
                    <strong>Mandatory Confirmation:</strong> I confirm that I have checked the actual <strong>UBL account ({UBL_PAYMENT_CONFIG.beneficiaryFullName})</strong> or bank statement and verified that the funds have been credited.
                  </span>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="admin-btn admin-btn-secondary"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyPayment}
                  className="admin-btn"
                  style={{ background: "#22c55e", color: "#000", fontWeight: 700 }}
                  disabled={!confirmUblChecked || actionLoading}
                >
                  {actionLoading ? "Verifying..." : "Confirm & Mark Payment Verified"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: REJECT PAYMENT MODAL ── */}
      {showRejectModal && selectedSubmission && (
        <div className="admin-modal-backdrop" onClick={() => setShowRejectModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="admin-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="admin-modal-badge" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171" }}>
                  <XCircle size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#fff" }}>Reject Payment Evidence</h3>
                  <span style={{ color: "var(--adm-muted)", fontSize: ".82rem" }}>Order Reference: #{selectedSubmission.orderId}</span>
                </div>
              </div>
              <button className="admin-modal-close" onClick={() => setShowRejectModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 20 }}>
              <div className="admin-form-group" style={{ marginBottom: 16 }}>
                <label>Rejection Reason * (Will be communicated to customer)</label>
                <textarea
                  className="admin-input"
                  rows={3}
                  placeholder="e.g. Transaction reference not found in UBL account, amount sent does not match, or receipt is unreadable..."
                  value={adminRejectReason}
                  onChange={(e) => setAdminRejectReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".84rem", color: "#cbd5e1", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={requestReupload}
                    onChange={(e) => setRequestReupload(e.target.checked)}
                    style={{ accentColor: "var(--adm-primary)" }}
                  />
                  <span>Allow customer to re-upload new payment proof</span>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="admin-btn admin-btn-secondary"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectPayment}
                  className="admin-btn"
                  style={{ background: "#ef4444", color: "#fff" }}
                  disabled={!adminRejectReason.trim() || actionLoading}
                >
                  {actionLoading ? "Submitting..." : "Reject Submission"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: FULL ORDER DETAILS ── */}
      {selectedOrder && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#fff" }}>Order #{selectedOrder.id}</h3>
                <span style={{ color: "var(--adm-muted)", fontSize: ".82rem" }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "rgba(0,0,0,0.3)", padding: 14, borderRadius: 10, marginBottom: 18, fontSize: ".84rem" }}>
                <div><span style={{ color: "var(--adm-muted)", display: "block" }}>Customer</span><strong>{selectedOrder.customerName}</strong></div>
                <div><span style={{ color: "var(--adm-muted)", display: "block" }}>Phone / WhatsApp</span><strong>{selectedOrder.customerPhone || "—"}</strong></div>
                <div><span style={{ color: "var(--adm-muted)", display: "block" }}>Email</span><strong>{selectedOrder.customerEmail || "—"}</strong></div>
                <div><span style={{ color: "var(--adm-muted)", display: "block" }}>Destination</span><strong>{selectedOrder.country}</strong></div>
                <div><span style={{ color: "var(--adm-muted)", display: "block" }}>Payment Method</span><strong>{selectedOrder.paymentMethod}</strong></div>
                <div>
                  <span style={{ color: "var(--adm-muted)", display: "block" }}>Payment Status</span>
                  <strong style={{
                    color:
                      selectedOrder.paymentStatus === "payment_verified"
                        ? "#4ade80"
                        : selectedOrder.paymentStatus === "payment_reupload_requested"
                        ? "#38bdf8"
                        : selectedOrder.paymentStatus === "payment_rejected"
                        ? "#f87171"
                        : "#fbbf24",
                  }}>
                    {selectedOrder.paymentStatus === "payment_submitted"
                      ? "Verification Pending"
                      : selectedOrder.paymentStatus === "payment_verified"
                      ? "Verified/Paid"
                      : selectedOrder.paymentStatus === "payment_reupload_requested"
                      ? "New Proof Requested"
                      : selectedOrder.paymentStatus === "awaiting_payment"
                      ? "Not Submitted"
                      : selectedOrder.paymentStatus || selectedOrder.status}
                  </strong>
                </div>
              </div>

              {/* Payment Evidence Breakdown */}
              {(() => {
                const linkedSub = submissions.find((s) => s.orderId === selectedOrder.id);
                if (!linkedSub) return null;
                return (
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: 14, borderRadius: 10, marginBottom: 18, fontSize: ".84rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <h4 style={{ margin: 0, fontSize: ".88rem", color: "var(--adm-primary)", textTransform: "uppercase", letterSpacing: ".04em" }}>
                        Payment Submission Details
                      </h4>
                      {linkedSub.status === "payment_submitted" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSubmission(linkedSub);
                              setShowVerifyModal(true);
                            }}
                            className="admin-btn"
                            style={{ background: "#22c55e", color: "#000", padding: "4px 8px", fontSize: ".74rem", fontWeight: 700 }}
                          >
                            Verify/Paid
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSubmission(linkedSub);
                              setRequestReupload(true);
                              setShowRejectModal(true);
                            }}
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: "4px 8px", fontSize: ".74rem" }}
                          >
                            Request New Receipt
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSubmission(linkedSub);
                              setRequestReupload(false);
                              setShowRejectModal(true);
                            }}
                            className="admin-btn"
                            style={{ background: "rgba(239, 68, 68, 0.2)", color: "#f87171", padding: "4px 8px", fontSize: ".74rem" }}
                          >
                            Reject Proof
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div><span style={{ color: "var(--adm-muted)", display: "block" }}>Payment Method Used</span><strong>{linkedSub.provider || selectedOrder.paymentMethod}</strong></div>
                      <div><span style={{ color: "var(--adm-muted)", display: "block" }}>Sender's Name</span><strong>{linkedSub.senderName} ({linkedSub.senderCountry})</strong></div>
                      <div><span style={{ color: "var(--adm-muted)", display: "block" }}>Transfer Reference</span><strong style={{ color: "#f2a928", fontFamily: "monospace" }}>{linkedSub.transferReference}</strong></div>
                      <div><span style={{ color: "var(--adm-muted)", display: "block" }}>Amount &amp; Currency</span><strong style={{ color: "#4ade80" }}>{linkedSub.currencySent} {linkedSub.amountSent}</strong></div>
                      <div><span style={{ color: "var(--adm-muted)", display: "block" }}>Payment Date</span><strong>{linkedSub.transferDate}</strong></div>
                      <div>
                        <span style={{ color: "var(--adm-muted)", display: "block" }}>Receipt File</span>
                        <a
                          href={`/api/admin/receipts/${linkedSub.id}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#38bdf8", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}
                        >
                          <FileText size={14} /> Open Receipt ({linkedSub.receiptOriginalName}) <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Items Table */}
              <h4 style={{ margin: "0 0 8px", fontSize: ".9rem" }}>Purchased Items</h4>
              <table className="admin-table" style={{ background: "#09101d", marginBottom: 18 }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: "center" }}>Qty</th>
                    <th style={{ textAlign: "right" }}>Unit Price</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td><strong>{it.name}</strong></td>
                      <td style={{ textAlign: "center" }}>{it.quantity}</td>
                      <td style={{ textAlign: "right" }}>£ {it.price}</td>
                      <td style={{ textAlign: "right", color: "var(--adm-primary)", fontWeight: 700 }}>£ {it.price * it.quantity}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3} style={{ textAlign: "right", fontWeight: 700 }}>Total Order Value:</td>
                    <td style={{ textAlign: "right", fontWeight: 800, color: "var(--adm-primary)", fontSize: "1.1rem" }}>£ {selectedOrder.totalAmount}</td>
                  </tr>
                </tbody>
              </table>

              {selectedOrder.notes && (
                <div style={{ background: "#09101d", padding: 12, borderRadius: 8, fontSize: ".82rem", marginBottom: 18, color: "#cbd5e1", whiteSpace: "pre-line" }}>
                  <strong style={{ color: "var(--adm-primary)", display: "block", marginBottom: 4 }}>Order &amp; Evidence Notes:</strong>
                  {selectedOrder.notes}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => handleSendWhatsAppConfirmation(selectedOrder)}
                  className="admin-btn"
                  style={{ background: "#22c55e", color: "#000", fontWeight: 700 }}
                >
                  <MessageCircle size={15} /> WhatsApp Invoice
                </button>
                <button
                  type="button"
                  onClick={() => handleSendEmailConfirmation(selectedOrder)}
                  className="admin-btn admin-btn-secondary"
                >
                  <Mail size={15} /> Email Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="admin-btn admin-btn-primary"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: RECORD MANUAL SALE ── */}
      {showAddModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#fff" }}>Record New Direct Sale</h3>
              <button className="admin-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} style={{ padding: 20 }}>
              <div className="admin-form-group" style={{ marginBottom: 12 }}>
                <label>Customer Full Name *</label>
                <input
                  className="admin-input"
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div className="admin-form-group">
                  <label>WhatsApp / Phone</label>
                  <input
                    className="admin-input"
                    value={newOrder.customerPhone}
                    onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Destination Country</label>
                  <input
                    className="admin-input"
                    value={newOrder.country}
                    onChange={(e) => setNewOrder({ ...newOrder, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group" style={{ marginBottom: 12 }}>
                <label>Product Name *</label>
                <input
                  className="admin-input"
                  placeholder="e.g. VVIP Bonafide Players Bat"
                  value={newOrder.productName}
                  onChange={(e) => setNewOrder({ ...newOrder, productName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div className="admin-form-group">
                  <label>Price (£ GBP) *</label>
                  <input
                    className="admin-input"
                    type="number"
                    value={newOrder.price}
                    onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Quantity</label>
                  <input
                    className="admin-input"
                    type="number"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group" style={{ marginBottom: 20 }}>
                <label>Order Notes</label>
                <textarea
                  className="admin-input"
                  rows={2}
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="admin-btn admin-btn-secondary"
                  disabled={savingOrder}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={savingOrder}
                >
                  {savingOrder ? "Saving..." : "Record Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
