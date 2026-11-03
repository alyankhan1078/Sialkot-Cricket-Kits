import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders, getAdminEmail } from "@/src/lib/admin-auth";
import { reopenPaymentSubmission } from "@/src/lib/data-service";

/** Removes the "payment checked" tick. Requires a reason; written to the order history. */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const reason = String(body.reason || "").trim();
    if (reason.length < 3) {
      return NextResponse.json({ success: false, error: "Please write why the payment is being reopened." }, { status: 400, headers });
    }
    const result = await reopenPaymentSubmission(id, await getAdminEmail(request), reason);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400, headers });
    }
    return NextResponse.json({ success: true, data: result.submission, order: result.order }, { status: 200, headers });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error && err.message ? err.message : "Could not reopen the payment" }, { status: 500, headers });
  }
}
