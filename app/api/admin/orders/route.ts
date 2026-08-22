import { NextResponse } from "next/server";
import { getOrders, createOrder } from "@/src/lib/data-service";
import { validateAdminSessionFromRequest } from "@/src/lib/admin-auth";

export async function GET(request: Request) {
  if (!validateAdminSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;

  try {
    const orders = await getOrders({ status, search, startDate, endDate });
    return NextResponse.json({ success: true, data: orders, count: orders.length });
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!validateAdminSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.customerName || !body.items || !body.totalAmount) {
      return NextResponse.json(
        { error: "Customer name, items, and total amount are required" },
        { status: 400 }
      );
    }

    const newOrder = await createOrder(body);
    return NextResponse.json({ success: true, data: newOrder });
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
