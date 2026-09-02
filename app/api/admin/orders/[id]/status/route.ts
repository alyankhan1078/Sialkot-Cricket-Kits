import { NextRequest, NextResponse } from "next/server";
import { validateAdminSessionFromRequest } from "@/src/lib/admin-auth";
import { updateOrderStatus, getOrderById } from "@/src/lib/data-service";

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
    const { status, note, adminEmail } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: "New status is required." }, { status: 400 });
    }

    const verifiedAdmin = adminEmail || "sialkotcricketkits@gmail.com";
    const result = await updateOrderStatus(id, status, verifiedAdmin, note);

    if (!result.success || !result.order) {
      return NextResponse.json({ success: false, error: result.error || "Failed to update order status" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.order,
      message: `Order status updated to "${status}".`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
