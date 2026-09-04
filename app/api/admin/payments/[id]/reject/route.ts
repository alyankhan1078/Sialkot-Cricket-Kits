import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders, AUTHORIZED_ADMIN_EMAIL } from "@/src/lib/admin-auth";
import { rejectPaymentSubmission } from "@/src/lib/data-service";

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
    const { rejectionReason, requestReupload, adminEmail } = body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return NextResponse.json(
        { success: false, error: "A clear rejection reason is required." },
        { status: 400, headers }
      );
    }

    const verifiedAdmin = adminEmail || AUTHORIZED_ADMIN_EMAIL;
    const result = await rejectPaymentSubmission(id, verifiedAdmin, rejectionReason.trim(), !!requestReupload);

    if (!result.success || !result.submission) {
      return NextResponse.json({ success: false, error: result.error || "Rejection failed" }, { status: 400, headers });
    }

    return NextResponse.json({
      success: true,
      data: result.submission,
      message: requestReupload
        ? "Payment submission marked as re-upload requested."
        : "Payment submission rejected.",
    }, { status: 200, headers });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error during rejection" },
      { status: 500, headers }
    );
  }
}
