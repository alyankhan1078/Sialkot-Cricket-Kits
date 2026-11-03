"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MessageCircle,
  RefreshCw,
  RotateCcw,
  Search,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { OrderItem } from "@/src/lib/data-service";
import {
  STAGE_LABEL,
  STAGE_TONE,
  STATUS_OPTIONS,
  addressOf,
  adminNoteOf,
  balanceOf,
  formatPkt,
  isCustom,
  isUnderpaid,
  itemsSummary,
  lastMessageOf,
  messageEventFor,
  money,
  nextStepOf,
  paidOf,
  planLabelOf,
  planOf,
  reportedOf,
  requiredNowOf,
  rowToneOf,
  sheetBalanceOf,
  sheetTabOf,
  stageOf,
  trackingOf,
  type Order,
  type SheetTab,
  type Stage,
} from "@/src/lib/admin-orders";
import { buildMessage, type MessageInput, type MessageLanguage } from "@/src/lib/order-messages";
import { useAdminFeedback } from "@/src/components/AdminFeedbackContext";
import { whatsappUrl } from "@/src/lib/whatsapp";
import "./orders.css";
import "./sheet.css";

const TABS: Array<{ id: SheetTab; label: string }> = [
  { id: "needs", label: "Needs checking" },
  { id: "verified", label: "Verified" },
  { id: "production", label: "In production" },
  { id: "dispatched", label: "Dispatched" },
  { id: "all", label: "All" },
];

// Stages where the payment tick may still be reopened (before packing/dispatch).
const REOPENABLE: Stage[] = ["confirmed", "production", "pictures", "balance_requested"];

const PKT_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit" });
const pktDay = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : PKT_DAY.format(d);
};

