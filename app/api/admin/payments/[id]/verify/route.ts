import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders, AUTHORIZED_ADMIN_EMAIL } from "@/src/lib/admin-auth";
import { verifyAndConfirmOrder } from "@/src/lib/data-service";
import { sendOrderConfirmedNotifications } from "@/src/lib/notifications";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401, headers });
  }

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { note, confirmedInUblAccount, adminEmail } = body;

    if (!confirmedInUblAccount) {
      return NextResponse.json(
        {
          success: false,
          error: "You must confirm that this transaction was verified in the official UBL bank account / app.",
        },
        { status: 400, headers }
      );
    }

    const verifiedAdmin = adminEmail || AUTHORIZED_ADMIN_EMAIL;
    const result = await verifyAndConfirmOrder(id, verifiedAdmin, note);

    if (!result.success || !result.submission) {
      return NextResponse.json(
        { success: false, error: result.error || "Payment verification failed" },
        { status: 400, headers }
      );
    }

    // Trigger confirmation notifications (Email + WhatsApp) if not already confirmed
    if (!result.alreadyConfirmed && result.order) {
      sendOrderConfirmedNotifications(result.order).catch((err) => {
        console.warn("[Admin Verification Notification Dispatch Notice]:", err);
      });
    }

    return NextResponse.json({
      success: true,
      data: result.submission,
      order: result.order,
      alreadyConfirmed: result.alreadyConfirmed,
      message: "Payment successfully verified. Order status updated to Order Confirmed.",
    }, { status: 200, headers });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error during payment verification" },
      { status: 500, headers }
    );
  }
}
