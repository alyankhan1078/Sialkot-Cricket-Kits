import { NextRequest, NextResponse } from "next/server";
import { validateAdminSessionFromRequest } from "@/src/lib/admin-auth";
import { rejectPaymentSubmission } from "@/src/lib/data-service";

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
    const { rejectionReason, requestReupload, adminEmail } = body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return NextResponse.json(
        { success: false, error: "A clear rejection reason is required." },
        { status: 400 }
      );
    }

    const verifiedAdmin = adminEmail || "admin@sialkotcricketkits.co.uk";
    const result = await rejectPaymentSubmission(id, verifiedAdmin, rejectionReason.trim(), !!requestReupload);

    if (!result.success || !result.submission) {
      return NextResponse.json({ success: false, error: result.error || "Rejection failed" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.submission,
      message: requestReupload
        ? "Payment submission marked as re-upload requested."
        : "Payment submission rejected.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error during rejection" },
      { status: 500 }
    );
  }
}
