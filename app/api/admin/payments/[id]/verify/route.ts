import { NextRequest, NextResponse } from "next/server";
import { validateAdminSessionFromRequest } from "@/src/lib/admin-auth";
import { verifyPaymentSubmission, getOrderById } from "@/src/lib/data-service";
import { sendOrderConfirmationEmail } from "@/src/lib/email";

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
    const { note, confirmedInUblAccount, adminEmail } = body;

    if (!confirmedInUblAccount) {
      return NextResponse.json(
        {
          success: false,
          error: "You must confirm that this transaction was verified in the official UBL bank account / app.",
        },
        { status: 400 }
      );
    }

    const verifiedAdmin = adminEmail || "admin@sialkotcricketkits.co.uk";
    const result = await verifyPaymentSubmission(id, verifiedAdmin, note);

    if (!result.success || !result.submission) {
      return NextResponse.json({ success: false, error: result.error || "Verification failed" }, { status: 400 });
    }

    // Trigger updated confirmation email
    const order = await getOrderById(result.submission.orderId);
    if (order) {
      sendOrderConfirmationEmail(order).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: result.submission,
      message: "Payment successfully verified against UBL account records.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error during verification" },
      { status: 500 }
    );
  }
}
