"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Layers,
  Sparkles,
  Mail,
  Plus,
  ArrowRight,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  ChevronRight,
} from "lucide-react";
import { formatPrice } from "@/src/data/products";
import type { SalesStats, DBOrder } from "@/src/lib/data-service";
import { useAdminFeedback } from "@/src/components/AdminFeedbackContext";

interface StatsData {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  totalCategories: number;
  totalFaqs: number;
  totalEnquiries: number;
  unreadEnquiries: number;
}

export default function AdminDashboardPage() {
  const { showToast } = useAdminFeedback();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [sales, setSales] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendMode, setTrendMode] = useState<"daily" | "monthly">("daily");
  const [exportRange, setExportRange] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, salesRes] = await Promise.all([
        fetch("/api/admin/stats").then((r) => r.json()),
        fetch("/api/admin/sales/stats").then((r) => r.json()),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (salesRes.success) setSales(salesRes.data);
    } catch {
      showToast("Failed to load dashboard metrics", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDownloadReport = async (range = exportRange) => {
    setIsExporting(true);
    try {
      let url = `/api/admin/sales/export?range=${range}`;
      const now = new Date();

      if (range === "daily") {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        url += `&startDate=${start}`;
      } else if (range === "weekly") {
        const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        url += `&startDate=${start}`;
      } else if (range === "monthly") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        url += `&startDate=${start}`;
      } else if (range === "yearly") {
        const start = new Date(now.getFullYear(), 0, 1).toISOString();
        url += `&startDate=${start}`;
      }

      // Trigger file download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Sialkot_Cricket_Kits_Sales_Report_${range}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Sales report (${range.toUpperCase()}) downloaded!`, "success");
    } catch {
      showToast("Failed to generate sales report", "error");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return <div style={{ color: "var(--adm-muted)", padding: "2rem" }}>Loading dashboard analytics...</div>;
  }

  // Max value calculation for trend chart normalization
  const maxTrendRevenue =
    trendMode === "daily"
      ? Math.max(...(sales?.dailyTrend.map((d) => d.revenue) || [1]), 1)
      : Math.max(...(sales?.monthlyTrend.map((m) => m.revenue) || [1]), 1);

  return (
    <div>
      {/* ── Top Header & Report Actions ── */}
      <div className="admin-header">
        <div>
          <h1>Sales & Operations Dashboard</h1>
          <p>Real-time revenue metrics, daily/weekly/monthly/yearly sales tracking, and downloadable reports.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowReportModal(true)}
            className="admin-btn admin-btn-secondary"
          >
            <Printer size={16} />
            <span>View Printable Report</span>
          </button>

          <button
            onClick={() => handleDownloadReport("all")}
            className="admin-btn admin-btn-primary"
            disabled={isExporting}
          >
            <Download size={16} />
            <span>{isExporting ? "Generating..." : "Download Sales CSV"}</span>
          </button>
        </div>
      </div>

      {/* ── 4 Main Sales Metrics: Daily, Weekly, Monthly, Yearly ── */}
      <div className="admin-sales-grid">
        {/* Daily Sales Card */}
        <div className="admin-sales-card admin-sales-card-daily">
          <div className="admin-sales-header">
            <span className="admin-sales-title">Daily Sales (Today)</span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(16, 185, 129, 0.15)",
                color: "var(--adm-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DollarSign size={18} />
            </div>
          </div>
          <div className="admin-sales-amount">
            PKR {(sales?.dailySales.revenue || 0).toLocaleString()}
          </div>
          <div className="admin-sales-subtext">
            <span style={{ color: "#34d399", fontWeight: 600 }}>
              {sales?.dailySales.orderCount || 0} Orders today
            </span>
            <span>·</span>
            <span>{sales?.dailySales.date}</span>
          </div>
        </div>

        {/* Weekly Sales Card */}
        <div className="admin-sales-card admin-sales-card-weekly">
          <div className="admin-sales-header">
            <span className="admin-sales-title">Weekly Sales (7 Days)</span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(59, 130, 246, 0.15)",
                color: "#60a5fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="admin-sales-amount">
            PKR {(sales?.weeklySales.revenue || 0).toLocaleString()}
          </div>
          <div className="admin-sales-subtext">
            <span style={{ color: "#60a5fa", fontWeight: 600 }}>
              {sales?.weeklySales.orderCount || 0} Orders this week
            </span>
          </div>
        </div>

        {/* Monthly Sales Card */}
        <div className="admin-sales-card admin-sales-card-monthly">
          <div className="admin-sales-header">
            <span className="admin-sales-title">Monthly Sales</span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(139, 92, 246, 0.15)",
                color: "#c084fc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calendar size={18} />
            </div>
          </div>
          <div className="admin-sales-amount">
            PKR {(sales?.monthlySales.revenue || 0).toLocaleString()}
          </div>
          <div className="admin-sales-subtext">
            <span style={{ color: "#c084fc", fontWeight: 600 }}>
              {sales?.monthlySales.orderCount || 0} Orders in {sales?.monthlySales.month}
            </span>
          </div>
        </div>

        {/* Yearly Sales Card */}
        <div className="admin-sales-card admin-sales-card-yearly">
          <div className="admin-sales-header">
            <span className="admin-sales-title">Yearly Sales ({sales?.yearlySales.year})</span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(245, 158, 11, 0.15)",
                color: "#fbbf24",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="admin-sales-amount">
            PKR {(sales?.yearlySales.revenue || 0).toLocaleString()}
          </div>
          <div className="admin-sales-subtext">
            <span style={{ color: "#fbbf24", fontWeight: 600 }}>
              {sales?.yearlySales.orderCount || 0} Orders in {sales?.yearlySales.year}
            </span>
          </div>
        </div>
      </div>

      {/* ── Revenue Chart & Export Report Panel ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Revenue Trend Visualizer */}
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", margin: 0, color: "#fff" }}>Revenue Trend</h2>
              <span style={{ fontSize: "0.8rem", color: "var(--adm-muted)" }}>
                Visual sales progression over time
              </span>
            </div>
            <div className="admin-period-tabs">
              <button
                onClick={() => setTrendMode("daily")}
                className={`admin-period-pill ${trendMode === "daily" ? "active" : ""}`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setTrendMode("monthly")}
                className={`admin-period-pill ${trendMode === "monthly" ? "active" : ""}`}
              >
                Monthly (Year)
              </button>
            </div>
          </div>

          <div className="admin-trend-chart">
            {trendMode === "daily"
              ? sales?.dailyTrend.map((d) => {
                  const heightPercent = maxTrendRevenue > 0 ? (d.revenue / maxTrendRevenue) * 100 : 0;
                  return (
                    <div key={d.date} className="admin-trend-column">
                      {d.revenue > 0 && (
                        <span className="admin-trend-value">PKR {(d.revenue / 1000).toFixed(0)}k</span>
                      )}
                      <div className="admin-trend-bar-wrapper">
                        <div
                          className="admin-trend-bar-fill"
                          style={{ height: `${Math.max(heightPercent, 4)}%` }}
                        />
                      </div>
                      <span className="admin-trend-label">{d.label.split(",")[0]}</span>
                    </div>
                  );
                })
              : sales?.monthlyTrend.map((m) => {
                  const heightPercent = maxTrendRevenue > 0 ? (m.revenue / maxTrendRevenue) * 100 : 0;
                  return (
                    <div key={m.month} className="admin-trend-column">
                      {m.revenue > 0 && (
                        <span className="admin-trend-value">PKR {(m.revenue / 1000).toFixed(0)}k</span>
                      )}
                      <div className="admin-trend-bar-wrapper">
                        <div
                          className="admin-trend-bar-fill"
                          style={{
                            height: `${Math.max(heightPercent, 4)}%`,
                            background: "linear-gradient(180deg, #818cf8 0%, #4f46e5 100%)",
                          }}
                        />
                      </div>
                      <span className="admin-trend-label">{m.month}</span>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Download Sales Reports Panel */}
        <div className="admin-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <FileSpreadsheet size={20} color="var(--adm-primary)" />
              <h2 style={{ fontSize: "1.1rem", margin: 0, color: "#fff" }}>Export Sales Report</h2>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--adm-muted)", margin: "0 0 1.25rem", lineHeight: 1.5 }}>
              Generate structured sales and order reports formatted for accounting, tax filing, or inventory planning.
            </p>

            <div className="admin-form-group">
              <label>Select Report Period</label>
              <select
                className="admin-select"
                value={exportRange}
                onChange={(e) => setExportRange(e.target.value)}
              >
                <option value="all">All-Time Sales Record (Full History)</option>
                <option value="daily">Today&apos;s Sales Only</option>
                <option value="weekly">This Week&apos;s Sales (Last 7 Days)</option>
                <option value="monthly">This Month&apos;s Sales</option>
                <option value="yearly">This Year&apos;s Sales (2026)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
            <button
              onClick={() => handleDownloadReport(exportRange)}
              className="admin-btn admin-btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={isExporting}
            >
              <Download size={16} />
              <span>Download Excel/CSV Report</span>
            </button>
            <Link
              href="/admin/orders"
              className="admin-btn admin-btn-secondary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <span>Manage All Orders & Invoices →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Recent Orders & Catalogue Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        {/* Recent Orders List */}
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", margin: 0, color: "#fff" }}>Recent Sales & Orders</h2>
              <span style={{ fontSize: "0.8rem", color: "var(--adm-muted)" }}>
                Latest transactions processed through WhatsApp & bank transfer
              </span>
            </div>
            <Link href="/admin/orders" style={{ color: "var(--adm-primary)", fontSize: "0.85rem", textDecoration: "none" }}>
              View all orders ({sales?.lifetime.orderCount}) →
            </Link>
          </div>

          {!sales?.recentOrders || sales.recentOrders.length === 0 ? (
            <p style={{ color: "var(--adm-muted)", fontSize: "0.9rem" }}>No orders recorded yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {sales.recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  style={{
                    background: "#09101d",
                    border: "1px solid var(--adm-card-border)",
                    borderRadius: "8px",
                    padding: "0.85rem 1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <strong style={{ color: "#fff" }}>{order.customerName}</strong>
                      <span className="admin-badge admin-badge-completed">{order.status.toUpperCase()}</span>
                      <small style={{ color: "#64748b" }}>{order.id}</small>
                    </div>
                    <p style={{ color: "var(--adm-muted)", fontSize: "0.825rem", margin: "0.2rem 0" }}>
                      {order.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                    </p>
                    <small style={{ color: "#64748b", fontSize: "0.75rem" }}>
                      📍 {order.country} · {new Date(order.createdAt).toLocaleDateString()}
                    </small>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "var(--adm-primary)", fontWeight: 700, fontSize: "1rem" }}>
                      PKR {order.totalAmount.toLocaleString()}
                    </div>
                    <small style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{order.paymentMethod}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Secondary System Metrics & Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Quick Catalogue Overview */}
          <div className="admin-card">
            <h2 style={{ fontSize: "1.1rem", margin: "0 0 1rem", color: "#fff" }}>Catalogue Overview</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: "var(--adm-muted)", fontSize: "0.9rem" }}>Total Products</span>
                <strong style={{ color: "#fff" }}>{stats?.totalProducts} items</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: "var(--adm-muted)", fontSize: "0.9rem" }}>Active in Shop</span>
                <strong style={{ color: "#34d399" }}>{stats?.activeProducts} items</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: "var(--adm-muted)", fontSize: "0.9rem" }}>Categories</span>
                <strong style={{ color: "#60a5fa" }}>{stats?.totalCategories}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
                <span style={{ color: "var(--adm-muted)", fontSize: "0.9rem" }}>Unread Customer Messages</span>
                <strong style={{ color: "#f87171" }}>{stats?.unreadEnquiries}</strong>
              </div>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="admin-card">
            <h2 style={{ fontSize: "1.1rem", margin: "0 0 1rem", color: "#fff" }}>Quick Navigation</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <Link
                href="/admin/orders"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.65rem 0.85rem",
                  background: "#09101d",
                  borderRadius: "6px",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                <span>Orders & Sales Log</span>
                <ArrowRight size={14} color="var(--adm-primary)" />
              </Link>
              <Link
                href="/admin/products"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.65rem 0.85rem",
                  background: "#09101d",
                  borderRadius: "6px",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                <span>Products & Pricing</span>
                <ArrowRight size={14} color="var(--adm-primary)" />
              </Link>
              <Link
                href="/admin/enquiries"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.65rem 0.85rem",
                  background: "#09101d",
                  borderRadius: "6px",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                <span>Customer Enquiries</span>
                <ArrowRight size={14} color="var(--adm-primary)" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Printable Report Modal Dialog ── */}
      {showReportModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div
            className="admin-modal-card admin-modal-card-lg"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "800px" }}
          >
            <div className="admin-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <img
                  src="/assets/brand/sialkot-cricket-kits-logo.png"
                  alt="Sialkot Cricket Kits"
                  style={{ width: "40px", height: "40px", borderRadius: "8px" }}
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem" }}>Official Sales Summary Report</h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--adm-muted)" }}>
                    Generated on {new Date().toLocaleString()} · Sialkot Cricket Kits
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="admin-modal-close"
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ background: "#09101d", padding: "1rem", borderRadius: "8px" }}>
                  <small style={{ color: "var(--adm-muted)", display: "block" }}>Daily Sales</small>
                  <strong style={{ color: "#34d399", fontSize: "1.1rem" }}>
                    PKR {(sales?.dailySales.revenue || 0).toLocaleString()}
                  </strong>
                </div>
                <div style={{ background: "#09101d", padding: "1rem", borderRadius: "8px" }}>
                  <small style={{ color: "var(--adm-muted)", display: "block" }}>Weekly Sales</small>
                  <strong style={{ color: "#60a5fa", fontSize: "1.1rem" }}>
                    PKR {(sales?.weeklySales.revenue || 0).toLocaleString()}
                  </strong>
                </div>
                <div style={{ background: "#09101d", padding: "1rem", borderRadius: "8px" }}>
                  <small style={{ color: "var(--adm-muted)", display: "block" }}>Monthly Sales</small>
                  <strong style={{ color: "#c084fc", fontSize: "1.1rem" }}>
                    PKR {(sales?.monthlySales.revenue || 0).toLocaleString()}
                  </strong>
                </div>
                <div style={{ background: "#09101d", padding: "1rem", borderRadius: "8px" }}>
                  <small style={{ color: "var(--adm-muted)", display: "block" }}>Yearly Sales</small>
                  <strong style={{ color: "#fbbf24", fontSize: "1.1rem" }}>
                    PKR {(sales?.yearlySales.revenue || 0).toLocaleString()}
                  </strong>
                </div>
              </div>

              <h4 style={{ color: "#fff", margin: "0 0 0.75rem", fontSize: "0.95rem" }}>
                Recorded Orders Breakdown ({sales?.lifetime.orderCount} total orders)
              </h4>
              <div style={{ maxHeight: "280px", overflowY: "auto", border: "1px solid var(--adm-card-border)", borderRadius: "8px" }}>
                <table className="admin-table" style={{ fontSize: "0.85rem" }}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Country</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales?.recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td><strong>{o.id}</strong></td>
                        <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td>{o.customerName}</td>
                        <td>{o.country}</td>
                        <td style={{ color: "var(--adm-primary)", fontWeight: 700 }}>
                          PKR {o.totalAmount.toLocaleString()}
                        </td>
                        <td><span className="admin-badge admin-badge-completed">{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                onClick={() => window.print()}
                className="admin-btn admin-btn-secondary"
              >
                <Printer size={16} />
                <span>Print Document</span>
              </button>
              <button
                onClick={() => {
                  handleDownloadReport("all");
                  setShowReportModal(false);
                }}
                className="admin-btn admin-btn-primary"
              >
                <Download size={16} />
                <span>Download as CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
