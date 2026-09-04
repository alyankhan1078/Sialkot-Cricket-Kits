import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders } from "@/src/lib/admin-auth";
import { getOrderById, getPaymentSubmissionByOrderId } from "@/src/lib/data-service";
import {
  sendOrderReceivedNotifications,
  sendOrderConfirmedNotifications,
  getNotificationLogsForOrder,
} from "@/src/lib/notifications";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { type } = body; // 'order_received' or 'order_confirmed'

    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404, headers });
    }

    if (type === "order_confirmed" || order.status === "order_confirmed" || order.paymentStatus === "payment_verified") {
      const result = await sendOrderConfirmedNotifications(order);
      const logs = await getNotificationLogsForOrder(order.id);
      return NextResponse.json({
        success: true,
        message: "Order confirmation notification retried.",
        result,
        logs,
      }, { status: 200, headers });
    } else {
      const submission = await getPaymentSubmissionByOrderId(id);
      const result = await sendOrderReceivedNotifications(order, submission || undefined);
      const logs = await getNotificationLogsForOrder(order.id);
      return NextResponse.json({
        success: true,
        message: "Order received notification retried.",
        result,
        logs,
      }, { status: 200, headers });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500, headers }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const { id } = await context.params;
    const logs = await getNotificationLogsForOrder(id);
    return NextResponse.json({ success: true, data: logs }, { status: 200, headers });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load notification logs" },
      { status: 500, headers }
    );
  }
}
