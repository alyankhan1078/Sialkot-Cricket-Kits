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
} from "lucide-react";
import { formatPrice } from "@/src/data/products";
import type { DBOrder } from "@/src/lib/data-service";
import { useAdminFeedback } from "@/src/components/AdminFeedbackContext";

export default function AdminOrdersPage() {
  const { showToast, confirmAction } = useAdminFeedback();
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<DBOrder | null>(null);
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

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      }
    } catch {
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
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
        status: newOrder.status,
        paymentMethod: newOrder.paymentMethod,
        notes: newOrder.notes,
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
        fetchOrders();
      } else {
        showToast(data.error || "Failed to record order", "error");
      }
    } catch {
      showToast("Network error while recording order", "error");
    } finally {
      setSavingOrder(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: DBOrder["status"]) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Order status updated to ${newStatus.toUpperCase()}`, "success");
        fetchOrders();
        if (selectedOrder?.id === id) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch {
      showToast("Failed to update order status", "error");
    }
  };

  const handleDeleteOrder = (id: string, customer: string) => {
    confirmAction({
      title: `Delete Order "${id}"?`,
      message: `Are you sure you want to delete this order for ${customer}? This action cannot be undone.`,
      confirmText: "Delete Order",
      cancelText: "Keep Order",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
          const json = await res.json();
          if (json.success) {
            showToast(`Order "${id}" was deleted successfully`, "success");
            if (selectedOrder?.id === id) setSelectedOrder(null);
            fetchOrders();
          } else {
            showToast(json.error || "Failed to delete order", "error");
          }
        } catch {
          showToast("Network error while deleting order", "error");
        }
      },
    });
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.country.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalFilteredRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Orders & Sales Management</h1>
          <p>Track all customer sales, WhatsApp orders, invoices, and download full CSV reports.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={handleDownloadReport}
            className="admin-btn admin-btn-secondary"
            disabled={isExporting}
          >
            <Download size={16} />
            <span>{isExporting ? "Exporting..." : "Download CSV Report"}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="admin-btn admin-btn-primary"
          >
            <Plus size={16} />
            <span>Record New Sale</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="admin-card" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "250px" }}>
          <Search
            size={18}
            style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--adm-muted)" }}
          />
          <input
            className="admin-input"
            style={{ paddingLeft: "2.75rem" }}
            placeholder="Search by customer name, order ID, or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="admin-select"
          style={{ width: "auto", minWidth: "180px" }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses ({orders.length})</option>
          <option value="completed">Completed</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div style={{ marginLeft: "auto", color: "var(--adm-muted)", fontSize: "0.9rem" }}>
          Total Revenue: <strong style={{ color: "var(--adm-primary)" }}>PKR {totalFilteredRevenue.toLocaleString()}</strong>
        </div>
      </div>

      {/* ── Orders Table ── */}
      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "2rem", color: "var(--adm-muted)", textAlign: "center" }}>
            Loading orders list...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: "3rem", color: "var(--adm-muted)", textAlign: "center" }}>
            No orders match your criteria.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer Details</th>
                  <th>Items Purchased</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong style={{ color: "#fff" }}>{order.id}</strong>
                      <small style={{ display: "block", color: "var(--adm-muted)" }}>{order.paymentMethod}</small>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
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
                      <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                        {order.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--adm-primary)", fontSize: "0.95rem" }}>
                        PKR {order.totalAmount.toLocaleString()}
                      </strong>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as DBOrder["status"])}
                        className={`admin-badge admin-badge-${order.status}`}
                        style={{ border: "none", outline: "none", cursor: "pointer", background: "inherit" }}
                      >
                        <option value="completed" style={{ background: "#111c2e", color: "#34d399" }}>Completed</option>
                        <option value="confirmed" style={{ background: "#111c2e", color: "#60a5fa" }}>Confirmed</option>
                        <option value="pending" style={{ background: "#111c2e", color: "#fbbf24" }}>Pending</option>
                        <option value="cancelled" style={{ background: "#111c2e", color: "#f87171" }}>Cancelled</option>
                      </select>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: "0.4rem 0.6rem" }}
                          title="View Invoice & Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id, order.customerName)}
                          className="admin-btn admin-btn-danger"
                          style={{ padding: "0.4rem 0.6rem" }}
                          title="Delete Order"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── View Order Details Modal ── */}
      {selectedOrder && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div
            className="admin-modal-card admin-modal-card-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div className="admin-modal-badge admin-modal-badge-primary">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Invoice & Order Details: {selectedOrder.id}</h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--adm-muted)" }}>
                    Processed on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="admin-modal-close"
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", background: "#09101d", padding: "1rem", borderRadius: "8px", marginBottom: "1.25rem", fontSize: "0.875rem" }}>
                <div>
                  <small style={{ color: "var(--adm-muted)", display: "block" }}>Customer Name</small>
                  <strong style={{ color: "#fff" }}>{selectedOrder.customerName}</strong>
                </div>
                <div>
                  <small style={{ color: "var(--adm-muted)", display: "block" }}>Destination Country</small>
                  <span style={{ color: "#fff" }}>{selectedOrder.country}</span>
                </div>
                {selectedOrder.customerPhone && (
                  <div>
                    <small style={{ color: "var(--adm-muted)", display: "block" }}>Phone Number</small>
                    <span style={{ color: "#fff" }}>{selectedOrder.customerPhone}</span>
                  </div>
                )}
                {selectedOrder.customerEmail && (
                  <div>
                    <small style={{ color: "var(--adm-muted)", display: "block" }}>Email Address</small>
                    <span style={{ color: "var(--adm-primary)" }}>{selectedOrder.customerEmail}</span>
                  </div>
                )}
                <div>
                  <small style={{ color: "var(--adm-muted)", display: "block" }}>Payment Method</small>
                  <span style={{ color: "#fff" }}>{selectedOrder.paymentMethod}</span>
                </div>
                <div>
                  <small style={{ color: "var(--adm-muted)", display: "block" }}>Order Status</small>
                  <span className={`admin-badge admin-badge-${selectedOrder.status}`}>
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <h4 style={{ color: "#fff", margin: "0 0 0.75rem", fontSize: "0.95rem" }}>Items Breakdown</h4>
              <div style={{ border: "1px solid var(--adm-card-border)", borderRadius: "8px", overflow: "hidden", marginBottom: "1.25rem" }}>
                <table className="admin-table" style={{ fontSize: "0.85rem" }}>
                  <thead>
                    <tr>
                      <th>Item Description</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th style={{ textAlign: "right" }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.quantity}</td>
                        <td>PKR {item.price.toLocaleString()}</td>
                        <td style={{ textAlign: "right", color: "var(--adm-primary)", fontWeight: 700 }}>
                          PKR {(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} style={{ textAlign: "right", fontWeight: 700, color: "#fff" }}>
                        Total Amount Paid:
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 800, color: "var(--adm-primary)", fontSize: "1.1rem" }}>
                        PKR {selectedOrder.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {selectedOrder.notes && (
                <div style={{ background: "#09101d", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.85rem" }}>
                  <small style={{ color: "var(--adm-muted)", display: "block", marginBottom: "0.25rem" }}>Order Notes / Shipping Info:</small>
                  <span style={{ color: "#cbd5e1" }}>{selectedOrder.notes}</span>
                </div>
              )}
            </div>

            <div className="admin-modal-actions">
              <button
                onClick={() => window.print()}
                className="admin-btn admin-btn-secondary"
              >
                <Printer size={16} />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="admin-btn admin-btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Record New Sale Modal ── */}
      {showAddModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div
            className="admin-modal-card admin-modal-card-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div className="admin-modal-badge admin-modal-badge-primary">
                  <Plus size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Record New Sale / Order</h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--adm-muted)" }}>
                    Manually enter a walk-in, WhatsApp, or phone customer order
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="admin-modal-close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="admin-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="admin-form-group">
                  <label>Customer Full Name *</label>
                  <input
                    className="admin-input"
                    required
                    placeholder="e.g. Asim Riaz"
                    value={newOrder.customerName}
                    onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Destination Country *</label>
                  <input
                    className="admin-input"
                    required
                    placeholder="Pakistan, United Kingdom, USA, etc."
                    value={newOrder.country}
                    onChange={(e) => setNewOrder({ ...newOrder, country: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Phone / WhatsApp Number</label>
                  <input
                    className="admin-input"
                    placeholder="+92 300 1234567"
                    value={newOrder.customerPhone}
                    onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Customer Email (optional)</label>
                  <input
                    type="email"
                    className="admin-input"
                    placeholder="customer@email.com"
                    value={newOrder.customerEmail}
                    onChange={(e) => setNewOrder({ ...newOrder, customerEmail: e.target.value })}
                  />
                </div>

                <div className="admin-form-group" style={{ gridColumn: "span 2" }}>
                  <label>Product / Equipment Sold *</label>
                  <input
                    className="admin-input"
                    required
                    placeholder="e.g. Apex Pro Limited Edition Bat + Gray-Nicolls Gloves"
                    value={newOrder.productName}
                    onChange={(e) => setNewOrder({ ...newOrder, productName: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Unit Price (PKR) *</label>
                  <input
                    type="number"
                    min="0"
                    className="admin-input"
                    required
                    placeholder="e.g. 65499"
                    value={newOrder.price}
                    onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="admin-input"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Payment Method</label>
                  <select
                    className="admin-select"
                    value={newOrder.paymentMethod}
                    onChange={(e) => setNewOrder({ ...newOrder, paymentMethod: e.target.value })}
                  >
                    <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                    <option value="Wise Transfer">Wise Transfer</option>
                    <option value="Remitly / Western Union">Remitly / Western Union</option>
                    <option value="Cash on Delivery / Walk-in">Cash on Delivery / Walk-in</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Initial Status</label>
                  <select
                    className="admin-select"
                    value={newOrder.status}
                    onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value as any })}
                  >
                    <option value="completed">Completed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="admin-form-group" style={{ gridColumn: "span 2" }}>
                  <label>Shipping Notes / Specifications</label>
                  <textarea
                    className="admin-textarea"
                    rows={2}
                    placeholder="Tracking ID, weight specs, knocking-in status..."
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-actions" style={{ marginTop: "1rem" }}>
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
                  {savingOrder ? "Saving..." : "Save Order Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