function historyOf(order: Order): string[] {
  return (order.notes || "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^\[(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|Admin)/.test(l));
}

function warningsOf(order: Order): string[] {
  return (order.notes || "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("⚠️"))
    .map((l) => l.replace(/^⚠️\s*/, ""));
}

const phoneDigits = (o: Order) => (o.customerPhone || "").replace(/[^0-9]/g, "");
const receiptUrl = (subId: string) => `/api/admin/receipts/${encodeURIComponent(subId)}`;
const isVerifiedSub = (o: Order) => o.paymentSubmission?.status === "payment_verified";

function StagePill({ stage }: { stage: Stage }) {
  const label = stage === "check" ? "Needs checking" : stage === "confirmed" ? "Verified" : STAGE_LABEL[stage];
  return <span className={`ord-pill tone-${STAGE_TONE[stage]}`}>{label}</span>;
}

function SpecLine({ item }: { item: OrderItem }) {
  const s = item.customSpec;
  if (!s) return null;
  const parts = [s.size, s.construction, s.weight, s.handle].filter(Boolean);
  return parts.length ? <span className="sh-spec">{parts.join(" · ")}</span> : null;
}

function SpecList({ item }: { item: OrderItem }) {
  const spec = item.customSpec;
  if (!spec) return null;
  const rows: Array<[string, string]> = [
    ["Size", spec.size],
    ["Willow", spec.construction],
    ["Tier", spec.tier],
    ["Handle", spec.handle],
    ["Weight", spec.weight],
    ["Profile", spec.profile],
    ["Services", (spec.services || []).join(", ")],
    ["Engraving", spec.engravingText ? `“${spec.engravingText}”` : ""],
    ["Requirements", spec.requirements],
  ].filter(([, v]) => Boolean(v)) as Array<[string, string]>;
  return (
    <dl className="ord-spec">
      {rows.map(([k, v]) => (
        <div key={k} className={k === "Requirements" || k === "Services" ? "wide" : ""}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

type Modal =
  | { kind: "verify"; order: Order }
  | { kind: "reject"; order: Order }
  | { kind: "reopen"; order: Order }
  | null;

export default function AdminOrdersPage() {
  const { showToast, confirmAction } = useAdminFeedback();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<SheetTab>("needs");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "custom" | "catalogue">("all");
  const [country, setCountry] = useState("");
  const [fromDay, setFromDay] = useState("");
  const [toDay, setToDay] = useState("");
  const [lang, setLang] = useState<MessageLanguage>("en");
  const [bankDetails, setBankDetails] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [openId, setOpenId] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [busy, setBusy] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [askReupload, setAskReupload] = useState(true);
  const [reopenReason, setReopenReason] = useState("");
  const [stepNote, setStepNote] = useState("");
  const [manualStatus, setManualStatus] = useState("");
  const [lightbox, setLightbox] = useState<{ src: string; title: string; isImage: boolean } | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const closeRef = useRef<HTMLButtonElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      if (res.status === 401) {
        window.location.assign("/admin");
        return;
      }
      const json = await res.json().catch(() => ({ success: false }));
      if (json.success && Array.isArray(json.data)) setOrders(json.data);
      else showToast(json.error || "Could not load orders", "error");
    } catch {
      showToast("Could not load orders. Check your connection.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("view");
    const t = params.get("type");
    const s = params.get("search");
    const mapped: Record<string, SheetTab> = { check: "needs", needs: "needs", verified: "verified", production: "production", balance: "production", dispatched: "dispatched", all: "all" };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (v && mapped[v]) setTab(mapped[v]);
    if (t === "custom" || t === "catalogue") setTypeFilter(t);
    if (s) {
      setQuery(s);
      setTab("all");
    }
    try {
      const saved = window.localStorage.getItem("sck-admin-msg-lang");
      if (saved === "en" || saved === "ur") setLang(saved);
    } catch {
      /* storage unavailable */
    }
    load();
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        const st = j?.data || {};
        const lines = [
          st.bankName && `Bank: ${st.bankName}`,
          st.accountTitle && `Account title: ${st.accountTitle}`,
          st.accountNumber && `Account no: ${st.accountNumber}`,
          st.iban && `IBAN: ${st.iban}`,
          st.swiftBic && `SWIFT: ${st.swiftBic}`,
        ].filter(Boolean);
        setBankDetails(lines.join("\n"));
      })
      .catch(() => {});
  }, [load]);

  const chooseLang = (l: MessageLanguage) => {
    setLang(l);
    try {
      window.localStorage.setItem("sck-admin-msg-lang", l);
    } catch {
      /* storage unavailable */
    }
  };

  const open = orders.find((o) => o.id === openId) || null;

  useEffect(() => {
    if (!openId && !modal && !lightbox) return;
    if (openId && !modal && !lightbox) closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (lightbox) setLightbox(null);
      else if (modal) setModal(null);
      else setOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openId, modal, lightbox]);

  const countries = useMemo(() => Array.from(new Set(orders.map((o) => o.country).filter(Boolean))).sort(), [orders]);

  // Everything except the tab, so the tab counts follow the filters.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (typeFilter === "custom" && !isCustom(o)) return false;
      if (typeFilter === "catalogue" && isCustom(o)) return false;
      if (country && o.country !== country) return false;
      const day = pktDay(o.createdAt);
      if (fromDay && day < fromDay) return false;
      if (toDay && day > toDay) return false;
      if (!q) return true;
      return [o.id, o.customerName, o.customerPhone, o.customerEmail, o.paymentSubmission?.transferReference, o.paymentSubmission?.senderName]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [orders, query, typeFilter, country, fromDay, toDay]);

  const counts = useMemo(() => {
    const c: Record<SheetTab, number> = { needs: 0, verified: 0, production: 0, dispatched: 0, all: filtered.length };
    filtered.forEach((o) => {
      const t = sheetTabOf(o);
      if (t !== "other") c[t] += 1;
    });
    return c;
  }, [filtered]);

  const rows = useMemo(
    () =>
      filtered
        .filter((o) => tab === "all" || sheetTabOf(o) === tab)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [filtered, tab]
  );

  const totals = useMemo(
    () => ({
      total: rows.reduce((t, o) => t + (Number(o.totalAmount) || 0), 0),
      paid: rows.reduce((t, o) => t + paidOf(o), 0),
      balance: rows.reduce((t, o) => t + balanceOf(o), 0),
    }),
    [rows]
  );

  const messageInput = (o: Order): MessageInput => ({
    orderId: o.id,
    customerName: o.customerName,
    country: o.country,
    items: itemsSummary(o.items),
    total: money(Number(o.totalAmount) || 0),
    reported: reportedOf(o) || undefined,
    plan: planLabelOf(o),
    paid: money(paidOf(o)),
    balance: money(sheetBalanceOf(o).amount),
    reason: o.paymentSubmission?.rejectionReason,
    reupload: stageOf(o) === "reupload",
    tracking: trackingOf(o),
    bankDetails: bankDetails || undefined,
    isCustomBat: isCustom(o),
    orderLink:
      typeof window !== "undefined"
        ? `${window.location.origin}/checkout/invoice/${encodeURIComponent(o.id)}${o.trackingToken ? `?token=${encodeURIComponent(o.trackingToken)}` : ""}`
        : undefined,
  });

  const waHref = (o: Order) => whatsappUrl(buildMessage(messageEventFor(o), messageInput(o), lang).text, phoneDigits(o));

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${what} copied`, "success");
    } catch {
      showToast("Could not copy. Select the text and copy it instead.", "error");
    }
  };

  // ── Server actions ──────────────────────────────────────────────────────
  const post = async (url: string, body: unknown) => {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.status === 401) {
      window.location.assign("/admin");
      return { success: false, error: "Signed out" };
    }
    return res.json().catch(() => ({ success: false, error: `HTTP ${res.status}` }));
  };

  const verify = async (o: Order) => {
    const sub = o.paymentSubmission;
    if (!sub) return;
    setBusy(true);
    try {
      const json = await post(`/api/admin/payments/${encodeURIComponent(sub.id)}/verify`, { confirmedInUblAccount: true });
      if (json.success) {
        showToast(`${o.id}: payment received ✓. Confirmation sent to the customer.`, "success");
        setModal(null);
        await load();
      } else showToast(json.error || "Could not mark the payment as received", "error");
    } catch {
      showToast("Network error. Nothing was changed.", "error");
    } finally {
      setBusy(false);
    }
  };

  const reject = async (o: Order) => {
    const sub = o.paymentSubmission;
    if (!sub || !rejectReason.trim()) return;
    setBusy(true);
    try {
      const json = await post(`/api/admin/payments/${encodeURIComponent(sub.id)}/reject`, { rejectionReason: rejectReason.trim(), requestReupload: askReupload });
      if (json.success) {
        showToast(askReupload ? `${o.id}: new screenshot requested` : `${o.id}: payment rejected`, "info");
        setModal(null);
        setRejectReason("");
        await load();
      } else showToast(json.error || "Could not reject the payment", "error");
    } catch {
      showToast("Network error. Nothing was changed.", "error");
    } finally {
      setBusy(false);
    }
  };

  const reopen = async (o: Order) => {
    const sub = o.paymentSubmission;
    if (!sub || reopenReason.trim().length < 3) return;
    setBusy(true);
    try {
      const json = await post(`/api/admin/payments/${encodeURIComponent(sub.id)}/reopen`, { reason: reopenReason.trim() });
      if (json.success) {
        showToast(`${o.id}: moved back to "Needs checking"`, "info");
        setModal(null);
        setReopenReason("");
        await load();
      } else showToast(json.error || "Could not reopen the payment", "error");
    } catch {
      showToast("Network error. Nothing was changed.", "error");
    } finally {
      setBusy(false);
    }
  };

  const saveNote = async (o: Order) => {
    const draft = noteDrafts[o.id];
    if (draft === undefined || draft.trim() === adminNoteOf(o)) {
      setNoteDrafts((d) => {
        const n = { ...d };
        delete n[o.id];
        return n;
      });
      return;
    }
    try {
      const json = await post(`/api/admin/orders/${encodeURIComponent(o.id)}/note`, { note: draft.trim() });
      if (json.success) {
        setOrders((list) => list.map((x) => (x.id === o.id && json.data ? { ...x, notes: json.data.notes } : x)));
        setNoteDrafts((d) => {
          const n = { ...d };
          delete n[o.id];
          return n;
        });
        showToast(`${o.id}: note saved`, "success");
      } else showToast(json.error || "Could not save the note", "error");
    } catch {
      showToast("Network error while saving the note", "error");
    }
  };

  const resend = async (o: Order) => {
    try {
      const json = await post(`/api/admin/orders/${encodeURIComponent(o.id)}/notifications/retry`, { event: messageEventFor(o) });
      showToast(json.success ? `${o.id}: message sent again` : json.error || "Could not resend", json.success ? "success" : "error");
      if (json.success) await load();
    } catch {
      showToast("Network error while resending", "error");
    }
  };

  const changeStatus = async (o: Order, status: string, note: string) => {
    setBusy(true);
    try {
      const json = await post(`/api/admin/orders/${encodeURIComponent(o.id)}/status`, { status, note });
      if (json.success) {
        const label = STATUS_OPTIONS.find((s) => s.value === status)?.label || status;
        showToast(`${o.id}: ${label}`, "success");
        setStepNote("");
        setManualStatus("");
        await load();
      } else showToast(json.error || "Could not update the status", "error");
    } catch {
      showToast("Network error while updating the status", "error");
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = () => {
    const head = [
      "Payment checked", "Checked at (PKT)", "Order #", "Date (PKT)", "Customer", "WhatsApp / Phone", "Email", "Delivery address", "Country", "Items",
      "Total GBP", "Paid now (reported)", "Plan", "Balance GBP", "Method", "Sender", "Reference", "Transfer date", "Screenshot (admin link)", "Status", "Email message", "WhatsApp message", "Notes",
    ];
    const esc = (v: unknown) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = rows.map((o) => {
      const sub = o.paymentSubmission;
      return [
        isVerifiedSub(o) ? "Yes" : "No",
        sub?.verifiedAt ? formatPkt(sub.verifiedAt) : "",
        o.id,
        formatPkt(o.createdAt),
        o.customerName,
        o.customerPhone || "",
        o.customerEmail || "",
        addressOf(o),
        o.country,
        itemsSummary(o.items),
        Number(o.totalAmount) || 0,
        reportedOf(o),
        planLabelOf(o),
        sheetBalanceOf(o).amount,
        sub?.provider || sub?.paymentMethod || o.paymentMethod || "",
        sub?.senderName || "",
        sub?.transferReference || "",
        sub?.transferDate || "",
        sub ? `${window.location.origin}${receiptUrl(sub.id)}` : "",
        STAGE_LABEL[stageOf(o)],
        lastMessageOf(o, "email").status,
        lastMessageOf(o, "whatsapp").status,
        adminNoteOf(o),
      ].map(esc).join(",");
    });
    const blob = new Blob(["﻿" + [head.join(","), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Sialkot_Cricket_Kits_Orders_${tab}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  };

  const openFromRow = (e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).closest("button, a, input, textarea, select, label")) return;
    setStepNote("");
    setManualStatus("");
    setOpenId(id);
  };

  // ── Cells ───────────────────────────────────────────────────────────────
  const tickCell = (o: Order) => {
    const stage = stageOf(o);
    const sub = o.paymentSubmission;
    if (stage === "check" && sub) {
      return (
        <button type="button" role="checkbox" aria-checked={false} className="sh-tick" onClick={() => setModal({ kind: "verify", order: o })} aria-label={`Tick payment received for order ${o.id}`}>
          <span className="sh-box" aria-hidden="true" />
          <span className="sh-tick-label">Tick</span>
        </button>
      );
    }
    if (isVerifiedSub(o) || rowToneOf(o) === "green") {
      return (
        <div className="sh-tick done">
          <span className="sh-box checked" role="img" aria-label="Payment checked">
            <Check size={16} strokeWidth={3} aria-hidden="true" />
          </span>
          <span className="sh-tick-time">{sub?.verifiedAt ? formatPkt(sub.verifiedAt) : "Checked"}</span>
          {sub && REOPENABLE.includes(stage) && (
            <button type="button" className="sh-mini" onClick={() => setModal({ kind: "reopen", order: o })}>
              Reopen
            </button>
          )}
        </div>
      );
    }
    if (stage === "reupload" || stage === "rejected") {
      return (
        <div className="sh-tick no">
          <span className="sh-box crossed" aria-hidden="true">
            <X size={14} strokeWidth={3} />
          </span>
          <span className="sh-tick-time">{stage === "reupload" ? "New receipt asked" : "Rejected"}</span>
        </div>
      );
    }
    return (
      <div className="sh-tick off">
        <span className="sh-box disabled" aria-hidden="true" />
        <span className="sh-tick-time">{sub ? "—" : "No screenshot"}</span>
      </div>
    );
  };

  const shotCell = (o: Order) => {
    const sub = o.paymentSubmission;
    if (!sub || !sub.receiptStoragePath) return <span className="sh-noshot">No screenshot</span>;
    const isImage = (sub.receiptMimeType || "image/").startsWith("image/");
    return (
      <button type="button" className="sh-shot" onClick={() => { setZoomed(false); setLightbox({ src: receiptUrl(sub.id), title: `Payment screenshot · ${o.id}`, isImage }); }} aria-label={`Open payment screenshot for order ${o.id}`}>
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={receiptUrl(sub.id)} alt="" loading="lazy" decoding="async" width={56} height={56} />
        ) : (
          <FileText size={22} aria-hidden="true" />
        )}
      </button>
    );
  };

  const msgCell = (o: Order) => {
    const em = lastMessageOf(o, "email");
    const wa = lastMessageOf(o, "whatsapp");
    const label = (s: string) => (s === "sent" ? "Sent" : s === "failed" ? "Failed" : s === "simulated" ? "Not sent (setup)" : "Not sent");
    return (
      <div className="sh-msgs">
        <span className={`sh-msg ${em.status}`} title={`Email: ${label(em.status)}${em.at ? ` · ${formatPkt(em.at)}` : ""}`}>
          <Mail size={14} aria-hidden="true" /> {em.status === "sent" ? "✓" : em.status === "failed" ? "✗" : "–"}
          <span className="ord-sr">Email {label(em.status)}</span>
        </span>
        <span className={`sh-msg ${wa.status}`} title={`WhatsApp: ${label(wa.status)}${wa.at ? ` · ${formatPkt(wa.at)}` : ""}`}>
          <MessageCircle size={14} aria-hidden="true" /> {wa.status === "sent" ? "✓" : wa.status === "failed" ? "✗" : "–"}
          <span className="ord-sr">WhatsApp {label(wa.status)}</span>
        </span>
        <span className="sh-msg-actions">
          <button type="button" className="sh-mini" onClick={() => resend(o)}>Resend</button>
          {phoneDigits(o) && (
            <a className="sh-mini wa" href={waHref(o)} target="_blank" rel="noopener noreferrer">
              Send on WhatsApp
            </a>
          )}
        </span>
      </div>
    );
  };

  const noteCell = (o: Order) => (
    <>
      <label className="ord-sr" htmlFor={`note-${o.id}`}>Note for order {o.id}</label>
      <textarea
        id={`note-${o.id}`}
        className="sh-note"
        rows={2}
        maxLength={300}
        value={noteDrafts[o.id] ?? adminNoteOf(o)}
        placeholder="Add a note"
        onChange={(e) => setNoteDrafts((d) => ({ ...d, [o.id]: e.target.value }))}
        onBlur={() => saveNote(o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            (e.target as HTMLTextAreaElement).blur();
          }
        }}
      />
    </>
  );

  const paidCell = (o: Order) => {
    const rep = reportedOf(o);
    const under = isUnderpaid(o);
    return (
      <div className="sh-two num">
        <strong className={under ? "sh-under" : ""}>{rep || "—"}{under ? " ⚠️" : ""}</strong>
        <span>{planLabelOf(o)}{under ? ` · needs ${money(requiredNowOf(o))}` : ""}</span>
      </div>
    );
  };

  const balanceCell = (o: Order) => {
    const b = sheetBalanceOf(o);
    return (
      <div className="sh-two num">
        <strong className={b.amount > 0 && !b.planned ? "due" : ""}>{money(b.amount)}</strong>
        {b.planned && b.amount > 0 && <span>after deposit</span>}
      </div>
    );
  };

  const payCell = (o: Order) => {
    const sub = o.paymentSubmission;
    if (!sub) return <span className="muted">{o.paymentMethod || "—"}</span>;
    return (
      <div className="sh-pay">
        <span>{(sub.provider || sub.paymentMethod || "").replace(/\s*\(.*\)$/, "") || "—"}</span>
        <span>From: {sub.senderName || "—"}</span>
        <span className="ord-mono">Ref: {sub.transferReference || "—"}</span>
        <span>{sub.transferDate || ""}</span>
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="ord sh">
      <header className="ord-head">
        <div>
          <h1>Orders</h1>
          <p>One row per order. Tick the box once you have checked the payment in your bank. Pakistan time · GBP.</p>
        </div>
        <div className="ord-head-actions">
          <div className="sh-lang" role="group" aria-label="Message language">
            <span>Messages:</span>
            <button type="button" aria-pressed={lang === "en"} className={lang === "en" ? "on" : ""} onClick={() => chooseLang("en")}>English</button>
            <button type="button" aria-pressed={lang === "ur"} className={lang === "ur" ? "on" : ""} onClick={() => chooseLang("ur")}>Roman Urdu</button>
          </div>
          <button type="button" className="ord-btn" onClick={load} disabled={loading} aria-label="Refresh orders">
            <RefreshCw size={16} className={loading ? "ord-spin" : ""} aria-hidden="true" />
            <span className="ord-hide-sm">Refresh</span>
          </button>
          <button type="button" className="ord-btn" onClick={exportCsv} disabled={rows.length === 0}>
            <Download size={16} aria-hidden="true" />
            <span className="ord-hide-sm">Export (Excel)</span>
          </button>
        </div>
      </header>

      <div className="sh-tabs" role="tablist" aria-label="Order lists">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`sh-tab ${tab === t.id ? "on" : ""} ${t.id === "needs" && counts.needs > 0 ? "urgent" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
            <span className="sh-count">{loading ? "–" : counts[t.id]}</span>
          </button>
        ))}
      </div>

      <div className={`sh-filters ${filtersOpen ? "open" : ""}`}>
        <label className="ord-search">
          <Search size={16} aria-hidden="true" />
          <span className="ord-sr">Search orders</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, phone, email, order # or reference" />
        </label>
        <button type="button" className="ord-btn sh-filter-toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((v) => !v)}>
          Filters{fromDay || toDay || country || typeFilter !== "all" ? " •" : ""}
        </button>
        <label className="sh-filter">
          <span>From</span>
          <input type="date" value={fromDay} onChange={(e) => setFromDay(e.target.value)} />
        </label>
        <label className="sh-filter">
          <span>To</span>
          <input type="date" value={toDay} onChange={(e) => setToDay(e.target.value)} />
        </label>
        <label className="sh-filter">
          <span>Country</span>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">All countries</option>
            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="sh-filter">
          <span>Type</span>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as "all" | "custom" | "catalogue")}>
            <option value="all">All types</option>
            <option value="custom">Custom bats</option>
            <option value="catalogue">Catalogue</option>
          </select>
        </label>
      </div>

      <div className="sh-totals" aria-live="polite">
        <span><strong>{rows.length}</strong> order{rows.length === 1 ? "" : "s"}</span>
        <span>Total <strong>{money(totals.total)}</strong></span>
        <span>Paid (checked) <strong>{money(totals.paid)}</strong></span>
        <span>Balance due <strong className={totals.balance > 0 ? "due" : ""}>{money(totals.balance)}</strong></span>
      </div>

      {/* Laptop: the sheet */}
      <div className="sh-wrap">
        <table className="sh-table">
          <thead>
            <tr>
              <th scope="col" className="c-tick fz1">✓ Payment checked</th>
              <th scope="col" className="c-id fz2">Order # / Date</th>
              <th scope="col" className="c-name">Customer name</th>
              <th scope="col" className="c-phone">WhatsApp / Phone</th>
              <th scope="col" className="c-email">Email</th>
              <th scope="col" className="c-addr">Delivery address</th>
              <th scope="col" className="c-items">Items</th>
              <th scope="col" className="c-money num">Total £</th>
              <th scope="col" className="c-paid num">Paid now</th>
              <th scope="col" className="c-money num">Balance £</th>
              <th scope="col" className="c-pay">Payment details</th>
              <th scope="col" className="c-shot">Screenshot</th>
              <th scope="col" className="c-status">Status</th>
              <th scope="col" className="c-msg">Messages</th>
              <th scope="col" className="c-note">Notes</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk${i}`}>
                  <td colSpan={15}><span className="ord-skel" /></td>
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={15} className="ord-empty">{tab === "needs" ? "Nothing to check right now." : "No orders here."}</td>
              </tr>
            )}
            {!loading &&
              rows.map((o) => {
                const tone = rowToneOf(o);
                const addr = addressOf(o);
                return (
                  <tr key={o.id} className={`tone-row-${tone}`} onClick={(e) => openFromRow(e, o.id)}>
                    <td className="c-tick fz1">{tickCell(o)}</td>
                    <td className="c-id fz2">
                      <button type="button" className="ord-id" onClick={() => setOpenId(o.id)}>{o.id}</button>
                      <span className="sh-date">{formatPkt(o.createdAt)}</span>
                      {isCustom(o) && <span className="ord-type custom">Custom bat</span>}
                    </td>
                    <td className="c-name"><strong>{o.customerName}</strong></td>
                    <td className="c-phone">
                      {o.customerPhone ? (
                        <div className="sh-contact">
                          <a href={whatsappUrl(`Assalam o Alaikum ${(o.customerName || "").split(" ")[0]}, this is Sialkot Cricket Kits about your order ${o.id}.`, phoneDigits(o))} target="_blank" rel="noopener noreferrer" className="sh-wa">
                            <MessageCircle size={14} aria-hidden="true" /> {o.customerPhone}
                          </a>
                          <button type="button" className="sh-copy" aria-label={`Copy phone of ${o.customerName}`} onClick={() => copy(o.customerPhone || "", "Phone")}><Copy size={13} aria-hidden="true" /></button>
                        </div>
                      ) : <span className="muted">—</span>}
                    </td>
                    <td className="c-email">
                      {o.customerEmail ? (
                        <div className="sh-contact">
                          <a href={`mailto:${o.customerEmail}?subject=${encodeURIComponent(`Your order ${o.id} — Sialkot Cricket Kits`)}`}>{o.customerEmail}</a>
                          <button type="button" className="sh-copy" aria-label={`Copy email of ${o.customerName}`} onClick={() => copy(o.customerEmail || "", "Email")}><Copy size={13} aria-hidden="true" /></button>
                        </div>
                      ) : <span className="muted">—</span>}
                    </td>
                    <td className="c-addr">
                      <div className="sh-contact top">
                        <span className="sh-addr">{addr || o.country || "—"}</span>
                        {addr && <button type="button" className="sh-copy" aria-label={`Copy address of ${o.customerName}`} onClick={() => copy(addr, "Address")}><Copy size={13} aria-hidden="true" /></button>}
                      </div>
                    </td>
                    <td className="c-items">
                      {o.items.map((it, i) => (
                        <div key={`${it.productId}-${i}`} className="sh-item">
                          <span>{it.customSpec ? it.name : `${it.name} × ${it.quantity}`}</span>
                          <SpecLine item={it} />
                        </div>
                      ))}
                    </td>
                    <td className="c-money num"><strong>{money(Number(o.totalAmount) || 0)}</strong></td>
                    <td className="c-paid num">{paidCell(o)}</td>
                    <td className="c-money num">{balanceCell(o)}</td>
                    <td className="c-pay">{payCell(o)}</td>
                    <td className="c-shot">{shotCell(o)}</td>
                    <td className="c-status"><StagePill stage={stageOf(o)} /></td>
                    <td className="c-msg">{msgCell(o)}</td>
                    <td className="c-note">{noteCell(o)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Phone: one card per order, same order of information */}
      <div className="sh-cards">
        {loading && Array.from({ length: 3 }).map((_, i) => <div key={`skc${i}`} className="ord-card ord-skel-card" />)}
        {!loading && rows.length === 0 && <p className="ord-empty">{tab === "needs" ? "Nothing to check right now." : "No orders here."}</p>}
        {!loading &&
          rows.map((o) => {
            const addr = addressOf(o);
            return (
              <article key={o.id} className={`sh-card tone-row-${rowToneOf(o)}`}>
                <div className="sh-card-top">
                  {tickCell(o)}
                  <div className="sh-card-id">
                    <button type="button" className="ord-id" onClick={() => setOpenId(o.id)}>{o.id}</button>
                    <span className="sh-date">{formatPkt(o.createdAt)}</span>
                  </div>
                  <StagePill stage={stageOf(o)} />
                </div>
                <h3 className="sh-card-name">{o.customerName}</h3>
                <div className="sh-card-contact">
                  {o.customerPhone && (
                    <a href={whatsappUrl(`Assalam o Alaikum ${(o.customerName || "").split(" ")[0]}, this is Sialkot Cricket Kits about your order ${o.id}.`, phoneDigits(o))} target="_blank" rel="noopener noreferrer" className="sh-card-wa">
                      <MessageCircle size={15} aria-hidden="true" /> {o.customerPhone}
                    </a>
                  )}
                  {o.customerEmail && <a href={`mailto:${o.customerEmail}`} className="sh-card-mail">{o.customerEmail}</a>}
                </div>
                <div className="sh-card-addr">
                  <span>{addr || o.country || "—"}</span>
                  {addr && <button type="button" className="sh-copy" aria-label="Copy address" onClick={() => copy(addr, "Address")}><Copy size={13} aria-hidden="true" /></button>}
                </div>
                <div className="sh-card-items">
                  {o.items.map((it, i) => <span key={i} className="sh-item">{it.customSpec ? it.name : `${it.name} × ${it.quantity}`} <SpecLine item={it} /></span>)}
                </div>
                <div className="sh-card-money">
                  <div><span>Total</span><strong>{money(Number(o.totalAmount) || 0)}</strong></div>
                  <div><span>Paid now</span>{paidCell(o)}</div>
                  <div><span>Balance</span>{balanceCell(o)}</div>
                </div>
                <div className="sh-card-payrow">
                  {shotCell(o)}
                  {payCell(o)}
                </div>
                <div className="sh-card-foot">
                  {msgCell(o)}
                  {noteCell(o)}
                </div>
              </article>
            );
          })}
      </div>

      {/* Tick / reject / reopen confirm box */}
      {modal && (
        <div className="ord-backdrop sh-modal-back" onClick={() => !busy && setModal(null)}>
          <div className="sh-modal" role="dialog" aria-modal="true" aria-labelledby="sh-modal-title" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const o = modal.order;
              const sub = o.paymentSubmission;
              const under = isUnderpaid(o);
              const isImage = (sub?.receiptMimeType || "image/").startsWith("image/");
              if (modal.kind === "reopen") {
                return (
                  <>
                    <h2 id="sh-modal-title">Reopen payment · {o.id}</h2>
                    <p>The tick will be removed and the order goes back to <strong>Needs checking</strong>. This is written in the order history.</p>
                    <label className="ord-field">
                      <span>Reason (required)</span>
                      <textarea rows={3} value={reopenReason} onChange={(e) => setReopenReason(e.target.value)} placeholder="e.g. Amount not found in the bank statement" autoFocus />
                    </label>
                    <div className="sh-modal-actions">
                      <button type="button" className="ord-btn" onClick={() => setModal(null)} disabled={busy}>Cancel</button>
                      <button type="button" className="ord-btn danger" onClick={() => reopen(o)} disabled={busy || reopenReason.trim().length < 3}>
                        <RotateCcw size={16} aria-hidden="true" /> Reopen
                      </button>
                    </div>
                  </>
                );
              }
              return (
                <>
                  <h2 id="sh-modal-title">{modal.kind === "reject" ? "Reject payment" : "Payment received?"} · {o.id}</h2>
                  <div className="sh-modal-body">
                    {sub && sub.receiptStoragePath ? (
                      isImage ? (
                        <a href={receiptUrl(sub.id)} target="_blank" rel="noopener noreferrer" className="sh-modal-shot" aria-label="Open screenshot full size">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={receiptUrl(sub.id)} alt={`Payment screenshot for order ${o.id}`} />
                        </a>
                      ) : (
                        <a href={receiptUrl(sub.id)} target="_blank" rel="noopener noreferrer" className="sh-modal-shot doc"><FileText size={28} aria-hidden="true" /> Open receipt</a>
                      )
                    ) : (
                      <div className="sh-modal-shot doc">No screenshot uploaded</div>
                    )}
                    <dl className="sh-modal-kv">
                      <div><dt>Customer</dt><dd>{o.customerName}</dd></div>
                      <div><dt>Amount reported</dt><dd className={under ? "sh-under" : ""}><strong>{reportedOf(o) || "—"}</strong></dd></div>
                      <div><dt>Amount required now</dt><dd><strong>{money(requiredNowOf(o))}</strong> <span className="muted">({planLabelOf(o)})</span></dd></div>
                      <div><dt>Order total</dt><dd>{money(Number(o.totalAmount) || 0)}</dd></div>
                      <div><dt>Sender name</dt><dd>{sub?.senderName || "—"}</dd></div>
                      <div><dt>Reference</dt><dd className="ord-mono">{sub?.transferReference || "—"}</dd></div>
                      <div><dt>Method</dt><dd>{(sub?.provider || sub?.paymentMethod || "—").replace(/\s*\(.*\)$/, "")}</dd></div>
                      <div><dt>Transfer date</dt><dd>{sub?.transferDate || "—"}</dd></div>
                    </dl>
                  </div>
                  {under && (
                    <div className="sh-warn" role="alert">
                      <AlertTriangle size={18} aria-hidden="true" />
                      <span>The customer reported <strong>{reportedOf(o)}</strong>, but <strong>{money(requiredNowOf(o))}</strong> was required. Check the bank before ticking.</span>
                    </div>
                  )}
                  {modal.kind === "reject" ? (
                    <>
                      <label className="ord-field">
                        <span>Reason (the customer will see this)</span>
                        <textarea rows={2} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. The screenshot is not readable" autoFocus />
                      </label>
                      <label className="ord-check">
                        <input type="checkbox" checked={askReupload} onChange={(e) => setAskReupload(e.target.checked)} />
                        <span>Ask the customer to send a new screenshot</span>
                      </label>
                      <div className="sh-modal-actions">
                        <button type="button" className="ord-btn" onClick={() => setModal({ kind: "verify", order: o })} disabled={busy}>Back</button>
                        <button type="button" className="ord-btn danger" onClick={() => reject(o)} disabled={busy || !rejectReason.trim()}>
                          {askReupload ? "Ask for new screenshot" : "Reject payment"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="sh-modal-note">Only tick after you see this money in your bank / Wise account. The customer then gets a confirmation by email and WhatsApp.</p>
                      <div className="sh-modal-actions">
                        <button type="button" className="sh-reject-link" onClick={() => setModal({ kind: "reject", order: o })} disabled={busy}>Reject…</button>
                        <span className="grow" />
                        <button type="button" className="ord-btn" onClick={() => setModal(null)} disabled={busy}>Cancel</button>
                        <button type="button" className="ord-btn primary sh-yes" onClick={() => verify(o)} disabled={busy || !sub}>
                          <Check size={18} aria-hidden="true" /> Yes, payment received
                        </button>
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Screenshot viewer */}
      {lightbox && (
        <div className="sh-light" role="dialog" aria-modal="true" aria-label={lightbox.title} onClick={() => setLightbox(null)}>
          <div className="sh-light-bar" onClick={(e) => e.stopPropagation()}>
            <span>{lightbox.title}</span>
            <span className="grow" />
            {lightbox.isImage && (
              <button type="button" className="ord-btn" onClick={() => setZoomed((z) => !z)}>
                {zoomed ? <ZoomOut size={16} aria-hidden="true" /> : <ZoomIn size={16} aria-hidden="true" />} {zoomed ? "Fit" : "Zoom"}
              </button>
            )}
            <a className="ord-btn" href={lightbox.src} download>
              <Download size={16} aria-hidden="true" /> Download
            </a>
            <a className="ord-btn" href={lightbox.src} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={16} aria-hidden="true" /> Open
            </a>
            <button type="button" className="ord-btn" onClick={() => setLightbox(null)} aria-label="Close screenshot"><X size={16} aria-hidden="true" /></button>
          </div>
          <div className={`sh-light-img ${zoomed ? "zoomed" : ""}`} onClick={(e) => e.stopPropagation()}>
            {lightbox.isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lightbox.src} alt={lightbox.title} onClick={() => setZoomed((z) => !z)} />
            ) : (
              <a className="ord-btn primary" href={lightbox.src} target="_blank" rel="noopener noreferrer"><FileText size={16} aria-hidden="true" /> Open the receipt file</a>
            )}
          </div>
        </div>
      )}

      {/* Order details panel */}
      {open && !modal && (
        <div className="ord-backdrop" onClick={() => setOpenId(null)}>
          <aside className="ord-drawer" role="dialog" aria-modal="true" aria-label={`Order ${open.id}`} onClick={(e) => e.stopPropagation()}>
            {(() => {
              const stage = stageOf(open);
              const sub = open.paymentSubmission;
              const plan = planOf(open);
              const step = nextStepOf(open);
              const bal = balanceOf(open);
              const address = addressOf(open);
              const warnings = warningsOf(open);
              const legacySpec =
                !open.items.some((i) => i.customSpec) && (open.notes || "").includes("--- CUSTOM BAT SPECIFICATIONS ---")
                  ? (open.notes || "").split("--- CUSTOM BAT SPECIFICATIONS ---")[1].split("\n").map((l) => l.trim()).filter((l) => /^[A-Z][A-Za-z ]+:/.test(l)).slice(0, 10)
                  : [];
              const invoiceHref = `/checkout/invoice/${encodeURIComponent(open.id)}${open.trackingToken ? `?token=${encodeURIComponent(open.trackingToken)}` : ""}`;
              return (
                <>
                  <div className="ord-drawer-head">
                    <div>
                      <span className="ord-mono">{open.id}</span>
                      <h2>{open.customerName}</h2>
                      <span className="muted">{formatPkt(open.createdAt)} · {isCustom(open) ? "Custom bat" : "Catalogue"}</span>
                    </div>
                    <div className="ord-drawer-head-right">
                      <StagePill stage={stage} />
                      <button ref={closeRef} type="button" className="ord-icon" aria-label="Close order details" onClick={() => setOpenId(null)}>
                        <X size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="ord-quick">
                    {phoneDigits(open) && (
                      <a className="ord-btn wa" href={waHref(open)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle size={16} aria-hidden="true" /> Send on WhatsApp
                      </a>
                    )}
                    {open.customerEmail && <a className="ord-btn" href={`mailto:${open.customerEmail}?subject=${encodeURIComponent(`Your order ${open.id} — Sialkot Cricket Kits`)}`}>Email</a>}
                    <a className="ord-btn" href={invoiceHref} target="_blank" rel="noopener noreferrer"><FileText size={16} aria-hidden="true" /> Invoice</a>
                  </div>

                  {warnings.length > 0 && (
                    <div className="ord-warn" role="alert">
                      <AlertTriangle size={16} aria-hidden="true" />
                      <div>{warnings.map((w) => <p key={w}>{w}</p>)}</div>
                    </div>
                  )}

                  {sub && (
                    <section className="ord-sec">
                      <h3>Payment</h3>
                      <div className="ord-pay">
                        {sub.receiptStoragePath && (
                          <button type="button" className="ord-receipt" onClick={() => { setZoomed(false); setLightbox({ src: receiptUrl(sub.id), title: `Payment screenshot · ${open.id}`, isImage: (sub.receiptMimeType || "image/").startsWith("image/") }); }} aria-label="Open screenshot">
                            {(sub.receiptMimeType || "image/").startsWith("image/") ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={receiptUrl(sub.id)} alt={`Payment receipt for ${open.id}`} loading="lazy" />
                            ) : (
                              <FileText size={22} aria-hidden="true" />
                            )}
                          </button>
                        )}
                        <dl className="ord-kv">
                          {plan && <div><dt>Due at order ({plan.percent}%)</dt><dd>{money(plan.due)}</dd></div>}
                          <div><dt>Customer says sent</dt><dd>{reportedOf(open) || "—"}</dd></div>
                          <div><dt>Method</dt><dd>{sub.provider || sub.paymentMethod}</dd></div>
                          <div><dt>Reference</dt><dd className="ord-mono">{sub.transferReference}</dd></div>
                          <div><dt>Sender</dt><dd>{sub.senderName}</dd></div>
                          <div><dt>Transfer date</dt><dd>{sub.transferDate}</dd></div>
                          {sub.verifiedAt && <div><dt>Ticked</dt><dd>{formatPkt(sub.verifiedAt)}</dd></div>}
                        </dl>
                      </div>
                      {stage === "check" && (
                        <div className="ord-row">
                          <button type="button" className="ord-btn primary grow" onClick={() => setModal({ kind: "verify", order: open })}>
                            <Check size={16} aria-hidden="true" /> Tick: payment received…
                          </button>
                          <button type="button" className="ord-btn" onClick={() => setModal({ kind: "reject", order: open })}>Reject…</button>
                        </div>
                      )}
                    </section>
                  )}

                  {step && !step.check && (
                    <section className="ord-sec">
                      <h3>Next step</h3>
                      <label className="ord-field">
                        <span>{step.status === "dispatched" ? "Courier and tracking number (required, the customer will see it)" : "Note (optional)"}</span>
                        <input type="text" value={stepNote} onChange={(e) => setStepNote(e.target.value)} placeholder={step.status === "dispatched" ? "e.g. DHL 1234567890" : "Visible in the order history"} />
                      </label>
                      <button
                        type="button"
                        className="ord-btn primary"
                        disabled={busy || (step.status === "dispatched" && !stepNote.trim())}
                        onClick={() =>
                          confirmAction({
                            title: `${step.label}?`,
                            message: `${open.id} (${open.customerName}) will move to "${STATUS_OPTIONS.find((x) => x.value === step.status)?.label || step.label}".`,
                            confirmText: step.label,
                            cancelText: "Cancel",
                            onConfirm: () => changeStatus(open, step.status as string, stepNote.trim()),
                          })
                        }
                      >
                        {step.label}
                      </button>
                      {bal > 0 && (step.status === "ready_for_dispatch" || step.status === "dispatched") && <p className="ord-hint due">Balance of {money(bal)} is still due before dispatch.</p>}
                    </section>
                  )}

                  <section className="ord-sec">
                    <h3>Items</h3>
                    <ul className="ord-items-list">
                      {open.items.map((it, idx) => (
                        <li key={`${it.productId}-${idx}`}>
                          <div className="ord-row between">
                            <span>{it.customSpec ? it.name : `${it.name} × ${it.quantity}`}</span>
                            <strong>{money(it.price * it.quantity)}</strong>
                          </div>
                          <SpecList item={it} />
                        </li>
                      ))}
                    </ul>
                    {legacySpec.length > 0 && (
                      <dl className="ord-spec">
                        {legacySpec.map((l) => {
                          const [k, ...rest] = l.split(":");
                          return (
                            <div key={l} className={k === "Special Notes" ? "wide" : ""}>
                              <dt>{k}</dt>
                              <dd>{rest.join(":").trim()}</dd>
                            </div>
                          );
                        })}
                      </dl>
                    )}
                    <dl className="ord-kv totals">
                      <div><dt>Total</dt><dd>{money(Number(open.totalAmount) || 0)}</dd></div>
                      <div><dt>Paid (checked)</dt><dd>{paidOf(open) ? money(paidOf(open)) : "—"}</dd></div>
                      <div><dt>Balance</dt><dd className={bal > 0 ? "due" : ""}>{bal > 0 ? money(bal) : "—"}</dd></div>
                    </dl>
                  </section>

                  <section className="ord-sec">
                    <h3>Customer</h3>
                    <dl className="ord-kv">
                      <div><dt>Phone</dt><dd>{open.customerPhone || "—"}</dd></div>
                      <div><dt>Email</dt><dd>{open.customerEmail || "—"}</dd></div>
                      <div><dt>Country</dt><dd>{open.country}</dd></div>
                      {address && <div className="wide"><dt>Address</dt><dd>{address}</dd></div>}
                    </dl>
                  </section>

                  <section className="ord-sec">
                    <h3>Change status</h3>
                    <div className="ord-row wrap">
                      <label className="ord-sr" htmlFor="ord-status-select">New status</label>
                      <select id="ord-status-select" className="ord-select" value={manualStatus} onChange={(e) => setManualStatus(e.target.value)}>
                        <option value="">Choose a status…</option>
                        {STATUS_OPTIONS.filter((s) => s.value !== "order_confirmed").map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <button type="button" className="ord-btn" disabled={!manualStatus || busy || (manualStatus === "dispatched" && !stepNote.trim())} onClick={() => changeStatus(open, manualStatus, stepNote.trim())}>
                        Save
                      </button>
                    </div>
                    {manualStatus === "dispatched" && !stepNote.trim() && <p className="ord-hint">Type the courier and tracking number in “Next step” first.</p>}
                  </section>

                  <section className="ord-sec">
                    <h3>History</h3>
                    <ol className="ord-history">
                      <li>{formatPkt(open.createdAt)} — Order placed{sub ? " with payment screenshot" : ""}</li>
                      {historyOf(open).map((h) => <li key={h}>{h}</li>)}
                    </ol>
                    <button type="button" className="ord-link" onClick={() => resend(open)}>
                      <ExternalLink size={14} aria-hidden="true" /> Resend the latest email / WhatsApp
                    </button>
                  </section>
                </>
              );
            })()}
          </aside>
        </div>
      )}
    </div>
  );
}
