import { NextRequest, NextResponse } from "next/server";
import { getOrderByTrackerId, getOrderById, updateOrder } from "@/src/lib/data-service";
import { verifySafepayWebhookSignature, getSafepayConfig } from "@/src/lib/safepay";
import { sendOrderConfirmationEmail } from "@/src/lib/email";

// Set runtime config if needed
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Read raw body as text for cryptographic HMAC signature verification
    const rawBody = await request.text();
    const signature =
      request.headers.get("x-sfpy-signature") ||
      request.headers.get("x-signature") ||
      request.headers.get("x-safepay-signature");

    const config = getSafepayConfig();

    // 2. Validate webhook signature in production or when secret key is set
    const isMockEnv = !config.webhookSecret || config.webhookSecret.includes("mock");
    if (!isMockEnv) {
      const isValid = verifySafepayWebhookSignature(rawBody, signature);
      if (!isValid) {
        console.warn("[Safepay Webhook]: Rejected webhook due to invalid HMAC signature.");
        return NextResponse.json(
          { success: false, error: "Invalid webhook signature" },
          { status: 401 }
        );
      }
    }

    // 3. Parse webhook JSON payload
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Malformed JSON payload" },
        { status: 400 }
      );
    }

    const eventType = payload?.event || payload?.type || "payment.completed";
    const data = payload?.data || payload;
    const trackerToken = data?.token || data?.tracker || data?.tracker_id || data?.beacon;
    const orderId = data?.order_id || data?.orderId || data?.metadata?.orderId;
    const transactionRef = data?.reference || data?.ref || data?.transaction_id || trackerToken;
    const paymentState = (data?.state || data?.status || "PAID").toUpperCase();
    const webhookEventId = payload?.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // 4. Find corresponding order
    let order = null;
    if (orderId) {
      order = await getOrderById(orderId);
    }
    if (!order && trackerToken) {
      order = await getOrderByTrackerId(trackerToken);
    }

    if (!order) {
      console.warn(`[Safepay Webhook]: No order found for tracker: ${trackerToken} / orderId: ${orderId}`);
      // Return 200 so Safepay does not endlessly retry unmapped events
      return NextResponse.json(
        { success: true, message: "Webhook acknowledged, no matching order found." },
        { status: 200 }
      );
    }

    // 5. Idempotency Check: prevent processing the same webhook event or payment twice
    if (
      (order.status === "deposit_paid" || order.status === "paid" || order.status === "completed") &&
      (order.webhookEventId === webhookEventId || order.transactionRef === transactionRef)
    ) {
      return NextResponse.json(
        { success: true, message: "Order already processed for this transaction." },
        { status: 200 }
      );
    }

    // 6. Handle Payment Statuses
    const isPaymentSuccess =
      paymentState === "PAID" ||
      paymentState === "COMPLETED" ||
      paymentState === "SUCCEEDED" ||
      eventType === "payment.succeeded" ||
      eventType === "order.completed";

    const isPaymentFailed =
      paymentState === "FAILED" ||
      paymentState === "EXPIRED" ||
      eventType === "payment.failed";

    const isPaymentCancelled =
      paymentState === "CANCELLED" ||
      eventType === "payment.cancelled";

    if (isPaymentSuccess) {
      const depositPercent = order.depositPercent || 50;
      const isPartialDeposit = depositPercent < 100;
      const depositAmount = order.depositAmount || Math.round(order.totalAmount * (depositPercent / 100) * 100) / 100;
      const balanceRemaining = Math.max(0, Math.round((order.totalAmount - depositAmount) * 100) / 100);

      const updatedOrder = await updateOrder(order.id, {
        status: isPartialDeposit ? "deposit_paid" : "paid",
        amountPaid: isPartialDeposit ? depositAmount : order.totalAmount,
        balanceRemaining: isPartialDeposit ? balanceRemaining : 0,
        paymentProvider: "safepay",
        providerTrackerId: trackerToken || order.providerTrackerId,
        transactionRef,
        webhookEventId,
        paidAt: new Date().toISOString(),
        notes: `${order.notes || ""}\n[Safepay Verified]: ${isPartialDeposit ? `${depositPercent}% Deposit Received (£${depositAmount})` : "100% Full Payment Received"} via Safepay (Ref: ${transactionRef})`,
      });

      // Dispatch order confirmation email asynchronously
      if (updatedOrder) {
        sendOrderConfirmationEmail(updatedOrder).catch((err) => {
          console.error("[Safepay Webhook Email Dispatch Error]:", err);
        });
      }

      return NextResponse.json({
        success: true,
        orderId: order.id,
        status: isPartialDeposit ? "deposit_paid" : "paid",
      });
    } else if (isPaymentFailed) {
      await updateOrder(order.id, {
        status: "payment_failed",
        transactionRef,
        webhookEventId,
        notes: `${order.notes || ""}\n[Safepay Alert]: Payment attempt failed (Ref: ${transactionRef})`,
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        status: "payment_failed",
      });
    } else if (isPaymentCancelled) {
      await updateOrder(order.id, {
        status: "payment_cancelled",
        transactionRef,
        webhookEventId,
        notes: `${order.notes || ""}\n[Safepay Alert]: Customer cancelled payment at checkout`,
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        status: "payment_cancelled",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Event ${eventType} recorded.`,
    });
  } catch (error: any) {
    console.error("[Safepay Webhook Critical Error]:", error);
    return NextResponse.json(
      { success: false, error: "Internal webhook processing error" },
      { status: 500 }
    );
  }
}
