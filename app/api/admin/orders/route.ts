import { NextResponse } from "next/server";
import { getOrders, createOrder, getPaymentSubmissionByOrderId } from "@/src/lib/data-service";
import { validateAdminSessionFromRequest } from "@/src/lib/admin-auth";
import { getNotificationLogsForOrder } from "@/src/lib/notifications";

export async function GET(request: Request) {
  if (!validateAdminSessionFromRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;

  try {
    const orders = await getOrders({ status, search, startDate, endDate });

    const enriched = await Promise.all(
      orders.map(async (o) => {
        const [paymentSubmission, notificationLogs] = await Promise.all([
          getPaymentSubmissionByOrderId(o.id),
          getNotificationLogsForOrder(o.id),
        ]);
        return {
          ...o,
          paymentSubmission,
          notificationLogs,
        };
      })
    );

    return NextResponse.json({ success: true, data: enriched, count: enriched.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!validateAdminSessionFromRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.customerName || !body.items || !body.totalAmount) {
      return NextResponse.json(
        { success: false, error: "Customer name, items, and total amount are required" },
        { status: 400 }
      );
    }

    const newOrder = await createOrder(body);
    return NextResponse.json({ success: true, data: newOrder });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to create order" }, { status: 500 });
  }
}
