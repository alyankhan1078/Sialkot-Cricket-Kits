"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  MessageCircle,
  RefreshCw,
  Search,
  X,
  AlertTriangle,
} from "lucide-react";
import type { DBOrder, DBPaymentSubmission, OrderItem } from "@/src/lib/data-service";
import type { NotificationLog } from "@/src/lib/notifications";
import { useAdminFeedback } from "@/src/components/AdminFeedbackContext";
import { whatsappUrl } from "@/src/lib/whatsapp";
import "./orders.css";

type Order = DBOrder & {
  paymentSubmission?: DBPaymentSubmission | null;
  notificationLogs?: NotificationLog[];
};

type Stage =
  | "check"
  | "reupload"
  | "awaiting"
  | "confirmed"
  | "production"
  | "pictures"
  | "balance_requested"
  | "balance_paid"
  | "ready"
  | "dispatched"
  | "delivered"
  | "rejected"
  | "cancelled"
  | "refunded";

type ViewId = "all" | "check" | "production" | "balance" | "ready" | "dispatched" | "delivered" | "closed";

const STAGE_LABEL: Record<Stage, string> = {
  check: "Check payment",
  reupload: "Waiting for new receipt",
  awaiting: "Awaiting payment",
  confirmed: "Payment verified",
  production: "In production",
  pictures: "Pictures sent",
  balance_requested: "Balance requested",
  balance_paid: "Balance paid",
  ready: "Ready to dispatch",
  dispatched: "Dispatched",
  delivered: "Delivered",
  rejected: "Payment rejected",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

// Every status pill gets the same colour on every screen.
const STAGE_TONE: Record<Stage, string> = {
  check: "amber",
  reupload: "amber",
  awaiting: "grey",
  confirmed: "blue",
  production: "violet",
  pictures: "indigo",
  balance_requested: "orange",
  balance_paid: "green",
  ready: "teal",
  dispatched: "blue",
  delivered: "green",
  rejected: "red",
  cancelled: "grey",
  refunded: "grey",
};

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "order_confirmed", label: "Payment verified / Order confirmed" },
  { value: "in_production", label: "In production" },
  { value: "pictures_sent", label: "Pictures & ping video sent" },
  { value: "balance_requested", label: "Balance requested" },
  { value: "balance_paid", label: "Balance paid" },
  { value: "ready_for_dispatch", label: "Ready for dispatch" },
  { value: "dispatched", label: "Dispatched" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

const PKT_DATE = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Karachi",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatPkt(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : PKT_DATE.format(d);
}

function money(n: number): string {
  return `£${(Math.round(n * 100) / 100).toLocaleString("en-GB", { maximumFractionDigits: 2 })}`;
}

function isCustom(order: Order): boolean {
  return (
    (order.items || []).some(
      (i) => Boolean(i.customSpec) || (i.productId || "").includes("custom-bat") || (i.category || "").toLowerCase().includes("custom")
    ) || (order.notes || "").includes("--- CUSTOM BAT SPECIFICATIONS ---")
  );
}

function stageOf(order: Order): Stage {
  const s = String(order.status || "").toLowerCase();
  const sub = order.paymentSubmission?.status;
  if (sub === "payment_submitted" || s === "payment_submitted") return "check";
  if (sub === "payment_reupload_requested" || s === "payment_reupload_requested") return "reupload";
  if (s === "payment_rejected" || s === "rejected" || sub === "payment_rejected") return "rejected";
  if (s === "order_confirmed" || s === "payment_verified" || s === "confirmed") return "confirmed";
  if (s === "in_production") return "production";
  if (s === "pictures_sent") return "pictures";
  if (s === "balance_requested") return "balance_requested";
  if (s === "balance_paid") return "balance_paid";
  if (s === "ready_for_dispatch") return "ready";
  if (s === "dispatched") return "dispatched";
  if (s === "delivered" || s === "completed") return "delivered";
  if (s === "cancelled") return "cancelled";
  if (s === "refunded") return "refunded";
  return "awaiting";
}

