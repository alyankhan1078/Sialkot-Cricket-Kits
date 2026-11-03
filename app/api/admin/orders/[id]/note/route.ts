import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders } from "@/src/lib/admin-auth";
import { setOrderAdminNote } from "@/src/lib/data-service";

/** Saves the owner's short note on an order. Only the "Admin Note:" line changes. */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const result = await setOrderAdminNote(id, String(body.note ?? ""));
    if (!result.success || !result.order) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400, headers });
    }
    return NextResponse.json({ success: true, data: { notes: result.order.notes } }, { status: 200, headers });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error && err.message ? err.message : "Could not save the note" }, { status: 500, headers });
  }
}
