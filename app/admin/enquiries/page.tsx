"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mail, Check, Trash2, MessageCircle, Copy, ShieldAlert, ShieldCheck, Link2, AlertTriangle, ChevronRight, RefreshCw, Search, X } from "lucide-react";
import type { DBEnquiry } from "@/src/lib/data-service";
import { useAdminFeedback } from "@/src/components/AdminFeedbackContext";
import { whatsappUrl } from "@/src/lib/whatsapp";
import { buildResumeOrderFromLead, encodeResumePayload } from "@/src/lib/custom-bat-config";
import { formatPkt } from "@/src/lib/admin-orders";
import "../orders/orders.css";
import "./inbox.css";

type Tab = "leads" | "contact" | "spam" | "all";

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
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/enquiries", { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/admin";
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (json.success) setEnquiries(json.data);
      else showToast(json.error || "Failed to load the inbox", "error");
    } catch {
      showToast("Failed to load the inbox", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    // Initial load.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    if (openId === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openId]);

  const duplicateIds = useMemo(() => findDuplicateIds(enquiries), [enquiries]);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enquiries;
    return enquiries.filter((e) =>
      [e.name, e.email, e.phone, e.country, e.product, e.message].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [enquiries, query]);

  const lists = useMemo(() => {
    const live = searched.filter((e) => !e.spam);
    return {
      leads: live.filter((e) => e.type === "custom_bat"),
      contact: live.filter((e) => e.type !== "custom_bat"),
      spam: searched.filter((e) => e.spam),
      all: searched,
    };
  }, [searched]);

  const visible = lists[tab];
  const selected = enquiries.find((e) => e.id === openId) || null;

  const update = async (enquiry: DBEnquiry, body: Record<string, boolean>, successText: string) => {
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        showToast(json.error || "Could not update this message", "error");
        return;
      }
      await load();
      showToast(successText, "info");
    } catch {
      showToast("Network error while updating", "error");
    }
  };

  const openItem = (enquiry: DBEnquiry) => {
    setOpenId(enquiry.id);
    if (!enquiry.read) update(enquiry, { read: true }, "Marked as read");
  };

  const handleDelete = (enquiry: DBEnquiry) => {
    confirmAction({
      title: "Delete this message permanently?",
      message: `The message from "${enquiry.name}" will be removed from the database. Tip: use "Mark as spam" if you only want to hide it.`,
      confirmText: "Delete permanently",
      cancelText: "Keep it",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/enquiries/${enquiry.id}`, { method: "DELETE" });
          const json = await res.json().catch(() => ({}));
          if (json.success) {
            setOpenId(null);
            showToast("Message deleted", "success");
            load();
          } else {
            showToast(json.error || "Failed to delete", "error");
          }
        } catch {
          showToast("Network error while deleting", "error");
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
    { id: "leads", label: "Unpaid custom bat leads", hint: "Built a bat but did NOT pay. These are not orders." },
    { id: "contact", label: "Messages", hint: "Questions from the Contact page." },
    { id: "spam", label: "Spam", hint: "Hidden messages. Nothing is deleted." },
    { id: "all", label: "All", hint: "Everything in the inbox." },
  ];

  const summaryOf = (e: DBEnquiry) => {
    const x = parseExtras(e.extras);
    if (e.type === "custom_bat" && x) {
      return [x.construction, x.tierLabel, x.price ? `£${x.price}` : null].filter(Boolean).join(" · ") || e.product || e.message;
    }
    return e.message;
  };

  const extras = parseExtras(selected?.extras);
  const cleanPhone = (selected?.phone || "").replace(/[^0-9]/g, "");

  return (
    <div className="ord inbox">
      <header className="ord-head">
        <div>
          <h1>Inbox</h1>
          <p>Paid orders are under Orders. Here: messages and unpaid custom bat leads.</p>
        </div>
        <div className="ord-head-actions">
          <button type="button" className="ord-btn" onClick={load} disabled={loading} aria-label="Refresh inbox">
            <RefreshCw size={16} className={loading ? "ord-spin" : ""} aria-hidden="true" />
            <span className="ord-hide-sm">Refresh</span>
          </button>
        </div>
      </header>

      <div className="ord-tiles inbox-tiles" role="tablist" aria-label="Inbox folders">
        {tabs.map((t) => {
          const unread = lists[t.id].filter((e) => !e.read).length;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`ord-tile ${tab === t.id ? "active" : ""} ${t.id !== "spam" && t.id !== "all" && unread > 0 ? "urgent" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span className="ord-tile-label">{t.label}</span>
              <strong className="ord-tile-count">{loading ? "–" : lists[t.id].length}</strong>
              <span className="ord-tile-sub">{loading ? "" : unread > 0 && t.id !== "spam" ? `${unread} unread` : t.id === "leads" ? "no payment" : " "}</span>
            </button>
          );
        })}
      </div>
      <p className="inbox-hint">{tabs.find((t) => t.id === tab)?.hint}</p>

      <div className="ord-toolbar">
        <label className="ord-search">
          <Search size={16} aria-hidden="true" />
          <span className="ord-sr">Search the inbox</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, phone or text" />
        </label>
      </div>

      <div className="ord-table-wrap">
        <table className="ord-table inbox-table">
          <thead>
            <tr>
              <th scope="col">Received</th>
              <th scope="col">From</th>
              <th scope="col">Country</th>
              <th scope="col">Type</th>
              <th scope="col">Summary</th>
              <th scope="col">Status</th>
              <th scope="col"><span className="ord-sr">Open</span></th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={`s${i}`}><td colSpan={7}><span className="ord-skel" /></td></tr>
              ))}
            {!loading && visible.length === 0 && (
              <tr><td colSpan={7} className="ord-empty">Nothing here.</td></tr>
            )}
            {!loading &&
              visible.map((e) => (
                <tr key={e.id} className={!e.read && !e.spam ? "attention" : ""}>
                  <td className="nowrap muted">{formatPkt(e.createdAt)}</td>
                  <td>
                    <div className="ord-two">
                      <button type="button" className="inbox-name" onClick={() => openItem(e)}>{e.name}</button>
                      <span>{e.email || e.phone || "No contact details"}</span>
                    </div>
                  </td>
                  <td className="nowrap muted">{e.country && e.country !== "Unspecified" ? e.country : "—"}</td>
                  <td>
                    <span className={`ord-type ${e.type === "custom_bat" ? "custom" : ""}`}>{e.type === "custom_bat" ? "Unpaid lead" : "Message"}</span>
                  </td>
                  <td className="inbox-summary" title={summaryOf(e)}>{summaryOf(e)}</td>
                  <td>
                    <span className="inbox-status">
                      {e.spam ? <span className="ord-pill tone-grey">Spam</span> : !e.read ? <span className="ord-pill tone-amber">New</span> : <span className="ord-pill tone-grey">Read</span>}
                      {duplicateIds.has(e.id) && <span className="ord-pill tone-grey">Duplicate</span>}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="ord-icon" aria-label={`Open message from ${e.name}`} onClick={() => openItem(e)}>
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="ord-cards">
        {loading && Array.from({ length: 3 }).map((_, i) => <div key={`c${i}`} className="ord-card ord-skel-card" />)}
        {!loading && visible.length === 0 && <p className="ord-empty">Nothing here.</p>}
        {!loading &&
          visible.map((e) => (
            <article key={e.id} className={`ord-card ${!e.read && !e.spam ? "attention" : ""}`}>
              <button type="button" className="ord-card-main" onClick={() => openItem(e)} aria-label={`Open message from ${e.name}`}>
                <span className="ord-card-top">
                  <span>{formatPkt(e.createdAt)}</span>
                  <span className="inbox-status">
                    {e.type === "custom_bat" ? <span className="ord-pill tone-orange">Unpaid lead</span> : <span className="ord-pill tone-blue">Message</span>}
                    {!e.read && !e.spam && <span className="ord-pill tone-amber">New</span>}
                  </span>
                </span>
                <span className="ord-card-name">{e.name}</span>
                <span className="ord-card-meta inbox-card-summary">{summaryOf(e)}</span>
                {duplicateIds.has(e.id) && <span className="ord-card-meta">Possible duplicate</span>}
              </button>
            </article>
          ))}
      </div>

      {selected && (
        <div className="ord-backdrop" onClick={() => setOpenId(null)}>
          <aside className="ord-drawer" role="dialog" aria-modal="true" aria-label={`Message from ${selected.name}`} onClick={(ev) => ev.stopPropagation()}>
            <div className="ord-drawer-head">
              <div>
                <span className="ord-mono">#{selected.id}</span>
                <h2>{selected.name}</h2>
                <span className="muted">{formatPkt(selected.createdAt)} · {selected.type === "custom_bat" ? "Unpaid custom bat lead" : "Message"}</span>
              </div>
              <button ref={closeRef} type="button" className="ord-icon" aria-label="Close" onClick={() => setOpenId(null)}>
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="ord-quick">
              <button type="button" className="ord-btn" onClick={() => update(selected, { read: !selected.read }, selected.read ? "Marked as unread" : "Marked as read")}>
                <Check size={16} aria-hidden="true" /> {selected.read ? "Mark unread" : "Mark read"}
              </button>
              <button type="button" className="ord-btn" onClick={() => update(selected, { spam: !selected.spam }, selected.spam ? "Moved out of spam" : "Moved to spam")}>
                {selected.spam ? <ShieldCheck size={16} aria-hidden="true" /> : <ShieldAlert size={16} aria-hidden="true" />} {selected.spam ? "Not spam" : "Mark as spam"}
              </button>
              <button type="button" className="ord-btn" onClick={() => handleDelete(selected)} aria-label="Delete permanently">
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>

            {selected.type === "custom_bat" && (
              <div className="ord-warn" role="note">
                <AlertTriangle size={16} aria-hidden="true" />
                <div><p><strong>No payment received.</strong> This person built a bat but did not finish checkout. Do not start production.</p></div>
              </div>
            )}

            <section className="ord-sec">
              <h3>Contact</h3>
              <dl className="ord-kv">
                <div><dt>Email</dt><dd>{selected.email ? <a href={`mailto:${selected.email}`}>{selected.email}</a> : "—"}</dd></div>
                <div><dt>Phone</dt><dd>{selected.phone || "—"}</dd></div>
                <div><dt>Country</dt><dd>{selected.country && selected.country !== "Unspecified" ? selected.country : "—"}</dd></div>
                {selected.product && <div><dt>Product</dt><dd>{selected.product}</dd></div>}
              </dl>
              {!selected.email && !selected.phone && (
                <p className="ord-hint due">No phone or email was collected. You can only reach this person if they contact you.</p>
              )}
            </section>

            {extras && (
              <section className="ord-sec">
                <h3>{selected.type === "custom_bat" ? "Bat they configured" : "Details"}</h3>
                <dl className="ord-spec">
                  {SPEC_LABELS.filter(([key]) => extras[key] !== undefined && extras[key] !== "").map(([key, label]) => (
                    <div key={key}><dt>{label}</dt><dd>{String(extras[key])}</dd></div>
                  ))}
                  {Array.isArray(extras.services) && extras.services.length > 0 && (
                    <div className="wide"><dt>Services</dt><dd>{extras.services.join(", ")}</dd></div>
                  )}
                  {(extras.engraving?.selected && extras.engraving?.text) || extras.engravingText ? (
                    <div className="wide"><dt>Engraving</dt><dd>“{extras.engraving?.text || extras.engravingText}”</dd></div>
                  ) : null}
                </dl>
              </section>
            )}

            <section className="ord-sec">
              <h3>Message</h3>
              <p className="inbox-message">{selected.message}</p>
            </section>

            {selected.type === "custom_bat" ? (
              <section className="ord-sec">
                <h3>Follow up</h3>
                {(() => {
                  const link = completeOrderLink(selected);
                  const message = followUpMessage(selected);
                  return (
                    <>
                      <p className="ord-hint muted">
                        {link.resumable
                          ? "The order link re-opens checkout with this exact bat. The price is checked again automatically."
                          : "Some details are missing, so the link opens the custom bat builder instead."}
                      </p>
                      <div className="ord-quick">
                        <a className="ord-btn wa" href={whatsappUrl(message, cleanPhone)} target="_blank" rel="noopener noreferrer">
                          <MessageCircle size={16} aria-hidden="true" /> {cleanPhone ? "WhatsApp customer" : "Open WhatsApp with message"}
                        </a>
                        <button type="button" className="ord-btn" onClick={() => copy(message, "Follow-up message")}>
                          <Copy size={16} aria-hidden="true" /> Copy message
                        </button>
                        <button type="button" className="ord-btn" onClick={() => copy(link.url, "Order link")}>
                          <Link2 size={16} aria-hidden="true" /> Copy order link
                        </button>
                      </div>
                    </>
                  );
                })()}
              </section>
            ) : (
              (cleanPhone || selected.email) && (
                <section className="ord-sec">
                  <h3>Reply</h3>
                  <div className="ord-quick">
                    {cleanPhone && (
                      <a className="ord-btn wa" href={whatsappUrl(`Assalam o Alaikum ${selected.name}, this is Sialkot Cricket Kits replying to your message.`, cleanPhone)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle size={16} aria-hidden="true" /> Reply on WhatsApp
                      </a>
                    )}
                    {selected.email && (
                      <a className="ord-btn" href={`mailto:${selected.email}?subject=${encodeURIComponent("Your enquiry — Sialkot Cricket Kits")}`}>
                        <Mail size={16} aria-hidden="true" /> Reply by email
                      </a>
                    )}
                  </div>
                </section>
              )
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
