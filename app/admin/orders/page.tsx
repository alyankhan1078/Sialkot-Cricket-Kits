"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Trash2,
  Eye,
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
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Send,
  Sparkles,
  Package,
  Truck,
  Layers,
  ChevronRight,
  Info,
  Copy,
} from "lucide-react";
import { formatPrice } from "@/src/data/products";
import type { DBOrder, DBPaymentSubmission, DBPaymentStatusHistory } from "@/src/lib/data-service";
import type { NotificationLog } from "@/src/lib/notifications";
import { useAdminFeedback } from "@/src/components/AdminFeedbackContext";
import { whatsappUrl } from "@/src/lib/whatsapp";
import { UBL_PAYMENT_CONFIG } from "@/src/lib/payment-config";

type EnrichedPaymentSubmission = DBPaymentSubmission & {
  isDuplicateReference?: boolean;
  duplicateMatchedOrders?: string[];
  history?: DBPaymentStatusHistory[];
  order?: DBOrder | null;
  notificationLogs?: NotificationLog[];
};

type EnrichedOrder = DBOrder & {
  paymentSubmission?: DBPaymentSubmission | null;
  notificationLogs?: NotificationLog[];
};

export default function AdminOrdersPage() {
  const { showToast, confirmAction } = useAdminFeedback();

  const [activeTab, setActiveTab] = useState<"verification" | "pipeline">("verification");
  const [submissions, setSubmissions] = useState<EnrichedPaymentSubmission[]>([]);
  const [orders, setOrders] = useState<EnrichedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [pipelineFilter, setPipelineFilter] = useState<string>("all");

  // Selection & Modals
  const [selectedSubmission, setSelectedSubmission] = useState<EnrichedPaymentSubmission | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<EnrichedOrder | null>(null);
  const [receiptModalUrl, setReceiptModalUrl] = useState<string | null>(null);
  const [receiptModalTitle, setReceiptModalTitle] = useState<string>("");

  // Verification & Rejection Modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [confirmUblChecked, setConfirmUblChecked] = useState(false);
  const [adminVerifyNote, setAdminVerifyNote] = useState("");
  const [adminRejectReason, setAdminRejectReason] = useState("");
  const [requestReupload, setRequestReupload] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Status update modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatusValue, setNewStatusValue] = useState<string>("in_production");
  const [statusNote, setStatusNote] = useState("");

  // CSV Export
  const [isExporting, setIsExporting] = useState(false);

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [psubsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/payments"),
        fetch("/api/admin/orders"),
      ]);

      const [psubsJson, ordersJson] = await Promise.all([
        psubsRes.json().catch(() => ({ success: false })),
        ordersRes.json().catch(() => ({ success: false })),
      ]);

      if (psubsJson.success && Array.isArray(psubsJson.data)) {
        setSubmissions(psubsJson.data);
      }
      if (ordersJson.success && Array.isArray(ordersJson.data)) {
        setOrders(ordersJson.data);
      }
    } catch {
      showToast("Unable to load latest orders from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quick Copy Helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, "success");
  };

  // ── Verification Action (Verify Payment & Confirm Order) ──
  const handleVerifyPayment = async () => {
    if (!selectedSubmission) return;
    if (!confirmUblChecked) {
      showToast("Please check the box confirming verification in the official UBL bank account.", "error");
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
          adminEmail: "sialkotcricketkits@gmail.com",
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          `Payment for Order #${selectedSubmission.orderId} verified & confirmed! Customer notified by Email & WhatsApp.`,
          "success"
        );
        setShowVerifyModal(false);
        setConfirmUblChecked(false);
        setAdminVerifyNote("");
        fetchData();
      } else {
        showToast(data.error || "Failed to verify payment", "error");
      }
    } catch {
      showToast("Network error while verifying payment", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Rejection Action ──
  const handleRejectPayment = async () => {
    if (!selectedSubmission) return;
    if (!adminRejectReason.trim()) {
      showToast("Please provide a reason for rejection.", "error");
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
          adminEmail: "sialkotcricketkits@gmail.com",
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Payment marked as ${requestReupload ? "re-upload requested" : "rejected"}`, "info");
        setShowRejectModal(false);
        setAdminRejectReason("");
        setRequestReupload(false);
        fetchData();
      } else {
        showToast(data.error || "Failed to reject payment", "error");
      }
    } catch {
      showToast("Network error while rejecting payment", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Lifecycle Status Update ──
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatusValue,
          note: statusNote,
          adminEmail: "sialkotcricketkits@gmail.com",
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Order #${selectedOrder.id} status updated to "${newStatusValue.replace(/_/g, " ").toUpperCase()}"`, "success");
        setShowStatusModal(false);
        setStatusNote("");
        fetchData();
      } else {
        showToast(data.error || "Failed to update order status", "error");
      }
    } catch {
      showToast("Network error while updating order status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Retry Notification ──
  const handleRetryNotification = async (orderId: string, type: "order_received" | "order_confirmed") => {
    try {
      showToast("Dispatching notification retry...", "info");
      const res = await fetch(`/api/admin/orders/${orderId}/notifications/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Notification retried for Order #${orderId}`, "success");
        fetchData();
      } else {
        showToast(data.error || "Failed to retry notification", "error");
      }
    } catch {
      showToast("Network error while retrying notification", "error");
    }
  };

  // ── CSV Export ──
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

  // Pending Count
  const pendingVerificationCount = submissions.filter((s) => s.status === "payment_submitted").length;

  // Filter Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    if (verificationFilter !== "all" && sub.status !== verificationFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = sub.orderId.toLowerCase().includes(q) || sub.id.toLowerCase().includes(q);
      const matchSender = sub.senderName.toLowerCase().includes(q);
      const matchRef = sub.transferReference.toLowerCase().includes(q);
      const matchCustomer = sub.order?.customerName?.toLowerCase().includes(q) || false;
      const matchEmail = sub.order?.customerEmail?.toLowerCase().includes(q) || false;
      return matchId || matchSender || matchRef || matchCustomer || matchEmail;
    }
    return true;
  });

  // Filter Orders
  const filteredOrders = orders.filter((o) => {
    if (pipelineFilter !== "all" && o.status !== pipelineFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        o.country.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Helpers for Status Labels & Styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "payment_submitted":
        return <span className="sck-badge sck-badge-warning"><Clock size={12} /> Payment Verification Pending</span>;
      case "payment_verified":
        return <span className="sck-badge sck-badge-success"><CheckCircle2 size={12} /> Payment Verified</span>;
      case "order_confirmed":
        return <span className="sck-badge sck-badge-success"><ShieldCheck size={12} /> Order Confirmed</span>;
      case "in_production":
        return <span className="sck-badge sck-badge-info"><Layers size={12} /> In Production</span>;
      case "ready_for_dispatch":
        return <span className="sck-badge sck-badge-info"><Package size={12} /> Ready for Dispatch</span>;
      case "dispatched":
        return <span className="sck-badge sck-badge-purple"><Truck size={12} /> Dispatched</span>;
      case "delivered":
        return <span className="sck-badge sck-badge-success"><Check size={12} /> Delivered</span>;
      case "payment_rejected":
      case "rejected":
      case "cancelled":
        return <span className="sck-badge sck-badge-danger"><XCircle size={12} /> Rejected / Cancelled</span>;
      case "payment_reupload_requested":
        return <span className="sck-badge sck-badge-warning"><RefreshCw size={12} /> Re-upload Requested</span>;
      default:
        return <span className="sck-badge sck-badge-secondary">{status.replace(/_/g, " ").toUpperCase()}</span>;
    }
  };

  return (
    <div className="admin-page-container">
      {/* Top Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Order Management &amp; Payment Verification</h1>
          <p className="admin-page-subtitle">
            Inspect manual bank transfers, verify customer payment receipts against UBL records, confirm orders, and manage worldwide production dispatch.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="admin-btn admin-btn-secondary"
            title="Refresh latest orders and payment submissions"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={isExporting}
            className="admin-btn admin-btn-secondary"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="admin-tabs-nav" style={{ display: "flex", gap: 12, borderBottom: "2px solid #334155", marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => setActiveTab("verification")}
          className={`admin-tab-btn ${activeTab === "verification" ? "active" : ""}`}
          style={{
            padding: "12px 20px",
            fontWeight: 700,
            fontSize: "0.95rem",
            background: "none",
            border: "none",
            borderBottom: activeTab === "verification" ? "3px solid #f59e0b" : "3px solid transparent",
            color: activeTab === "verification" ? "#f59e0b" : "#94a3b8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CreditCard size={18} />
          <span>Payment Verification</span>
          {pendingVerificationCount > 0 && (
            <span style={{ background: "#ef4444", color: "#fff", padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 800 }}>
              {pendingVerificationCount} Pending
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pipeline")}
          className={`admin-tab-btn ${activeTab === "pipeline" ? "active" : ""}`}
          style={{
            padding: "12px 20px",
            fontWeight: 700,
            fontSize: "0.95rem",
            background: "none",
            border: "none",
            borderBottom: activeTab === "pipeline" ? "3px solid #38bdf8" : "3px solid transparent",
            color: activeTab === "pipeline" ? "#38bdf8" : "#94a3b8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <ShoppingBag size={18} />
          <span>All Orders &amp; Production Pipeline</span>
          <span style={{ background: "#334155", color: "#cbd5e1", padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem" }}>
            {orders.length}
          </span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", minWidth: 320, flex: 1 }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, WhatsApp, Reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: 40, width: "100%" }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {activeTab === "verification" ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { id: "all", label: "All Submissions" },
              { id: "payment_submitted", label: "Verification Pending" },
              { id: "payment_verified", label: "Verified" },
              { id: "payment_rejected", label: "Rejected" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setVerificationFilter(f.id)}
                className={`admin-filter-pill ${verificationFilter === f.id ? "active" : ""}`}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "1px solid",
                  background: verificationFilter === f.id ? "#f59e0b" : "#1e293b",
                  color: verificationFilter === f.id ? "#000" : "#cbd5e1",
                  borderColor: verificationFilter === f.id ? "#f59e0b" : "#334155",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { id: "all", label: "All Orders" },
              { id: "payment_submitted", label: "Pending Verification" },
              { id: "order_confirmed", label: "Confirmed" },
              { id: "in_production", label: "In Production" },
              { id: "ready_for_dispatch", label: "Ready to Dispatch" },
              { id: "dispatched", label: "Dispatched" },
              { id: "delivered", label: "Delivered" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setPipelineFilter(f.id)}
                className={`admin-filter-pill ${pipelineFilter === f.id ? "active" : ""}`}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "1px solid",
                  background: pipelineFilter === f.id ? "#38bdf8" : "#1e293b",
                  color: pipelineFilter === f.id ? "#000" : "#cbd5e1",
                  borderColor: pipelineFilter === f.id ? "#38bdf8" : "#334155",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 1: PAYMENT VERIFICATION LIST / DETAILED SUBMISSION CARDS
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "verification" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {filteredSubmissions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#131b26", borderRadius: 12, border: "1px solid #1e293b" }}>
              <CreditCard size={48} style={{ color: "#64748b", margin: "0 auto 16px" }} />
              <h3 style={{ color: "#f8fafc", margin: "0 0 8px" }}>No Payment Submissions Found</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>
                {searchQuery || verificationFilter !== "all"
                  ? "No submissions matched your search criteria."
                  : "When customers complete manual checkout and attach their transfer receipt, submissions will appear here for verification."}
              </p>
            </div>
          ) : (
            filteredSubmissions.map((sub) => {
              const order = sub.order;
              const isPending = sub.status === "payment_submitted";
              const isVerified = sub.status === "payment_verified" || order?.status === "order_confirmed";
              const cleanPhone = (order?.customerPhone || "").replace(/[^0-9+]/g, "");

              return (
                <div
                  key={sub.id}
                  style={{
                    background: "#131b26",
                    border: isPending ? "2px solid #f59e0b" : "1px solid #233044",
                    borderRadius: 12,
                    padding: 24,
                    boxShadow: isPending ? "0 0 20px rgba(245, 158, 11, 0.15)" : "none",
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, borderBottom: "1px solid #1e293b", paddingBottom: 16, marginBottom: 18, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#f8fafc" }}>
                        Order #{sub.orderId}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(sub.orderId, "Order ID")}
                        style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}
                      >
                        <Copy size={13} /> Copy ID
                      </button>

                      <Link
                        href={`/checkout/invoice/${encodeURIComponent(sub.orderId)}`}
                        target="_blank"
                        style={{ color: "#38bdf8", fontSize: "0.8rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                      >
                        <ExternalLink size={13} /> View Invoice
                      </Link>

                      {sub.isDuplicateReference && (
                        <span style={{ background: "#7f1d1d", color: "#fecaca", padding: "3px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                          <AlertTriangle size={13} /> DUPLICATE REFERENCE DETECTED
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: "#94a3b8", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={13} /> {new Date(sub.createdAt).toLocaleString()}
                      </span>
                      {getStatusBadge(sub.status)}
                    </div>
                  </div>

                  {/* Card Body Columns */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 20 }}>
                    {/* Col 1: Customer Info */}
                    <div style={{ background: "#0c131d", padding: 16, borderRadius: 8, border: "1px solid #1e293b" }}>
                      <h4 style={{ color: "#94a3b8", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                        <Phone size={14} color="#38bdf8" /> Customer &amp; Delivery
                      </h4>
                      <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#f8fafc", fontSize: "1rem" }}>
                        {order?.customerName || sub.senderName}
                      </p>
                      {order?.customerEmail && (
                        <p style={{ margin: "0 0 6px", color: "#94a3b8", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
                          <Mail size={13} /> {order.customerEmail}
                        </p>
                      )}
                      {order?.customerPhone && (
                        <div style={{ margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "0.9rem" }}>
                            {order.customerPhone}
                          </span>
                          <a
                            href={whatsappUrl(`Hello ${order.customerName}, regarding your Sialkot Cricket Kits order #${sub.orderId}`, cleanPhone)}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              background: "#15803d",
                              color: "#fff",
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <MessageCircle size={12} /> WhatsApp
                          </a>
                        </div>
                      )}
                      <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.82rem", lineHeight: 1.4, display: "flex", alignItems: "flex-start", gap: 6 }}>
                        <MapPin size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>
                          {order?.address ? `${order.address}, ${order.city || ""}, ${order.state || ""} ${order.postalCode || ""}, ${order.country}` : `Destination: ${sub.senderCountry}`}
                        </span>
                      </p>
                    </div>

                    {/* Col 2: Ordered Products & Custom Bat Specs */}
                    <div style={{ background: "#0c131d", padding: 16, borderRadius: 8, border: "1px solid #1e293b" }}>
                      <h4 style={{ color: "#94a3b8", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                        <ShoppingBag size={14} color="#f59e0b" /> Equipment Ordered
                      </h4>
                      {order?.items && order.items.length > 0 ? (
                        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 10px", display: "flex", flexDirection: "column", gap: 6 }}>
                          {order.items.map((it, idx) => (
                            <li key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#f8fafc" }}>
                              <span>• {it.quantity}x {it.name}</span>
                              <span style={{ color: "#f59e0b", fontWeight: 700 }}>{formatPrice(it.price * it.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>Equipment details attached in order notes.</p>
                      )}

                      {/* Custom Bat Specs if in notes */}
                      {order?.notes && order.notes.includes("CUSTOM BAT") && (
                        <div style={{ background: "#1a1608", border: "1px solid #78350f", padding: 8, borderRadius: 6, fontSize: "0.75rem", color: "#fde68a", whiteSpace: "pre-line" }}>
                          <strong style={{ color: "#f59e0b" }}>🪵 Bespoke Bat Specs:</strong><br />
                          {order.notes.split("--- CUSTOM BAT SPECIFICATIONS ---")[1]?.split("\n\n")[0] || "Custom Bat Specs Attached"}
                        </div>
                      )}
                    </div>

                    {/* Col 3: Payment Evidence & Receipt */}
                    <div style={{ background: "#0c131d", padding: 16, borderRadius: 8, border: "1px solid #1e293b" }}>
                      <h4 style={{ color: "#94a3b8", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                        <CreditCard size={14} color="#10b981" /> Payment Evidence
                      </h4>
                      <div style={{ fontSize: "0.85rem", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                        <div><strong>Provider:</strong> {sub.provider}</div>
                        <div><strong>Amount Sent:</strong> <span style={{ color: "#10b981", fontWeight: 800 }}>£{sub.amountSent} {sub.currencySent}</span> (of £{order?.totalAmount || sub.amountSent})</div>
                        <div>
                          <strong>Transfer Reference:</strong>{" "}
                          <span style={{ fontFamily: "monospace", color: "#f59e0b", fontWeight: 700 }}>
                            {sub.transferReference}
                          </span>
                        </div>
                        {sub.customerNote && (
                          <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                            <strong>Customer Note:</strong> "{sub.customerNote}"
                          </div>
                        )}
                      </div>

                      {/* Receipt Viewer CTA */}
                      {sub.receiptStoragePath ? (
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptModalUrl(`/api/admin/receipts/${sub.id}`);
                            setReceiptModalTitle(`Payment Receipt — Order #${sub.orderId} (Ref: ${sub.transferReference})`);
                          }}
                          className="admin-btn admin-btn-secondary"
                          style={{ width: "100%", justifyContent: "center", fontSize: "0.8rem", padding: "8px 12px", background: "#1e293b", color: "#38bdf8" }}
                        >
                          <Eye size={14} /> View Attached Receipt Proof
                        </button>
                      ) : (
                        <span style={{ color: "#64748b", fontSize: "0.8rem" }}>No receipt document uploaded</span>
                      )}
                    </div>
                  </div>

                  {/* Multi-Channel Notification Status Bar */}
                  <div style={{ background: "#0a0f18", padding: "10px 14px", borderRadius: 6, border: "1px solid #1b2533", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: "0.78rem", color: "#94a3b8", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, color: "#cbd5e1" }}>Automated Notifications:</span>
                      
                      {/* Email Status */}
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Mail size={12} color={order?.customerEmail ? "#38bdf8" : "#64748b"} />
                        Customer Email: {order?.customerEmail ? <span style={{ color: "#4ade80", fontWeight: 700 }}>Sent</span> : <span style={{ color: "#94a3b8" }}>N/A</span>}
                      </span>

                      {/* WhatsApp Status */}
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <MessageCircle size={12} color={order?.customerPhone ? "#22c55e" : "#64748b"} />
                        Customer WhatsApp: {order?.customerPhone ? <span style={{ color: "#4ade80", fontWeight: 700 }}>Sent / Scheduled</span> : <span style={{ color: "#94a3b8" }}>N/A</span>}
                      </span>

                      {/* Admin Alert */}
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <ShieldCheck size={12} color="#f59e0b" />
                        Admin Alert: <span style={{ color: "#4ade80", fontWeight: 700 }}>Sent</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRetryNotification(sub.orderId, isVerified ? "order_confirmed" : "order_received")}
                      style={{ background: "none", border: "none", color: "#38bdf8", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Send size={11} /> Resend Notification
                    </button>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      {sub.verifiedBy && (
                        <span style={{ fontSize: "0.78rem", color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle2 size={13} /> Verified by {sub.verifiedBy} on {new Date(sub.verifiedAt || "").toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      {isPending ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setShowRejectModal(true);
                            }}
                            className="admin-btn"
                            style={{ background: "#7f1d1d", color: "#fecaca", border: "1px solid #991b1b" }}
                          >
                            <XCircle size={15} /> Reject / Re-upload
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setShowVerifyModal(true);
                            }}
                            className="admin-btn"
                            style={{
                              background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                              color: "#ffffff",
                              fontWeight: 800,
                              boxShadow: "0 4px 14px rgba(22, 163, 74, 0.4)",
                              padding: "10px 20px",
                            }}
                          >
                            <ShieldCheck size={17} /> VERIFY PAYMENT AND CONFIRM ORDER
                          </button>
                        </>
                      ) : (
                        <div style={{ display: "flex", gap: 10 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrder(order || null);
                              setNewStatusValue(order?.status || "in_production");
                              setShowStatusModal(true);
                            }}
                            className="admin-btn admin-btn-secondary"
                          >
                            <Layers size={14} /> Update Lifecycle Status
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 2: ALL ORDERS & PRODUCTION PIPELINE
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "pipeline" && (
        <div style={{ background: "#131b26", borderRadius: 12, border: "1px solid #233044", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0c131d", borderBottom: "1px solid #1e293b", textAlign: "left", color: "#94a3b8", fontSize: "0.78rem", textTransform: "uppercase" }}>
                  <th style={{ padding: "14px 16px" }}>Order ID &amp; Date</th>
                  <th style={{ padding: "14px 16px" }}>Customer Details</th>
                  <th style={{ padding: "14px 16px" }}>Equipment Ordered</th>
                  <th style={{ padding: "14px 16px" }}>Total Amount</th>
                  <th style={{ padding: "14px 16px" }}>Payment &amp; Lifecycle Status</th>
                  <th style={{ padding: "14px 16px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                      No orders found matching the filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} style={{ borderBottom: "1px solid #1b2533" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 800, color: "#f8fafc", fontSize: "0.92rem" }}>
                          #{o.id}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: "0.9rem" }}>
                          {o.customerName}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                          {o.country} {o.customerPhone ? `• ${o.customerPhone}` : ""}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                          {o.items.map((it) => `${it.quantity}x ${it.name}`).join(", ") || "Custom Specs"}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 800, color: "#f59e0b", fontSize: "0.95rem" }}>
                          {formatPrice(o.totalAmount)}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                          {o.paymentMethod || "Bank Transfer"}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {getStatusBadge(o.status)}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrder(o);
                              setNewStatusValue(o.status);
                              setShowStatusModal(true);
                            }}
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                            title="Update status"
                          >
                            <Layers size={13} /> Update Status
                          </button>
                          <Link
                            href={`/checkout/invoice/${encodeURIComponent(o.id)}`}
                            target="_blank"
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: "6px 10px", fontSize: "0.75rem", textDecoration: "none" }}
                            title="Print Invoice"
                          >
                            <Printer size={13} /> Invoice
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: VERIFY PAYMENT AND CONFIRM ORDER
      ───────────────────────────────────────────────────────────────────────────── */}
      {showVerifyModal && selectedSubmission && (
        <div className="admin-modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#131b26", border: "1px solid #233044", borderRadius: 14, maxWidth: 540, width: "100%", padding: 24, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: "#22c55e", display: "flex", alignItems: "center", gap: 8, fontSize: "1.2rem" }}>
                <ShieldCheck size={22} /> Verify Payment &amp; Confirm Order
              </h3>
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: "#0c131d", padding: 16, borderRadius: 8, border: "1px solid #1e293b", marginBottom: 16, fontSize: "0.85rem", color: "#cbd5e1" }}>
              <div><strong>Order ID:</strong> #{selectedSubmission.orderId}</div>
              <div><strong>Customer:</strong> {selectedSubmission.order?.customerName || selectedSubmission.senderName}</div>
              <div><strong>Transfer Reference:</strong> <span style={{ color: "#f59e0b", fontFamily: "monospace" }}>{selectedSubmission.transferReference}</span></div>
              <div><strong>Amount Sent:</strong> <span style={{ color: "#22c55e", fontWeight: 700 }}>£{selectedSubmission.amountSent}</span></div>
              <div><strong>Beneficiary Account:</strong> ALYAN WAZIR (UBL Bank)</div>
            </div>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 18, fontSize: "0.88rem", color: "#f8fafc" }}>
              <input
                type="checkbox"
                checked={confirmUblChecked}
                onChange={(e) => setConfirmUblChecked(e.target.checked)}
                style={{ width: 18, height: 18, marginTop: 2, accentColor: "#16a34a" }}
              />
              <span>
                I confirm that I have verified the credit of <strong>£{selectedSubmission.amountSent}</strong> in the official <strong>UBL Bank Account (ALYAN WAZIR)</strong>.
              </span>
            </label>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
                Internal Verification Note (Optional):
              </label>
              <textarea
                value={adminVerifyNote}
                onChange={(e) => setAdminVerifyNote(e.target.value)}
                placeholder="e.g. Verified in UBL app transaction feed ending in ...124"
                className="admin-input"
                rows={2}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)", padding: 12, borderRadius: 8, marginBottom: 20, fontSize: "0.8rem", color: "#86efac" }}>
              ✅ <strong>Automatic Customer Notifications:</strong> Confirming this order will immediately send the official Order Confirmation Email and WhatsApp message to the customer.
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                disabled={actionLoading}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleVerifyPayment}
                disabled={!confirmUblChecked || actionLoading}
                className="admin-btn"
                style={{
                  background: confirmUblChecked ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" : "#475569",
                  color: "#ffffff",
                  fontWeight: 800,
                  opacity: confirmUblChecked ? 1 : 0.6,
                  cursor: confirmUblChecked ? "pointer" : "not-allowed",
                }}
              >
                {actionLoading ? "Confirming..." : "Confirm & Send Notifications"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: REJECT / REQUEST RE-UPLOAD
      ───────────────────────────────────────────────────────────────────────────── */}
      {showRejectModal && selectedSubmission && (
        <div className="admin-modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#131b26", border: "1px solid #7f1d1d", borderRadius: 14, maxWidth: 500, width: "100%", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: "#f87171", display: "flex", alignItems: "center", gap: 8, fontSize: "1.15rem" }}>
                <XCircle size={20} /> Reject Payment Submission
              </h3>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.82rem", color: "#f8fafc", marginBottom: 6 }}>
                Reason for Rejection (Visible to Admin Audit):
              </label>
              <textarea
                value={adminRejectReason}
                onChange={(e) => setAdminRejectReason(e.target.value)}
                placeholder="e.g. Reference number not found in UBL records, or amount mismatch."
                className="admin-input"
                rows={3}
                style={{ width: "100%" }}
              />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 20, fontSize: "0.85rem", color: "#cbd5e1" }}>
              <input
                type="checkbox"
                checked={requestReupload}
                onChange={(e) => setRequestReupload(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "#f59e0b" }}
              />
              <span>Request customer to re-upload clear proof</span>
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectPayment}
                disabled={!adminRejectReason.trim() || actionLoading}
                className="admin-btn"
                style={{ background: "#dc2626", color: "#ffffff", fontWeight: 700 }}
              >
                {actionLoading ? "Processing..." : "Reject Submission"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: LIFECYCLE STATUS UPDATE
      ───────────────────────────────────────────────────────────────────────────── */}
      {showStatusModal && selectedOrder && (
        <div className="admin-modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#131b26", border: "1px solid #38bdf8", borderRadius: 14, maxWidth: 500, width: "100%", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: "#38bdf8", display: "flex", alignItems: "center", gap: 8, fontSize: "1.15rem" }}>
                <Layers size={20} /> Update Order #{selectedOrder.id} Status
              </h3>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: 6 }}>
                Production / Dispatch Stage:
              </label>
              <select
                value={newStatusValue}
                onChange={(e) => setNewStatusValue(e.target.value)}
                className="admin-input"
                style={{ width: "100%" }}
              >
                <option value="order_confirmed">Order Confirmed</option>
                <option value="in_production">In Production</option>
                <option value="ready_for_dispatch">Ready for Dispatch</option>
                <option value="dispatched">Dispatched (Courier In Transit)</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: 6 }}>
                Tracking / Milestone Note (Optional):
              </label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g. DHL Express Tracking Number: 1234567890"
                className="admin-input"
                rows={2}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                disabled={actionLoading}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateOrderStatus}
                disabled={actionLoading}
                className="admin-btn"
                style={{ background: "#0284c7", color: "#ffffff", fontWeight: 700 }}
              >
                {actionLoading ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: SECURE PAYMENT RECEIPT VIEWER
      ───────────────────────────────────────────────────────────────────────────── */}
      {receiptModalUrl && (
        <div className="admin-modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 20 }}>
          <div style={{ background: "#131b26", border: "1px solid #334155", borderRadius: 14, maxWidth: 800, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #1e293b", background: "#0c131d" }}>
              <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                <Eye size={16} color="#38bdf8" /> {receiptModalTitle}
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <a
                  href={receiptModalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-btn admin-btn-secondary"
                  style={{ padding: "4px 10px", fontSize: "0.75rem", textDecoration: "none" }}
                >
                  <ExternalLink size={12} /> Open Full Size
                </a>
                <button
                  type="button"
                  onClick={() => setReceiptModalUrl(null)}
                  style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ padding: 20, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", background: "#080c12", minHeight: 400 }}>
              <img
                src={receiptModalUrl}
                alt="Payment Receipt"
                style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                onError={(e) => {
                  // Fallback for PDF
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector("iframe")) {
                    const iframe = document.createElement("iframe");
                    iframe.src = receiptModalUrl;
                    iframe.style.width = "100%";
                    iframe.style.height = "70vh";
                    iframe.style.border = "none";
                    parent.appendChild(iframe);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
