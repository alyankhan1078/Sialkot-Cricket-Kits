import { after, NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders, getAdminEmail } from "@/src/lib/admin-auth";
import { getOrderById, rejectPaymentSubmission } from "@/src/lib/data-service";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const rejectionReason = String(body.rejectionReason || "").trim().slice(0, 500);
    const requestReupload = Boolean(body.requestReupload);

    if (!rejectionReason) {
      return NextResponse.json({ success: false, error: "A clear rejection reason is required." }, { status: 400, headers });
    }

    const adminEmail = await getAdminEmail(request);
    const result = await rejectPaymentSubmission(id, adminEmail, rejectionReason, requestReupload);

    if (!result.success || !result.submission) {
      return NextResponse.json({ success: false, error: result.error || "Rejection failed" }, { status: 400, headers });
    }

    const submission = result.submission;
    after(async () => {
      try {
        const order = await getOrderById(submission.orderId);
        if (!order) return;
        const { notifyOrderEvent } = await import("@/src/lib/notifications");
        await notifyOrderEvent(order, "payment_rejected", submission, { reason: rejectionReason, reupload: requestReupload });
      } catch (err) {
        console.warn("[Payment rejected notification notice]:", err);
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: submission,
        message: requestReupload ? "New payment screenshot requested." : "Payment rejected.",
      },
      { status: 200, headers }
    );
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error && err.message ? err.message : "Internal server error during rejection" }, { status: 500, headers });
  }
}
