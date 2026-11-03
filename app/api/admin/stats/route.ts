import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders } from "@/src/lib/admin-auth";
import {
  getCategories,
  getEnquiries,
  getFaqs,
  getOrders,
  getPaymentSubmissions,
  getProducts,
  isCustomBatOrder,
} from "@/src/lib/data-service";

const CLOSED_STATUSES = new Set(["delivered", "completed", "cancelled", "rejected", "payment_rejected", "refunded"]);
const PRODUCTION_STATUSES = new Set(["order_confirmed", "payment_verified", "in_production", "pictures_sent", "balance_requested", "balance_paid", "ready_for_dispatch"]);

/** Reads "Balance: £70" from the order notes written at checkout. */
function balanceFromNotes(notes?: string): number {
  const match = /Balance:\s*£\s*([\d.]+)/.exec(notes || "");
  return match ? Number(match[1]) || 0 : 0;
}

export async function GET(request: NextRequest) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const [products, categories, faqs, enquiries, orders, submissions] = await Promise.all([
      getProducts({ includeInactive: true }),
      getCategories(true),
      getFaqs(true),
      getEnquiries(),
      getOrders().catch(() => []),
      getPaymentSubmissions().catch(() => []),
    ]);

    const activeProducts = products.filter((p) => p.active).length;
    const featuredProducts = products.filter((p) => p.featured).length;
    const liveEnquiries = enquiries.filter((e) => !e.spam);
    const unreadEnquiries = liveEnquiries.filter((e) => !e.read).length;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const openOrders = orders.filter((o) => !CLOSED_STATUSES.has(String(o.status)));
    const outstandingBalanceGbp = openOrders
      .filter((o) => String(o.status) !== "balance_paid")
      .reduce((sum, o) => sum + balanceFromNotes(o.notes), 0);

    return NextResponse.json(
      {
        success: true,
        data: {
          totalProducts: products.length,
          activeProducts,
          featuredProducts,
          totalCategories: categories.length,
          totalFaqs: faqs.length,
          totalEnquiries: liveEnquiries.length,
          unreadEnquiries,
          recentEnquiries: liveEnquiries.slice(0, 5),
          // "Action needed" figures
          pendingPaymentVerifications: (submissions as Array<{ status: string }>).filter(
            (s) => s.status === "payment_submitted"
          ).length,
          customOrdersInProduction: orders.filter(
            (o) => isCustomBatOrder(o) && PRODUCTION_STATUSES.has(String(o.status))
          ).length,
          unpaidCustomLeadsThisWeek: liveEnquiries.filter(
            (e) => e.type === "custom_bat" && new Date(e.createdAt).getTime() >= weekAgo
          ).length,
          unpaidCustomLeadsTotal: liveEnquiries.filter((e) => e.type === "custom_bat").length,
          unreadContactMessages: liveEnquiries.filter((e) => e.type !== "custom_bat" && !e.read).length,
          outstandingBalanceGbp: Math.round(outstandingBalanceGbp * 100) / 100,
        },
      },
      { headers }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500, headers });
  }
}
