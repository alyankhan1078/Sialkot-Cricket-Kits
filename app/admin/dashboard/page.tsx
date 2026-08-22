"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Layers,
  HelpCircle,
  Mail,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";

interface StatsData {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  totalCategories: number;
  totalFaqs: number;
  totalEnquiries: number;
  unreadEnquiries: number;
  recentEnquiries: Array<{
    id: number;
    type: string;
    name: string;
    email?: string;
    phone?: string;
    message: string;
    createdAt: string;
    read: boolean;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setStats(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ color: "var(--adm-muted)", padding: "2rem" }}>Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Real-time catalogue metrics, inventory status, and recent customer enquiries.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
            <Plus size={16} />
            <span>Add Product</span>
          </Link>
          <Link href="/admin/settings" className="admin-btn admin-btn-secondary">
            Settings
          </Link>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Package size={24} />
          </div>
          <div>
            <div className="admin-stat-number">{stats?.totalProducts || 0}</div>
            <div className="admin-stat-label">Total Products ({stats?.activeProducts} active)</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
            <Layers size={24} />
          </div>
          <div>
            <div className="admin-stat-number">{stats?.totalCategories || 0}</div>
            <div className="admin-stat-label">Categories Configured</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div className="admin-stat-number">{stats?.featuredProducts || 0}</div>
            <div className="admin-stat-label">Featured on Home</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}>
            <Mail size={24} />
          </div>
          <div>
            <div className="admin-stat-number">{stats?.unreadEnquiries || 0}</div>
            <div className="admin-stat-label">Unread Customer Enquiries</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        {/* Recent Enquiries */}
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.1rem", margin: 0, color: "#fff" }}>Recent Customer Enquiries</h2>
            <Link href="/admin/enquiries" style={{ color: "var(--adm-primary)", fontSize: "0.85rem", textDecoration: "none" }}>
              View all ({stats?.totalEnquiries}) →
            </Link>
          </div>

          {!stats?.recentEnquiries || stats.recentEnquiries.length === 0 ? (
            <p style={{ color: "var(--adm-muted)", fontSize: "0.9rem" }}>No customer enquiries yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {stats.recentEnquiries.map((enquiry) => (
                <div
                  key={enquiry.id}
                  style={{
                    background: "#09101d",
                    border: "1px solid var(--adm-card-border)",
                    borderRadius: "8px",
                    padding: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <strong style={{ color: "#fff" }}>{enquiry.name}</strong>
                      <span
                        className="admin-badge"
                        style={{
                          background: enquiry.type === "custom_bat" ? "rgba(59, 130, 246, 0.2)" : "rgba(16, 185, 129, 0.2)",
                          color: enquiry.type === "custom_bat" ? "#60a5fa" : "#34d399",
                        }}
                      >
                        {enquiry.type === "custom_bat" ? "Custom Bat" : "Contact"}
                      </span>
                      {!enquiry.read && (
                        <span className="admin-badge" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#f87171" }}>
                          New
                        </span>
                      )}
                    </div>
                    <p style={{ color: "var(--adm-muted)", fontSize: "0.85rem", margin: "0.25rem 0" }}>
                      {enquiry.message.slice(0, 100)}...
                    </p>
                    <small style={{ color: "#64748b", fontSize: "0.75rem" }}>
                      {new Date(enquiry.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <Link
                    href={`/admin/enquiries`}
                    className="admin-btn admin-btn-secondary"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Management Actions */}
        <div className="admin-card">
          <h2 style={{ fontSize: "1.1rem", margin: "0 0 1.25rem", color: "#fff" }}>Quick Actions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link
              href="/admin/products"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1rem",
                background: "#09101d",
                border: "1px solid var(--adm-card-border)",
                borderRadius: "8px",
                color: "var(--adm-text)",
                textDecoration: "none",
              }}
            >
              <span>Manage Products & Stock</span>
              <ArrowRight size={16} color="var(--adm-primary)" />
            </Link>

            <Link
              href="/admin/categories"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1rem",
                background: "#09101d",
                border: "1px solid var(--adm-card-border)",
                borderRadius: "8px",
                color: "var(--adm-text)",
                textDecoration: "none",
              }}
            >
              <span>Manage Categories</span>
              <ArrowRight size={16} color="var(--adm-primary)" />
            </Link>

            <Link
              href="/admin/faqs"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1rem",
                background: "#09101d",
                border: "1px solid var(--adm-card-border)",
                borderRadius: "8px",
                color: "var(--adm-text)",
                textDecoration: "none",
              }}
            >
              <span>Edit FAQs</span>
              <ArrowRight size={16} color="var(--adm-primary)" />
            </Link>

            <Link
              href="/admin/settings"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1rem",
                background: "#09101d",
                border: "1px solid var(--adm-card-border)",
                borderRadius: "8px",
                color: "var(--adm-text)",
                textDecoration: "none",
              }}
            >
              <span>Update WhatsApp & Contact</span>
              <ArrowRight size={16} color="var(--adm-primary)" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
