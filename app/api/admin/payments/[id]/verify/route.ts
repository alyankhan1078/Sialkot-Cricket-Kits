import { after, NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders, getAdminEmail } from "@/src/lib/admin-auth";
import { verifyAndConfirmOrder } from "@/src/lib/data-service";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401, headers });
  }

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { note, confirmedInUblAccount } = body;

    if (!confirmedInUblAccount) {
      return NextResponse.json(
        { success: false, error: "Please confirm that you checked this payment in the bank account first." },
        { status: 400, headers }
      );
    }

    const adminEmail = await getAdminEmail(request);
    const result = await verifyAndConfirmOrder(id, adminEmail, note);

    if (!result.success || !result.submission) {
      return NextResponse.json({ success: false, error: result.error || "Payment verification failed" }, { status: 400, headers });
    }

    // Confirmation email + WhatsApp: sent once, after the response.
    if (!result.alreadyConfirmed && result.order) {
      const order = result.order;
      const submission = result.submission;
      after(async () => {
        try {
          const { sendOrderConfirmedNotifications } = await import("@/src/lib/notifications");
          await sendOrderConfirmedNotifications(order, submission);
        } catch (err) {
          console.warn("[Payment confirmed notification notice]:", err);
        }
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: result.submission,
        order: result.order,
        alreadyConfirmed: result.alreadyConfirmed,
        message: "Payment marked as received. The order is confirmed.",
      },
      { status: 200, headers }
    );
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error && err.message ? err.message : "Internal server error during payment verification" }, { status: 500, headers });
  }
}
