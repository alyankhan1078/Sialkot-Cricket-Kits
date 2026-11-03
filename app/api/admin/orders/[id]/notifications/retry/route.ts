import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders } from "@/src/lib/admin-auth";
import { getOrderById, getPaymentSubmissionByOrderId, getSettings } from "@/src/lib/data-service";
import { getNotificationLogsForOrder, notifyOrderEvent } from "@/src/lib/notifications";
import { messageEventFor, trackingOf } from "@/src/lib/admin-orders";

const EVENTS = ["order_received", "payment_confirmed", "payment_rejected", "balance_requested", "dispatched"] as const;
type Event = (typeof EVENTS)[number];

/** "Resend" in the Orders sheet: sends the message that fits the order's current stage again. */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const order = await getOrderById(id);
    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404, headers });
    const submission = await getPaymentSubmissionByOrderId(id);

    const requested = (body.event || (body.type === "order_confirmed" ? "payment_confirmed" : body.type)) as Event | undefined;
    const event: Event = requested && EVENTS.includes(requested) ? requested : messageEventFor({ ...order, paymentSubmission: submission });

    const extra: Record<string, unknown> = {};
    if (event === "payment_rejected") extra.reupload = submission?.status === "payment_reupload_requested";
    if (event === "dispatched") extra.tracking = trackingOf({ ...order, paymentSubmission: submission });
    if (event === "balance_requested") {
      const s = await getSettings();
      extra.bankDetails = [s.bankName && `Bank: ${s.bankName}`, s.accountTitle && `Account title: ${s.accountTitle}`, s.accountNumber && `Account no: ${s.accountNumber}`, s.iban && `IBAN: ${s.iban}`, s.swiftBic && `SWIFT: ${s.swiftBic}`].filter(Boolean).join("\n") || undefined;
    }

    const result = await notifyOrderEvent(order, event, submission, extra);
    if (result.skipped) {
      return NextResponse.json({ success: false, error: `Not sent: ${result.skipped}.` }, { status: 400, headers });
    }
    const logs = await getNotificationLogsForOrder(order.id);
    return NextResponse.json({ success: true, event, result, logs }, { status: 200, headers });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error && err.message ? err.message : "Could not resend the message" }, { status: 500, headers });
  }
}
