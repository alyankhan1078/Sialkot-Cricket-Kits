"use client";

import { useEffect, useState } from "react";
import { Mail, Check, Trash2, Phone, Globe, MessageSquare, Tag } from "lucide-react";
import type { DBEnquiry } from "@/src/lib/data-service";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<DBEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<DBEnquiry | null>(null);

  const fetchEnquiries = async () => {
    try {
      const res = await fetch("/api/admin/enquiries");
      const json = await res.json();
      if (json.success) {
        setEnquiries(json.data);
      }
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleMarkRead = async (enquiry: DBEnquiry, read = true) => {
    try {
      await fetch(`/api/admin/enquiries/${enquiry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      });
      fetchEnquiries();
      if (selectedEnquiry?.id === enquiry.id) {
        setSelectedEnquiry({ ...selectedEnquiry, read });
      }
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this customer enquiry?")) return;
    try {
      await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
      if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
      fetchEnquiries();
    } catch {
      alert("Failed to delete enquiry");
    }
  };

  const handleSelect = (enquiry: DBEnquiry) => {
    setSelectedEnquiry(enquiry);
    if (!enquiry.read) {
      handleMarkRead(enquiry, true);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Customer Enquiries & Custom Orders</h1>
          <p>Review customer submissions from the Contact form and Custom Bat builder.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Enquiries List */}
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "2rem", color: "var(--adm-muted)", textAlign: "center" }}>
              Loading enquiries...
            </div>
          ) : enquiries.length === 0 ? (
            <div style={{ padding: "3rem", color: "var(--adm-muted)", textAlign: "center" }}>
              No enquiries received yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {enquiries.map((enquiry) => (
                <div
                  key={enquiry.id}
                  onClick={() => handleSelect(enquiry)}
                  style={{
                    padding: "1.25rem",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    cursor: "pointer",
                    background:
                      selectedEnquiry?.id === enquiry.id
                        ? "rgba(16, 185, 129, 0.08)"
                        : !enquiry.read
                        ? "rgba(255, 255, 255, 0.02)"
                        : "transparent",
                    borderLeft: selectedEnquiry?.id === enquiry.id ? "3px solid var(--adm-primary)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <strong style={{ color: "#fff", fontSize: "0.95rem" }}>{enquiry.name}</strong>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <span
                        className="admin-badge"
                        style={{
                          background:
                            enquiry.type === "custom_bat" ? "rgba(59, 130, 246, 0.2)" : "rgba(16, 185, 129, 0.2)",
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
                  </div>

                  <p style={{ color: "var(--adm-muted)", fontSize: "0.85rem", margin: "0 0 0.5rem", lineHeight: 1.4 }}>
                    {enquiry.message.slice(0, 80)}...
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <small style={{ color: "#64748b", fontSize: "0.75rem" }}>
                      {new Date(enquiry.createdAt).toLocaleString()}
                    </small>
                    {enquiry.country && (
                      <small style={{ color: "var(--adm-muted)", fontSize: "0.75rem" }}>📍 {enquiry.country}</small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Enquiry Detail View */}
        <div className="admin-card">
          {!selectedEnquiry ? (
            <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--adm-muted)" }}>
              <Mail size={40} style={{ opacity: 0.3, marginBottom: "1rem" }} />
              <p>Select an enquiry from the list on the left to read full details and respond.</p>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", margin: "0 0 0.25rem", color: "#fff" }}>
                    {selectedEnquiry.name}
                  </h2>
                  <span style={{ fontSize: "0.8rem", color: "var(--adm-muted)" }}>
                    Received: {new Date(selectedEnquiry.createdAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => handleMarkRead(selectedEnquiry, !selectedEnquiry.read)}
                    className="admin-btn admin-btn-secondary"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                  >
                    <Check size={14} />
                    <span>{selectedEnquiry.read ? "Mark Unread" : "Mark Read"}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(selectedEnquiry.id)}
                    className="admin-btn admin-btn-danger"
                    style={{ padding: "0.4rem 0.6rem" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ background: "#09101d", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
                {selectedEnquiry.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Mail size={16} color="var(--adm-muted)" />
                    <a href={`mailto:${selectedEnquiry.email}`} style={{ color: "var(--adm-primary)", textDecoration: "none" }}>
                      {selectedEnquiry.email}
                    </a>
                  </div>
                )}
                {selectedEnquiry.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Phone size={16} color="var(--adm-muted)" />
                    <span style={{ color: "#fff" }}>{selectedEnquiry.phone}</span>
                  </div>
                )}
                {selectedEnquiry.country && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Globe size={16} color="var(--adm-muted)" />
                    <span style={{ color: "#fff" }}>{selectedEnquiry.country}</span>
                  </div>
                )}
                {selectedEnquiry.product && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Tag size={16} color="var(--adm-muted)" />
                    <span style={{ color: "#fff" }}>Product: {selectedEnquiry.product}</span>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "0.9rem", color: "var(--adm-muted)", margin: "0 0 0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Message Content
                </h3>
                <div
                  style={{
                    background: "#09101d",
                    padding: "1rem",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    fontSize: "0.9rem",
                  }}
                >
                  {selectedEnquiry.message}
                </div>
              </div>

              {selectedEnquiry.extras && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "0.9rem", color: "var(--adm-muted)", margin: "0 0 0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Custom Specifications
                  </h3>
                  <div style={{ background: "#09101d", padding: "1rem", borderRadius: "8px", fontSize: "0.85rem", color: "#cbd5e1" }}>
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{selectedEnquiry.extras}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
