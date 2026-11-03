import { after, NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders, getAdminEmail } from "@/src/lib/admin-auth";
import { getPaymentSubmissionByOrderId, getSettings, updateOrderStatus } from "@/src/lib/data-service";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const status = String(body.status || "").trim();
    const note = String(body.note || "").trim().slice(0, 300);

    if (!status) {
      return NextResponse.json({ success: false, error: "New status is required." }, { status: 400, headers });
    }
    if (status === "dispatched" && !note) {
      return NextResponse.json({ success: false, error: "Please add the courier and tracking number." }, { status: 400, headers });
    }

    const result = await updateOrderStatus(id, status, await getAdminEmail(request), note || undefined);
    if (!result.success || !result.order) {
      return NextResponse.json({ success: false, error: result.error || "Failed to update order status" }, { status: 400, headers });
    }

    // Customer messages for the steps they need to act on or know about.
    if (status === "balance_requested" || status === "dispatched") {
      const order = result.order;
      after(async () => {
        try {
          const { notifyOrderEvent } = await import("@/src/lib/notifications");
          const submission = await getPaymentSubmissionByOrderId(order.id);
          if (status === "dispatched") {
            await notifyOrderEvent(order, "dispatched", submission, { tracking: note });
          } else {
            const s = await getSettings();
            const bankDetails = [
              s.bankName && `Bank: ${s.bankName}`,
              s.accountTitle && `Account title: ${s.accountTitle}`,
              s.accountNumber && `Account no: ${s.accountNumber}`,
              s.iban && `IBAN: ${s.iban}`,
              s.swiftBic && `SWIFT: ${s.swiftBic}`,
            ]
              .filter(Boolean)
              .join("\n");
            await notifyOrderEvent(order, "balance_requested", submission, { bankDetails: bankDetails || undefined });
          }
        } catch (err) {
          console.warn("[Status notification notice]:", err);
        }
      });
    }

    return NextResponse.json({ success: true, data: result.order, message: `Order status updated to "${status}".` }, { status: 200, headers });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error && err.message ? err.message : "Internal server error" }, { status: 500, headers });
  }
}
