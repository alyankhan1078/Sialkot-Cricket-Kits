"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, RefreshCw, ChevronRight } from "lucide-react";
import { useAdminFeedback } from "@/src/components/AdminFeedbackContext";
import {
  STAGE_LABEL,
  STAGE_TONE,
  balanceOf,
  formatPkt,
  inView,
  isCustom,
  money,
  nextStepOf,
  paidOf,
  stageOf,
  type Order,
} from "@/src/lib/admin-orders";
import "../orders/orders.css";
import "./dashboard.css";

type Stats = {
  unreadContactMessages?: number;
  unpaidCustomLeadsThisWeek?: number;
  unpaidCustomLeadsTotal?: number;
  activeProducts?: number;
  totalProducts?: number;
};

// Month key in Pakistan time, e.g. "2026-11".
const PKT_MONTH = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit" });
const PKT_LONG_DATE = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", weekday: "long", day: "numeric", month: "long" });
const MONTH_NAME = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", month: "long" });

function monthKey(d: Date): string {
  return PKT_MONTH.format(d).slice(0, 7);
}

export default function AdminDashboardPage() {
  const { showToast } = useAdminFeedback();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        fetch("/api/admin/orders", { cache: "no-store" }),
        fetch("/api/admin/stats", { cache: "no-store" }),
      ]);
      if (ordersRes.status === 401 || statsRes.status === 401) {
        window.location.href = "/admin";
        return;
      }
      const [ordersJson, statsJson] = await Promise.all([
        ordersRes.json().catch(() => ({})),
        statsRes.json().catch(() => ({})),
      ]);
      if (ordersJson.success && Array.isArray(ordersJson.data)) setOrders(ordersJson.data);
      if (statsJson.success && statsJson.data) setStats(statsJson.data);
      if (!ordersJson.success) showToast(ordersJson.error || "Could not load orders", "error");
    } catch {
      showToast("Could not load the dashboard. Check your connection.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    // Initial load.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const now = useMemo(() => new Date(), []);
  const thisMonth = monthKey(now);
  const lastMonthDate = new Date(now.getTime() - 32 * 24 * 3600 * 1000);
  const lastMonth = monthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) - 24 * 3600 * 1000));

  const figures = useMemo(() => {
    const check = orders.filter((o) => inView(o, "check"));
    const balance = orders.filter((o) => inView(o, "balance"));
    const customInProduction = orders.filter((o) => isCustom(o) && inView(o, "production"));
    const ready = orders.filter((o) => inView(o, "ready"));
    const revenue = (key: string) =>
      orders.filter((o) => monthKey(new Date(o.createdAt)) === key).reduce((t, o) => t + paidOf(o), 0);
    const ordersIn = (key: string) =>
      orders.filter((o) => monthKey(new Date(o.createdAt)) === key && !["rejected", "cancelled", "refunded"].includes(stageOf(o))).length;
    return {
      checkCount: check.length,
      checkReported: check.reduce((t, o) => t + (Number(o.paymentSubmission?.amountSent) || 0), 0),
      balanceCount: balance.length,
      balanceTotal: balance.reduce((t, o) => t + balanceOf(o), 0),
      customInProduction: customInProduction.length,
      readyCount: ready.length,
      revenueThis: revenue(thisMonth),
      revenueLast: revenue(lastMonth),
      ordersThis: ordersIn(thisMonth),
      ordersLast: ordersIn(lastMonth),
      revenueAll: orders.reduce((t, o) => t + paidOf(o), 0),
    };
  }, [orders, thisMonth, lastMonth]);

  const latest = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
    [orders]
  );

  const exportCsv = () => {
    const link = document.createElement("a");
    link.href = "/api/admin/sales/export?range=all";
    link.setAttribute("download", `Sialkot_Cricket_Kits_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const actions: Array<{ href: string; label: string; value: string; hint: string; urgent?: boolean }> = [
    {
      href: "/admin/orders?view=check",
      label: "Payments to verify",
      value: String(figures.checkCount),
      hint: figures.checkCount ? `${money(figures.checkReported)} reported by customers` : "Nothing waiting",
      urgent: figures.checkCount > 0,
    },
    {
      href: "/admin/orders?view=balance",
      label: "Balances still due",
      value: money(figures.balanceTotal),
      hint: figures.balanceCount ? `${figures.balanceCount} order${figures.balanceCount === 1 ? "" : "s"} · collect before dispatch` : "All collected",
    },
    {
      href: "/admin/orders?view=production&type=custom",
      label: "Custom bats in production",
      value: String(figures.customInProduction),
      hint: figures.readyCount ? `${figures.readyCount} order${figures.readyCount === 1 ? "" : "s"} ready to dispatch` : "Paid, not dispatched yet",
    },
    {
      href: "/admin/enquiries",
      label: "Unpaid custom bat leads",
      value: String(stats.unpaidCustomLeadsThisWeek ?? 0),
      hint: `this week · ${stats.unpaidCustomLeadsTotal ?? 0} in total (not orders)`,
    },
    {
      href: "/admin/enquiries",
      label: "Unread messages",
      value: String(stats.unreadContactMessages ?? 0),
      hint: "Reply within 24 hours",
      urgent: (stats.unreadContactMessages ?? 0) > 0,
    },
  ];

  const change = figures.revenueLast > 0 && figures.revenueThis > 0 ? Math.round(((figures.revenueThis - figures.revenueLast) / figures.revenueLast) * 100) : null;

  return (
    <div className="ord dash">
      <header className="ord-head">
        <div>
          <h1>Today</h1>
          <p>{PKT_LONG_DATE.format(now)} · Pakistan time</p>
        </div>
        <div className="ord-head-actions">
          <button type="button" className="ord-btn" onClick={load} disabled={loading} aria-label="Refresh dashboard">
            <RefreshCw size={16} className={loading ? "ord-spin" : ""} aria-hidden="true" />
            <span className="ord-hide-sm">Refresh</span>
          </button>
          <button type="button" className="ord-btn" onClick={exportCsv}>
            <Download size={16} aria-hidden="true" />
            <span className="ord-hide-sm">Export CSV</span>
          </button>
        </div>
      </header>

      <section aria-label="Needs your attention" className="dash-actions">
        {actions.map((a) => (
          <Link key={a.label} href={a.href} className={`dash-action ${a.urgent ? "urgent" : ""}`}>
            <span className="dash-action-label">{a.label}</span>
            <strong className="dash-action-value">{loading ? <span className="ord-skel dash-skel" /> : a.value}</strong>
            <span className="dash-action-hint">{loading ? "" : a.hint}</span>
          </Link>
        ))}
      </section>

      <section aria-label="Revenue" className="dash-money">
        <div className="dash-money-card">
          <span className="dash-action-label">Verified payments · {MONTH_NAME.format(now)}</span>
          <strong className="dash-big">{loading ? "–" : money(figures.revenueThis)}</strong>
          <span className="dash-action-hint">
            {loading
              ? ""
              : `${figures.ordersThis} order${figures.ordersThis === 1 ? "" : "s"} placed${
                  change === null ? "" : ` · ${change >= 0 ? "+" : ""}${change}% vs ${MONTH_NAME.format(lastMonthDate)}`
                }`}
          </span>
        </div>
        <div className="dash-money-card">
          <span className="dash-action-label">Verified payments · {MONTH_NAME.format(lastMonthDate)}</span>
          <strong className="dash-big">{loading ? "–" : money(figures.revenueLast)}</strong>
          <span className="dash-action-hint">{loading ? "" : `${figures.ordersLast} order${figures.ordersLast === 1 ? "" : "s"} placed`}</span>
        </div>
        <div className="dash-money-card">
          <span className="dash-action-label">All verified payments</span>
          <strong className="dash-big">{loading ? "–" : money(figures.revenueAll)}</strong>
          <span className="dash-action-hint">Only money you have verified in the bank</span>
        </div>
      </section>

      <section aria-label="Latest orders" className="dash-latest">
        <div className="dash-latest-head">
          <h2>Latest orders</h2>
          <Link href="/admin/orders" className="ord-link">All orders <ChevronRight size={14} aria-hidden="true" /></Link>
        </div>
        <div className="ord-table-wrap dash-table-wrap">
          <table className="ord-table dash-table">
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Customer</th>
                <th scope="col" className="num dash-col-total">Total</th>
                <th scope="col">Stage</th>
                <th scope="col" className="dash-col-next">Next step</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`s${i}`}><td colSpan={5}><span className="ord-skel" /></td></tr>
                ))}
              {!loading && latest.length === 0 && (
                <tr><td colSpan={5} className="ord-empty">No orders yet.</td></tr>
              )}
              {!loading &&
                latest.map((o) => {
                  const stage = stageOf(o);
                  const step = nextStepOf(o);
                  return (
                    <tr key={o.id} className={stage === "check" ? "attention" : ""}>
                      <td>
                        <Link href="/admin/orders" className="ord-id">{o.id}</Link>
                        <span className="ord-sub"><span className="muted">{formatPkt(o.createdAt)}</span></span>
                      </td>
                      <td>
                        <div className="ord-two">
                          <strong>{o.customerName}</strong>
                          <span>{o.country}<span className="dash-sm-total"> · {money(Number(o.totalAmount) || 0)}</span></span>
                        </div>
                      </td>
                      <td className="num strong dash-col-total">{money(Number(o.totalAmount) || 0)}</td>
                      <td><span className={`ord-pill tone-${STAGE_TONE[stage]}`}>{STAGE_LABEL[stage]}</span></td>
                      <td className="muted dash-col-next">{step ? step.label : "—"}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
