import { NextResponse } from "next/server";
import { getOrderById } from "@/src/lib/data-service";
import { sendOrderConfirmationEmail } from "@/src/lib/email";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const result = await sendOrderConfirmationEmail(order);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Confirmation email dispatched for Order #${order.id}`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to dispatch email" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
