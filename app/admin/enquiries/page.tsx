"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, Check, Trash2, Phone, Globe, Tag, MessageCircle, Copy, ShieldAlert, ShieldCheck, Link2, AlertTriangle } from "lucide-react";
import type { DBEnquiry } from "@/src/lib/data-service";
import { useAdminFeedback } from "@/src/components/AdminFeedbackContext";
import { whatsappUrl } from "@/src/lib/whatsapp";
import { buildResumeOrderFromLead, encodeResumePayload } from "@/src/lib/custom-bat-config";

type Tab = "leads" | "contact" | "spam";

const SITE_URL = "https://sialkotcricketkits.com";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseExtras(raw?: string): Record<string, any> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

/** Two submissions of the same thing within 10 minutes are almost always a double click. */
function findDuplicateIds(list: DBEnquiry[]): Set<number> {
  const dupes = new Set<number>();
  const sorted = [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  for (let i = 1; i < sorted.length; i++) {
    for (let j = i - 1; j >= 0; j--) {
      const gap = new Date(sorted[i].createdAt).getTime() - new Date(sorted[j].createdAt).getTime();
      if (gap > 10 * 60 * 1000) break;
      if (
        sorted[i].type === sorted[j].type &&
        sorted[i].name === sorted[j].name &&
        (sorted[i].product || "") === (sorted[j].product || "") &&
        sorted[i].message === sorted[j].message
      ) {
        dupes.add(sorted[i].id);
        break;
      }
    }
  }
  return dupes;
}

function completeOrderLink(enquiry: DBEnquiry): { url: string; resumable: boolean } {
  const extras = parseExtras(enquiry.extras);
  const order = buildResumeOrderFromLead(extras, { name: enquiry.name === "Customer" ? "" : enquiry.name, country: enquiry.country });
  if (order) {
    return { url: `${SITE_URL}/checkout?source=custom&resume=${encodeResumePayload(order)}`, resumable: true };
  }
  return { url: `${SITE_URL}/custom-bat`, resumable: false };
}

function followUpMessage(enquiry: DBEnquiry): string {
  const extras = parseExtras(enquiry.extras);
  const { url, resumable } = completeOrderLink(enquiry);
  const name = enquiry.name && enquiry.name !== "Customer" ? ` ${enquiry.name}` : "";
  const spec = extras
    ? [extras.size, extras.construction, extras.tierLabel, extras.price ? `£${extras.price}` : null].filter(Boolean).join(" · ")
    : enquiry.product || "your custom bat";
  return [
    `Assalam o Alaikum${name}! This is Sialkot Cricket Kits.`,
    "",
    `Thank you for configuring a custom bat on our website (${spec}).`,
    "Your order is not placed yet — production starts once the advance payment is received.",
    "",
    resumable
      ? `You can complete your order here (your configuration is saved):\n${url}`
      : `You can complete your order here:\n${url}`,
    "",
    "At checkout, choose 30%, 50% or 100% advance, upload your payment screenshot and accept the order terms. Any questions, just reply here.",
  ].join("\n");
}

const SPEC_LABELS: Array<[string, string]> = [
  ["size", "Size"],
  ["construction", "Construction"],
  ["tierLabel", "Tier"],
  ["price", "Price (£)"],
  ["handle", "Handle"],
  ["weight", "Weight"],
  ["profile", "Profile"],
  ["advancePercent", "Advance chosen (%)"],
  ["enquiryType", "Enquiry type"],
  ["productModel", "Product / model"],
  ["quantity", "Quantity"],
  ["orderNumber", "Order number"],
];

export default function AdminEnquiriesPage() {
  const { showToast, confirmAction } = useAdminFeedback();
  const [enquiries, setEnquiries] = useState<DBEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("leads");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchEnquiries = async () => {
    try {
      const res = await fetch("/api/admin/enquiries");
      if (res.status === 401) {
        window.location.href = "/admin";
        return;
      }
      const json = await res.json();
      if (json.success) {
        setEnquiries(json.data);
      } else {
        showToast(json.error || "Failed to load enquiries", "error");
      }
    } catch {
      showToast("Failed to load enquiries", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load; same pattern as the other admin pages.
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    fetchEnquiries();
  }, []);

  const duplicateIds = useMemo(() => findDuplicateIds(enquiries), [enquiries]);

  const lists = useMemo(() => {
    const notSpam = enquiries.filter((e) => !e.spam);
    return {
      leads: notSpam.filter((e) => e.type === "custom_bat"),
      contact: notSpam.filter((e) => e.type !== "custom_bat"),
      spam: enquiries.filter((e) => e.spam),
    };
  }, [enquiries]);

  const visible = lists[tab];
  const selected = enquiries.find((e) => e.id === selectedId) || null;

  const update = async (enquiry: DBEnquiry, body: Record<string, boolean>, successText: string) => {
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        showToast(json.error || "Could not update this enquiry", "error");
        return;
      }
      await fetchEnquiries();
      showToast(successText, "info");
    } catch {
      showToast("Network error while updating", "error");
    }
  };

  const handleSelect = (enquiry: DBEnquiry) => {
    setSelectedId(enquiry.id);
    if (!enquiry.read) update(enquiry, { read: true }, "Marked as read");
  };

  const handleDelete = (enquiry: DBEnquiry) => {
    confirmAction({
      title: "Delete this enquiry permanently?",
      message: `The enquiry from "${enquiry.name}" will be removed from the database. Tip: use "Mark as spam" instead if you only want to hide it.`,
      confirmText: "Delete permanently",
      cancelText: "Keep it",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/enquiries/${enquiry.id}`, { method: "DELETE" });
          const json = await res.json().catch(() => ({}));
          if (json.success) {
            setSelectedId(null);
            showToast("Enquiry deleted", "success");
            fetchEnquiries();
          } else {
            showToast(json.error || "Failed to delete enquiry", "error");
          }
        } catch {
          showToast("Network error while deleting enquiry", "error");
        }
      },
    });
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied`, "success");
    } catch {
      showToast("Could not copy — please select and copy manually", "error");
    }
  };

  const tabs: Array<{ id: Tab; label: string; hint: string }> = [
    { id: "leads", label: "Unpaid Custom Bat Leads", hint: "Configured a bat but have NOT paid. Not orders." },
    { id: "contact", label: "Contact Messages", hint: "Questions from the Contact page." },
    { id: "spam", label: "Spam", hint: "Hidden messages. Nothing is deleted." },
  ];

  const extras = parseExtras(selected?.extras);
  const cleanPhone = (selected?.phone || "").replace(/[^0-9]/g, "");

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Enquiries &amp; Unpaid Leads</h1>
          <p>
            Paid custom bat orders appear under <strong>Orders</strong>. This page only holds messages and
            configurations where no payment was made.
          </p>
        </div>
      </div>

      <div className="adm-enq-tabs" role="tablist" aria-label="Enquiry folders">
        {tabs.map((t) => {
          const unread = lists[t.id].filter((e) => !e.read).length;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`adm-enq-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => {
                setTab(t.id);
                setSelectedId(null);
              }}
              title={t.hint}
            >
              <span>{t.label}</span>
              <span className="adm-enq-count">{lists[t.id].length}</span>
              {unread > 0 && t.id !== "spam" && <span className="adm-enq-new">{unread} new</span>}
            </button>
          );
        })}
      </div>
      <p className="adm-enq-hint">{tabs.find((t) => t.id === tab)?.hint}</p>

      <div className="adm-enq-grid">
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "2rem", color: "var(--adm-muted)", textAlign: "center" }}>Loading…</div>
          ) : visible.length === 0 ? (
            <div style={{ padding: "3rem", color: "var(--adm-muted)", textAlign: "center" }}>Nothing here.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {visible.map((enquiry) => (
                <button
                  type="button"
                  key={enquiry.id}
                  onClick={() => handleSelect(enquiry)}
                  className={`adm-enq-row ${selectedId === enquiry.id ? "selected" : ""} ${!enquiry.read ? "unread" : ""}`}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: "0.35rem" }}>
                    <strong style={{ color: "#fff", fontSize: "0.95rem" }}>{enquiry.name}</strong>
                    <span style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {enquiry.type === "custom_bat" && (
                        <span className="admin-badge" style={{ background: "rgba(245, 158, 11, 0.18)", color: "#fbbf24" }}>
                          Not paid
                        </span>
                      )}
                      {duplicateIds.has(enquiry.id) && (
                        <span className="admin-badge" style={{ background: "rgba(148, 163, 184, 0.2)", color: "#cbd5e1" }}>
                          Duplicate
                        </span>
                      )}
                      {!enquiry.read && (
                        <span className="admin-badge" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#f87171" }}>
                          New
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="adm-enq-preview">{enquiry.product || enquiry.message}</span>
                  <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <small style={{ color: "#64748b", fontSize: "0.75rem" }}>
                      {new Date(enquiry.createdAt).toLocaleString()}
                    </small>
                    {enquiry.country && (
                      <small style={{ color: "var(--adm-muted)", fontSize: "0.75rem" }}>{enquiry.country}</small>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="admin-card">
          {!selected ? (
            <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--adm-muted)" }}>
              <Mail size={40} style={{ opacity: 0.3, marginBottom: "1rem" }} />
              <p>Select an item to see the details and follow-up options.</p>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: "1.25rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.2rem", margin: "0 0 0.25rem", color: "#fff" }}>{selected.name}</h2>
                  <span style={{ fontSize: "0.8rem", color: "var(--adm-muted)" }}>
                    Received {new Date(selected.createdAt).toLocaleString()} · #{selected.id}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => update(selected, { read: !selected.read }, selected.read ? "Marked as unread" : "Marked as read")}
                    className="admin-btn admin-btn-secondary"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                  >
                    <Check size={14} />
                    <span>{selected.read ? "Mark unread" : "Mark read"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => update(selected, { spam: !selected.spam }, selected.spam ? "Moved out of spam" : "Moved to spam")}
                    className="admin-btn admin-btn-secondary"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                  >
                    {selected.spam ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                    <span>{selected.spam ? "Not spam" : "Mark as spam"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(selected)}
                    className="admin-btn admin-btn-danger"
                    style={{ padding: "0.4rem 0.6rem" }}
                    aria-label="Delete enquiry permanently"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {selected.type === "custom_bat" && (
                <div className="adm-enq-warning">
                  <AlertTriangle size={16} />
                  <span>
                    <strong>No payment received.</strong> This customer configured a bat but did not complete checkout.
                    Do not start production. Send them the follow-up below.
                  </span>
                </div>
              )}

              <div className="adm-enq-box" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {selected.email && (
                  <div className="adm-enq-line">
                    <Mail size={16} color="var(--adm-muted)" />
                    <a href={`mailto:${selected.email}`} style={{ color: "var(--adm-primary)" }}>{selected.email}</a>
                  </div>
                )}
                {selected.phone && (
                  <div className="adm-enq-line">
                    <Phone size={16} color="var(--adm-muted)" />
                    <span style={{ color: "#fff" }}>{selected.phone}</span>
                  </div>
                )}
                {!selected.email && !selected.phone && (
                  <div className="adm-enq-line" style={{ color: "#fbbf24" }}>
                    <Phone size={16} />
                    <span>No phone or email was collected. You can only reach this person if they contact you.</span>
                  </div>
                )}
                {selected.country && (
                  <div className="adm-enq-line">
                    <Globe size={16} color="var(--adm-muted)" />
                    <span style={{ color: "#fff" }}>{selected.country}</span>
                  </div>
                )}
                {selected.product && (
                  <div className="adm-enq-line">
                    <Tag size={16} color="var(--adm-muted)" />
                    <span style={{ color: "#fff" }}>{selected.product}</span>
                  </div>
                )}
              </div>

              {extras && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <h3 className="adm-enq-h3">{selected.type === "custom_bat" ? "Bat specification" : "Details"}</h3>
                  <dl className="adm-enq-spec">
                    {SPEC_LABELS.filter(([key]) => extras[key] !== undefined && extras[key] !== "").map(([key, label]) => (
                      <div key={key}>
                        <dt>{label}</dt>
                        <dd>{String(extras[key])}</dd>
                      </div>
                    ))}
                    {Array.isArray(extras.services) && extras.services.length > 0 && (
                      <div>
                        <dt>Services</dt>
                        <dd>{extras.services.join(", ")}</dd>
                      </div>
                    )}
                    {(extras.engraving?.selected && extras.engraving?.text) || extras.engravingText ? (
                      <div>
                        <dt>Engraving</dt>
                        <dd>“{extras.engraving?.text || extras.engravingText}”</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              )}

              <div style={{ marginBottom: "1.25rem" }}>
                <h3 className="adm-enq-h3">Message</h3>
                <div className="adm-enq-box" style={{ whiteSpace: "pre-wrap", color: "#f1f5f9", lineHeight: 1.6 }}>
                  {selected.message}
                </div>
              </div>

              {selected.type === "custom_bat" && (
                <div>
                  <h3 className="adm-enq-h3">Follow up</h3>
                  {(() => {
                    const link = completeOrderLink(selected);
                    const message = followUpMessage(selected);
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <p style={{ color: "var(--adm-muted)", fontSize: "0.82rem", margin: 0 }}>
                          {link.resumable
                            ? "The link below re-opens checkout with this exact configuration (price is re-checked automatically)."
                            : "This lead is missing some details, so the link opens the configurator instead."}
                        </p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <a
                            className="admin-btn admin-btn-primary"
                            href={whatsappUrl(message, cleanPhone)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle size={15} />
                            <span>{cleanPhone ? "WhatsApp customer" : "Open WhatsApp with message"}</span>
                          </a>
                          <button type="button" className="admin-btn admin-btn-secondary" onClick={() => copy(message, "Follow-up message")}>
                            <Copy size={15} />
                            <span>Copy message</span>
                          </button>
                          <button type="button" className="admin-btn admin-btn-secondary" onClick={() => copy(link.url, "Order link")}>
                            <Link2 size={15} />
                            <span>Copy order link</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {selected.type !== "custom_bat" && (selected.phone || selected.email) && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {cleanPhone && (
                    <a
                      className="admin-btn admin-btn-primary"
                      href={whatsappUrl(`Assalam o Alaikum ${selected.name}, this is Sialkot Cricket Kits replying to your message.`, cleanPhone)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={15} />
                      <span>Reply on WhatsApp</span>
                    </a>
                  )}
                  {selected.email && (
                    <a className="admin-btn admin-btn-secondary" href={`mailto:${selected.email}?subject=${encodeURIComponent("Your enquiry — Sialkot Cricket Kits")}`}>
                      <Mail size={15} />
                      <span>Reply by email</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
