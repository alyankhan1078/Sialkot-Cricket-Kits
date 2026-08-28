import { NextRequest, NextResponse } from "next/server";
import { getOrderById, getOrderByTrackerId, updateOrder } from "@/src/lib/data-service";
import { verifySafepayPayment } from "@/src/lib/safepay";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const tracker = searchParams.get("tracker");

    if (!orderId && !tracker) {
      return NextResponse.json(
        { success: false, error: "Missing orderId or tracker query parameter." },
        { status: 400 }
      );
    }

    let order = null;
    if (orderId) {
      order = await getOrderById(orderId);
    }
    if (!order && tracker) {
      order = await getOrderByTrackerId(tracker);
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    // If order is still awaiting_payment and tracker is present, verify directly with Safepay
    if (order.status === "awaiting_payment" && (tracker || order.providerTrackerId)) {
      const activeTracker = tracker || order.providerTrackerId!;
      const checkResult = await verifySafepayPayment(activeTracker);

      if (checkResult.success && (checkResult.status === "PAID" || checkResult.status === "COMPLETED")) {
        const depositPercent = order.depositPercent || 50;
        const isPartialDeposit = depositPercent < 100;
        const depositAmount = order.depositAmount || Math.round(order.totalAmount * (depositPercent / 100) * 100) / 100;
        const balanceRemaining = Math.max(0, Math.round((order.totalAmount - depositAmount) * 100) / 100);

        order = await updateOrder(order.id, {
          status: isPartialDeposit ? "deposit_paid" : "paid",
          amountPaid: isPartialDeposit ? depositAmount : order.totalAmount,
          balanceRemaining: isPartialDeposit ? balanceRemaining : 0,
          providerTrackerId: activeTracker,
          paidAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error("[Checkout Verify Route Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to verify order payment status." },
      { status: 500 }
    );
  }
}