/** Reads the payment plan written at checkout: "50% Deposit (£466 due today / Balance: £466)". */
function planOf(order: Order): { percent: number; due: number; balance: number } | null {
  const m = /Manual Payment Plan:\s*(\d+)% Deposit \(£([\d.]+) due today \/ Balance: £([\d.]+)\)/.exec(order.notes || "");
  return m ? { percent: Number(m[1]), due: Number(m[2]), balance: Number(m[3]) } : null;
}

function paidOf(order: Order): number {
  const stage = stageOf(order);
  const total = Number(order.totalAmount) || 0;
  if (stage === "balance_paid" || stage === "delivered") return total;
  const sub = order.paymentSubmission;
  if (!sub || sub.status !== "payment_verified") return 0;
  if ((sub.currencySent || "GBP").toUpperCase() === "GBP") return Math.min(Number(sub.amountSent) || 0, total);
  return planOf(order)?.due ?? 0;
}

const CLOSED: Stage[] = ["rejected", "cancelled", "refunded"];
const IN_PRODUCTION: Stage[] = ["confirmed", "production", "pictures", "balance_requested", "balance_paid"];

const UNPAID: Stage[] = ["check", "reupload", "awaiting"];

function balanceOf(order: Order): number {
  const stage = stageOf(order);
  if (CLOSED.includes(stage) || UNPAID.includes(stage)) return 0;
  return Math.max(0, Math.round(((Number(order.totalAmount) || 0) - paidOf(order)) * 100) / 100);
}

function inView(order: Order, view: ViewId): boolean {
  const stage = stageOf(order);
  switch (view) {
    case "all":
      return true;
    case "check":
      return stage === "check" || stage === "reupload";
    case "production":
      return IN_PRODUCTION.includes(stage);
    case "balance":
      return balanceOf(order) > 0 && [...IN_PRODUCTION, "ready", "dispatched"].includes(stage) && stage !== "balance_paid";
    case "ready":
      return stage === "ready";
    case "dispatched":
      return stage === "dispatched";
    case "delivered":
      return stage === "delivered";
    case "closed":
      return CLOSED.includes(stage);
  }
}

/** The one obvious next action for each stage. */
function nextStepOf(order: Order): { label: string; status?: string; check?: boolean } | null {
  const stage = stageOf(order);
  const custom = isCustom(order);
  const bal = balanceOf(order);
  switch (stage) {
    case "check":
      return { label: "Verify payment", check: true };
    case "confirmed":
      return { label: "Start production", status: "in_production" };
    case "production":
      return custom ? { label: "Mark pictures sent", status: "pictures_sent" } : { label: "Mark ready to dispatch", status: "ready_for_dispatch" };
    case "pictures":
      return bal > 0 ? { label: "Request balance", status: "balance_requested" } : { label: "Mark ready to dispatch", status: "ready_for_dispatch" };
    case "balance_requested":
      return { label: "Mark balance paid", status: "balance_paid" };
    case "balance_paid":
      return { label: "Mark ready to dispatch", status: "ready_for_dispatch" };
    case "ready":
      return { label: "Mark dispatched", status: "dispatched" };
    case "dispatched":
      return { label: "Mark delivered", status: "delivered" };
    default:
      return null;
  }
}

function itemsSummary(items: OrderItem[]): string {
  if (!items || items.length === 0) return "—";
  return items.map((i) => (i.customSpec ? i.name : `${i.name} × ${i.quantity}`)).join(", ");
}

function noteLine(order: Order, label: string): string {
  const m = new RegExp(`^${label}:\\s*(.+)$`, "m").exec(order.notes || "");
  return m ? m[1].trim() : "";
}

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

function whatsappMessage(order: Order): string {
  const first = (order.customerName || "").split(" ")[0] || "";
  return `Assalam o Alaikum ${first}, this is Sialkot Cricket Kits about your order ${order.id}.`;
}

