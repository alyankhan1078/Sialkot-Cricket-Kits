import { NextRequest, NextResponse } from "next/server";
import { validateAdminSessionFromRequest } from "@/src/lib/admin-auth";
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
  if (!validateAdminSessionFromRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { type } = body; // 'order_received' or 'order_confirmed'

    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    if (type === "order_confirmed" || order.status === "order_confirmed" || order.paymentStatus === "payment_verified") {
      const result = await sendOrderConfirmedNotifications(order);
      const logs = await getNotificationLogsForOrder(order.id);
      return NextResponse.json({
        success: true,
        message: "Order confirmation notification retried.",
        result,
        logs,
      });
    } else {
      const submission = await getPaymentSubmissionByOrderId(id);
      const result = await sendOrderReceivedNotifications(order, submission || undefined);
      const logs = await getNotificationLogsForOrder(order.id);
      return NextResponse.json({
        success: true,
        message: "Order received notification retried.",
        result,
        logs,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!validateAdminSessionFromRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const logs = await getNotificationLogsForOrder(id);
    return NextResponse.json({ success: true, data: logs });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load notification logs" },
      { status: 500 }
    );
  }
}
