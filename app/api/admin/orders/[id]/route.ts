import { NextResponse } from "next/server";
import { getOrderById, updateOrder, deleteOrder } from "@/src/lib/data-service";
import { isAuthenticatedAdmin, getAdminResponseHeaders } from "@/src/lib/admin-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404, headers });
  }

  return NextResponse.json({ success: true, data: order }, { status: 200, headers });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const updated = await updateOrder(id, body);

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404, headers });
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500, headers });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  const { id } = await params;
  try {
    const deleted = await deleteOrder(id);
    if (!deleted) {
      return NextResponse.json({ error: "Order not found" }, { status: 404, headers });
    }

    return NextResponse.json({ success: true }, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500, headers });
  }
}