function StagePill({ stage }: { stage: Stage }) {
  return <span className={`ord-pill tone-${STAGE_TONE[stage]}`}>{STAGE_LABEL[stage]}</span>;
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

export default function AdminOrdersPage() {
  const { showToast, confirmAction } = useAdminFeedback();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewId>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "custom" | "catalogue">("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  // Drawer action state
  const [busy, setBusy] = useState(false);
  const [checkedInBank, setCheckedInBank] = useState(false);
  const [verifyNote, setVerifyNote] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [askReupload, setAskReupload] = useState(true);
  const [stepNote, setStepNote] = useState("");
  const [manualStatus, setManualStatus] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/admin";
        return;
      }
      const json = await res.json().catch(() => ({ success: false }));
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      } else {
        showToast(json.error || "Could not load orders", "error");
      }
    } catch {
      showToast("Could not load orders. Check your connection.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    // Initial load.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const open = orders.find((o) => o.id === openId) || null;

  const resetDrawerState = () => {
    setCheckedInBank(false);
    setVerifyNote("");
    setRejectOpen(false);
    setRejectReason("");
    setAskReupload(true);
    setStepNote("");
    setManualStatus("");
  };

  const openOrder = (id: string) => {
    resetDrawerState();
    setOpenId(id);
  };

  useEffect(() => {
    if (!openId) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openId]);

  const typed = useMemo(
    () =>
      orders.filter((o) => {
        if (typeFilter === "custom" && !isCustom(o)) return false;
        if (typeFilter === "catalogue" && isCustom(o)) return false;
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return [
          o.id,
          o.customerName,
          o.customerPhone,
          o.customerEmail,
          o.country,
          o.paymentSubmission?.transferReference,
          itemsSummary(o.items),
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      }),
    [orders, typeFilter, query]
  );

  type ViewTile = { id: ViewId; label: string; sub: string; urgent: boolean; count: number };
  const views: ViewTile[] = useMemo(() => {
    const count = (v: ViewId) => typed.filter((o) => inView(o, v)).length;
    const checkOrders = typed.filter((o) => inView(o, "check"));
    const reported = checkOrders.reduce((t, o) => t + (Number(o.paymentSubmission?.amountSent) || 0), 0);
    const toCollect = typed.filter((o) => inView(o, "balance")).reduce((t, o) => t + balanceOf(o), 0);
    const inProd = count("production");
    const tiles: Array<Omit<ViewTile, "count">> = [
      { id: "check", label: "Check payment", sub: checkOrders.length ? `${money(reported)} reported` : "nothing waiting", urgent: checkOrders.length > 0 },
      { id: "production", label: "In production", sub: `${inProd} order${inProd === 1 ? "" : "s"}`, urgent: false },
      { id: "balance", label: "Balance due", sub: toCollect ? `${money(toCollect)} to collect` : "all collected", urgent: false },
      { id: "ready", label: "Ready to dispatch", sub: "pack and send", urgent: false },
      { id: "dispatched", label: "Dispatched", sub: "in transit", urgent: false },
      { id: "delivered", label: "Delivered", sub: "completed", urgent: false },
      { id: "closed", label: "Rejected / cancelled", sub: "closed", urgent: false },
      { id: "all", label: "All orders", sub: "everything", urgent: false },
    ];
    return tiles.map((t) => ({ ...t, count: count(t.id) }));
  }, [typed]);

  const rows = useMemo(
    () =>
      typed
        .filter((o) => inView(o, view))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [typed, view]
  );

  const totals = useMemo(
    () => ({
      total: rows.reduce((t, o) => t + (Number(o.totalAmount) || 0), 0),
      paid: rows.reduce((t, o) => t + paidOf(o), 0),
      balance: rows.reduce((t, o) => t + balanceOf(o), 0),
    }),
    [rows]
  );

  const changeStatus = async (order: Order, status: string, note: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(order.id)}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      const json = await res.json().catch(() => ({}));
      if (json.success) {
        const label = STATUS_OPTIONS.find((s) => s.value === status)?.label || status;
        showToast(`${order.id}: ${label}`, "success");
        setStepNote("");
        setManualStatus("");
        await load();
      } else {
        showToast(json.error || "Could not update the status", "error");
      }
    } catch {
      showToast("Network error while updating the status", "error");
    } finally {
      setBusy(false);
    }
  };

  const runNextStep = (order: Order) => {
    const step = nextStepOf(order);
    if (!step) return;
    if (step.check) {
      openOrder(order.id);
      return;
    }
    if (step.status === "dispatched") {
      // Courier details are needed: do it in the drawer.
      openOrder(order.id);
      return;
    }
    // One tap, one confirmation: avoids moving an order by accident on a phone.
    const label = STATUS_OPTIONS.find((x) => x.value === step.status)?.label || step.label;
    confirmAction({
      title: `${step.label}?`,
      message: `${order.id} (${order.customerName}) will move to "${label}". You can change it back from the order details.`,
      confirmText: step.label,
      cancelText: "Cancel",
      onConfirm: () => changeStatus(order, step.status as string, ""),
    });
  };

  const verify = async (order: Order) => {
    const sub = order.paymentSubmission;
    if (!sub) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/payments/${encodeURIComponent(sub.id)}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmedInUblAccount: true, note: verifyNote }),
      });
      const json = await res.json().catch(() => ({}));
      if (json.success) {
        showToast(`${order.id}: payment verified. The customer has been notified.`, "success");
        resetDrawerState();
        await load();
      } else {
        showToast(json.error || "Could not verify the payment", "error");
      }
    } catch {
      showToast("Network error while verifying", "error");
    } finally {
      setBusy(false);
    }
  };

  const reject = async (order: Order) => {
    const sub = order.paymentSubmission;
    if (!sub || !rejectReason.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/payments/${encodeURIComponent(sub.id)}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: rejectReason.trim(), requestReupload: askReupload }),
      });
      const json = await res.json().catch(() => ({}));
      if (json.success) {
        showToast(askReupload ? `${order.id}: asked for a new receipt` : `${order.id}: payment rejected`, "info");
        resetDrawerState();
        await load();
      } else {
        showToast(json.error || "Could not reject the payment", "error");
      }
    } catch {
      showToast("Network error while rejecting", "error");
    } finally {
      setBusy(false);
    }
  };

  const resendNotification = async (order: Order) => {
    const type = stageOf(order) === "check" ? "order_received" : "order_confirmed";
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(order.id)}/notifications/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const json = await res.json().catch(() => ({}));
      showToast(json.success ? "Notification sent again" : json.error || "Could not resend", json.success ? "success" : "error");
    } catch {
      showToast("Network error while resending", "error");
    }
  };

  const exportCsv = () => {
    const link = document.createElement("a");
    link.href = "/api/admin/sales/export?range=all";
    link.setAttribute("download", `Sialkot_Cricket_Kits_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const phoneDigits = (o: Order) => (o.customerPhone || "").replace(/[^0-9]/g, "");

  return (
    <div className="ord">
      <header className="ord-head">
        <div>
          <h1>Orders</h1>
          <p>Times are Pakistan time. Prices in GBP.</p>
        </div>
        <div className="ord-head-actions">
          <button type="button" className="ord-btn" onClick={load} disabled={loading} aria-label="Refresh orders">
            <RefreshCw size={16} className={loading ? "ord-spin" : ""} aria-hidden="true" />
            <span className="ord-hide-sm">Refresh</span>
          </button>
          <button type="button" className="ord-btn" onClick={exportCsv}>
            <Download size={16} aria-hidden="true" />
            <span className="ord-hide-sm">Export CSV</span>
          </button>
        </div>
      </header>

      <div className="ord-tiles" role="tablist" aria-label="Order stages">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={view === v.id}
            className={`ord-tile ${view === v.id ? "active" : ""} ${v.urgent ? "urgent" : ""}`}
            onClick={() => setView(v.id)}
          >
            <span className="ord-tile-label">{v.label}</span>
            <strong className="ord-tile-count">{loading ? "–" : v.count}</strong>
            <span className="ord-tile-sub">{loading ? "" : v.sub}</span>
          </button>
        ))}
      </div>

      <div className="ord-toolbar">
        <label className="ord-search">
          <Search size={16} aria-hidden="true" />
          <span className="ord-sr">Search orders</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ID, name, phone or reference"
          />
        </label>
        <div className="ord-chips" role="group" aria-label="Order type">
          {(
            [
              ["all", "All types"],
              ["custom", "Custom bats"],
              ["catalogue", "Catalogue"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={typeFilter === id}
              className={`ord-chip ${typeFilter === id ? "active" : ""}`}
              onClick={() => setTypeFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: spreadsheet */}
      <div className="ord-table-wrap">
        <table className="ord-table">
          <thead>
            <tr>
              <th scope="col" className="sticky">Order</th>
              <th scope="col">Customer</th>
              <th scope="col">Items</th>
              <th scope="col" className="num">Total</th>
              <th scope="col" className="num xl">Paid</th>
              <th scope="col" className="num">Balance</th>
              <th scope="col">Stage</th>
              <th scope="col">Next step</th>
              <th scope="col"><span className="ord-sr">Open</span></th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk${i}`} className="ord-skel-row">
                  <td colSpan={9}><span className="ord-skel" /></td>
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="ord-empty">No orders here.</td>
              </tr>
            )}
            {!loading &&
              rows.map((o) => {
                const stage = stageOf(o);
                const step = nextStepOf(o);
                const bal = balanceOf(o);
                return (
                  <tr key={o.id} className={stage === "check" ? "attention" : ""}>
                    <td className="sticky">
                      <button type="button" className="ord-id" onClick={() => openOrder(o.id)}>{o.id}</button>
                      <span className="ord-sub">
                        <span className={`ord-type ${isCustom(o) ? "custom" : ""}`}>{isCustom(o) ? "Custom bat" : "Catalogue"}</span>
                        <span className="muted">{formatPkt(o.createdAt)}</span>
                      </span>
                    </td>
                    <td>
                      <div className="ord-two">
                        <strong>{o.customerName}</strong>
                        <span>{[o.country, o.customerPhone].filter(Boolean).join(" · ")}</span>
                      </div>
                    </td>
                    <td className="ord-items" title={itemsSummary(o.items)}>{itemsSummary(o.items)}</td>
                    <td className="num strong">{money(Number(o.totalAmount) || 0)}</td>
                    <td className="num xl">{paidOf(o) ? money(paidOf(o)) : "—"}</td>
                    <td className={`num strong ${bal > 0 ? "due" : "muted"}`}>{bal > 0 ? money(bal) : "—"}</td>
                    <td><StagePill stage={stage} /></td>
                    <td>
                      {step ? (
                        <button type="button" className={`ord-step ${step.check ? "primary" : ""}`} onClick={() => runNextStep(o)} disabled={busy}>
                          {step.label}
                        </button>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      <button type="button" className="ord-icon" aria-label={`Open order ${o.id}`} onClick={() => openOrder(o.id)}>
                        <ChevronRight size={16} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
          {!loading && rows.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={3}>{rows.length} order{rows.length === 1 ? "" : "s"}</td>
                <td className="num strong">{money(totals.total)}</td>
                <td className="num strong xl">{money(totals.paid)}</td>
                <td className="num strong due">{money(totals.balance)}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Phone: cards with one big action */}
      <div className="ord-cards">
        {loading && Array.from({ length: 3 }).map((_, i) => <div key={`skc${i}`} className="ord-card ord-skel-card" />)}
        {!loading && rows.length === 0 && <p className="ord-empty">No orders here.</p>}
        {!loading &&
          rows.map((o) => {
            const stage = stageOf(o);
            const step = nextStepOf(o);
            const bal = balanceOf(o);
            return (
              <article key={o.id} className={`ord-card ${stage === "check" ? "attention" : ""}`}>
                <button type="button" className="ord-card-main" onClick={() => openOrder(o.id)} aria-label={`Open order ${o.id} from ${o.customerName}`}>
                  <span className="ord-card-top">
                    <span className="ord-mono">{o.id} · {formatPkt(o.createdAt)}</span>
                    <strong className="ord-card-total">{money(Number(o.totalAmount) || 0)}</strong>
                  </span>
                  <span className="ord-card-name">{o.customerName}</span>
                  <span className="ord-card-meta">{isCustom(o) ? "Custom bat" : itemsSummary(o.items)} · {o.country}</span>
                  <span className="ord-card-bottom">
                    <StagePill stage={stage} />
                    {bal > 0 && <span className="due">Balance {money(bal)}</span>}
                  </span>
                </button>
                <div className="ord-card-actions">
                  {step && (
                    <button type="button" className={`ord-step big ${step.check ? "primary" : ""}`} onClick={() => runNextStep(o)} disabled={busy}>
                      {step.label}
                    </button>
                  )}
                  {phoneDigits(o) && (
                    <a className="ord-wa" href={whatsappUrl(whatsappMessage(o), phoneDigits(o))} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${o.customerName}`}>
                      <MessageCircle size={18} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
      </div>

      {/* Detail drawer */}
      {open && (
        <div className="ord-backdrop" onClick={() => setOpenId(null)}>
          <aside
            className="ord-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`Order ${open.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const stage = stageOf(open);
              const sub = open.paymentSubmission;
              const plan = planOf(open);
              const step = nextStepOf(open);
              const bal = balanceOf(open);
              const address = noteLine(open, "Address");
              const legacySpec = !open.items.some((i) => i.customSpec) && (open.notes || "").includes("--- CUSTOM BAT SPECIFICATIONS ---")
                ? (open.notes || "").split("--- CUSTOM BAT SPECIFICATIONS ---")[1].split("\n").map((l) => l.trim()).filter((l) => /^[A-Z][A-Za-z ]+:/.test(l)).slice(0, 10)
                : [];
              const warnings = warningsOf(open);
              const isImage = (sub?.receiptMimeType || "").startsWith("image/");
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
                      <a className="ord-btn wa" href={whatsappUrl(whatsappMessage(open), phoneDigits(open))} target="_blank" rel="noopener noreferrer">
                        <MessageCircle size={16} aria-hidden="true" /> WhatsApp
                      </a>
                    )}
                    {open.customerEmail && (
                      <a className="ord-btn" href={`mailto:${open.customerEmail}?subject=${encodeURIComponent(`Your order ${open.id} — Sialkot Cricket Kits`)}`}>Email</a>
                    )}
                    <a className="ord-btn" href={invoiceHref} target="_blank" rel="noopener noreferrer">
                      <FileText size={16} aria-hidden="true" /> Invoice
                    </a>
                  </div>

                  {warnings.length > 0 && (
                    <div className="ord-warn" role="alert">
                      <AlertTriangle size={16} aria-hidden="true" />
                      <div>{warnings.map((w) => <p key={w}>{w}</p>)}</div>
                    </div>
                  )}

                  {/* Payment check */}
                  {sub && (
                    <section className="ord-sec">
                      <h3>Payment</h3>
                      <div className="ord-pay">
                        {sub.id &&
                          (isImage ? (
                            <a href={`/api/admin/receipts/${encodeURIComponent(sub.id)}`} target="_blank" rel="noopener noreferrer" className="ord-receipt" aria-label="Open receipt full size">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={`/api/admin/receipts/${encodeURIComponent(sub.id)}`} alt={`Payment receipt for ${open.id}`} loading="lazy" />
                            </a>
                          ) : (
                            <a href={`/api/admin/receipts/${encodeURIComponent(sub.id)}`} target="_blank" rel="noopener noreferrer" className="ord-receipt doc">
                              <FileText size={22} aria-hidden="true" />
                              <span>Open receipt</span>
                            </a>
                          ))}
                        <dl className="ord-kv">
                          {plan && (
                            <div><dt>Due at order ({plan.percent}%)</dt><dd>{money(plan.due)}</dd></div>
                          )}
                          <div><dt>Customer says sent</dt><dd>{sub.amountSent} {sub.currencySent}</dd></div>
                          <div><dt>Method</dt><dd>{sub.provider || sub.paymentMethod}</dd></div>
                          <div><dt>Reference</dt><dd className="ord-mono">{sub.transferReference}</dd></div>
                          <div><dt>Sender</dt><dd>{sub.senderName}</dd></div>
                          <div><dt>Transfer date</dt><dd>{sub.transferDate}</dd></div>
                        </dl>
                      </div>

                      {stage === "check" && (
                        <div className="ord-verify">
                          <label className="ord-check">
                            <input type="checkbox" checked={checkedInBank} onChange={(e) => setCheckedInBank(e.target.checked)} />
                            <span>I checked this payment in our UBL / Wise account and the amount and reference match.</span>
                          </label>
                          <label className="ord-field">
                            <span>Note (optional)</span>
                            <input type="text" value={verifyNote} onChange={(e) => setVerifyNote(e.target.value)} placeholder="e.g. received £120 on 3 Nov" />
                          </label>
                          <div className="ord-row">
                            <button type="button" className="ord-btn primary grow" disabled={!checkedInBank || busy} onClick={() => verify(open)}>
                              Verify payment
                            </button>
                            <button type="button" className="ord-btn" aria-expanded={rejectOpen} onClick={() => setRejectOpen((v) => !v)}>
                              Reject…
                            </button>
                          </div>
                          {rejectOpen && (
                            <div className="ord-reject">
                              <label className="ord-field">
                                <span>Reason (the customer will see this)</span>
                                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={2} placeholder="e.g. The screenshot is not readable" />
                              </label>
                              <label className="ord-check">
                                <input type="checkbox" checked={askReupload} onChange={(e) => setAskReupload(e.target.checked)} />
                                <span>Ask the customer to upload a new receipt</span>
                              </label>
                              <button type="button" className="ord-btn danger" disabled={!rejectReason.trim() || busy} onClick={() => reject(open)}>
                                {askReupload ? "Ask for new receipt" : "Reject payment"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </section>
                  )}

                  {/* Next step */}
                  {step && !step.check && (
                    <section className="ord-sec">
                      <h3>Next step</h3>
                      <label className="ord-field">
                        <span>{step.status === "dispatched" ? "Courier and tracking number (required)" : "Note (optional)"}</span>
                        <input
                          type="text"
                          value={stepNote}
                          onChange={(e) => setStepNote(e.target.value)}
                          placeholder={step.status === "dispatched" ? "e.g. DHL 1234567890" : "Visible in the order history"}
                        />
                      </label>
                      <button
                        type="button"
                        className="ord-btn primary"
                        disabled={busy || (step.status === "dispatched" && !stepNote.trim())}
                        onClick={() => changeStatus(open, step.status as string, stepNote.trim())}
                      >
                        {step.label}
                      </button>
                      {bal > 0 && (step.status === "ready_for_dispatch" || step.status === "dispatched") && (
                        <p className="ord-hint due">Balance of {money(bal)} is still due before dispatch.</p>
                      )}
                    </section>
                  )}

                  {/* Items */}
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
                      <div><dt>Paid (verified)</dt><dd>{paidOf(open) ? money(paidOf(open)) : "—"}</dd></div>
                      <div><dt>Balance</dt><dd className={bal > 0 ? "due" : ""}>{bal > 0 ? money(bal) : "—"}</dd></div>
                    </dl>
                  </section>

                  {/* Customer */}
                  <section className="ord-sec">
                    <h3>Customer</h3>
                    <dl className="ord-kv">
                      <div><dt>Phone</dt><dd>{open.customerPhone || "—"}</dd></div>
                      <div><dt>Email</dt><dd>{open.customerEmail || "—"}</dd></div>
                      <div><dt>Country</dt><dd>{open.country}</dd></div>
                      {address && <div className="wide"><dt>Address</dt><dd>{address}</dd></div>}
                    </dl>
                  </section>

                  {/* Change status (any) */}
                  <section className="ord-sec">
                    <h3>Change status</h3>
                    <div className="ord-row wrap">
                      <label className="ord-sr" htmlFor="ord-status-select">New status</label>
                      <select id="ord-status-select" className="ord-select" value={manualStatus} onChange={(e) => setManualStatus(e.target.value)}>
                        <option value="">Choose a status…</option>
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="ord-btn"
                        disabled={!manualStatus || busy}
                        onClick={() => changeStatus(open, manualStatus, stepNote.trim())}
                      >
                        Save
                      </button>
                    </div>
                  </section>

                  {/* History */}
                  <section className="ord-sec">
                    <h3>History</h3>
                    <ol className="ord-history">
                      <li>{formatPkt(open.createdAt)} — Order placed{sub ? " with payment receipt" : ""}</li>
                      {historyOf(open).map((h) => <li key={h}>{h}</li>)}
                    </ol>
                    <button type="button" className="ord-link" onClick={() => resendNotification(open)}>
                      <ExternalLink size={14} aria-hidden="true" /> Resend order email / WhatsApp
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
