import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders, AUTHORIZED_ADMIN_EMAIL } from "@/src/lib/admin-auth";
import { updateOrderStatus } from "@/src/lib/data-service";

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
    const { status, note, adminEmail } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: "New status is required." }, { status: 400, headers });
    }

    const verifiedAdmin = adminEmail || AUTHORIZED_ADMIN_EMAIL;
    const result = await updateOrderStatus(id, status, verifiedAdmin, note);

    if (!result.success || !result.order) {
      return NextResponse.json({ success: false, error: result.error || "Failed to update order status" }, { status: 400, headers });
    }

    return NextResponse.json({
      success: true,
      data: result.order,
      message: `Order status updated to "${status}".`,
    }, { status: 200, headers });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500, headers }
    );
  }
}
