import { NextResponse } from "next/server";
import { getOrderById } from "@/src/lib/data-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = new URL(request.url).searchParams.get("token");
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    if (!token || !order.trackingToken || token !== order.trackingToken) {
      return NextResponse.json({ success: false, error: "Order access could not be verified" }, { status: 403 });
    }
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch order" }, { status: 500 });
  }
}
