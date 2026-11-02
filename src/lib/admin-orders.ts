/**
 * Shared, browser-safe helpers for the admin Orders and Dashboard screens:
 * stage model, money and Pakistan-time formatting, paid/balance maths.
 */
import type { DBOrder, DBPaymentSubmission, OrderItem } from "@/src/lib/data-service";
import type { NotificationLog } from "@/src/lib/notifications";

export type Order = DBOrder & {
  paymentSubmission?: DBPaymentSubmission | null;
  notificationLogs?: NotificationLog[];
};

export type Stage =
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

export type ViewId = "all" | "check" | "production" | "balance" | "ready" | "dispatched" | "delivered" | "closed";

export const STAGE_LABEL: Record<Stage, string> = {
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
export const STAGE_TONE: Record<Stage, string> = {
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

export const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
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

export function formatPkt(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : PKT_DATE.format(d);
}

export function money(n: number): string {
  return `£${(Math.round(n * 100) / 100).toLocaleString("en-GB", { maximumFractionDigits: 2 })}`;
}

export function isCustom(order: Order): boolean {
  return (
    (order.items || []).some(
      (i) => Boolean(i.customSpec) || (i.productId || "").includes("custom-bat") || (i.category || "").toLowerCase().includes("custom")
    ) || (order.notes || "").includes("--- CUSTOM BAT SPECIFICATIONS ---")
  );
}

export function stageOf(order: Order): Stage {
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
export function planOf(order: Order): { percent: number; due: number; balance: number } | null {
  const m = /Manual Payment Plan:\s*(\d+)% Deposit \(£([\d.]+) due today \/ Balance: £([\d.]+)\)/.exec(order.notes || "");
  return m ? { percent: Number(m[1]), due: Number(m[2]), balance: Number(m[3]) } : null;
}

export function paidOf(order: Order): number {
  const stage = stageOf(order);
  const total = Number(order.totalAmount) || 0;
  if (stage === "balance_paid" || stage === "delivered") return total;
  const sub = order.paymentSubmission;
  if (!sub || sub.status !== "payment_verified") return 0;
  if ((sub.currencySent || "GBP").toUpperCase() === "GBP") return Math.min(Number(sub.amountSent) || 0, total);
  return planOf(order)?.due ?? 0;
}

export const CLOSED: Stage[] = ["rejected", "cancelled", "refunded"];
export const IN_PRODUCTION: Stage[] = ["confirmed", "production", "pictures", "balance_requested", "balance_paid"];

export const UNPAID: Stage[] = ["check", "reupload", "awaiting"];

export function balanceOf(order: Order): number {
  const stage = stageOf(order);
  if (CLOSED.includes(stage) || UNPAID.includes(stage)) return 0;
  return Math.max(0, Math.round(((Number(order.totalAmount) || 0) - paidOf(order)) * 100) / 100);
}

export function inView(order: Order, view: ViewId): boolean {
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
export function nextStepOf(order: Order): { label: string; status?: string; check?: boolean } | null {
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

export function itemsSummary(items: OrderItem[]): string {
  if (!items || items.length === 0) return "—";
  return items.map((i) => (i.customSpec ? i.name : `${i.name} × ${i.quantity}`)).join(", ");
}

