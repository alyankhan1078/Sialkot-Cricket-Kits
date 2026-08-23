import { NextResponse } from "next/server";
import { createOrder, getSettings } from "@/src/lib/data-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      state,
      postalCode,
      country,
      items,
      paymentMethod,
      transactionRef,
      notes,
    } = body;

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide customer name and at least one item in cart." },
        { status: 400 }
      );
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );

    const fullNotes = [
      notes ? `Customer Notes: ${notes}` : "",
      address ? `Shipping Address: ${address}, ${city || ""}, ${state || ""} ${postalCode || ""}, ${country || ""}` : "",
      transactionRef ? `Payment Ref / Transaction ID: ${transactionRef}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const orderData = {
      customerName,
      customerEmail: customerEmail || undefined,
      customerPhone: customerPhone || undefined,
      country: country || "Pakistan",
      items: items.map((i: any) => ({
        productId: i.id || i.productId,
        name: i.name,
        category: i.category,
        price: Number(i.price) || 0,
        quantity: Number(i.quantity) || 1,
      })),
      totalAmount,
      status: "pending" as const,
      paymentMethod: paymentMethod || "Direct Website Order",
      notes: fullNotes,
    };

    const createdOrder = await createOrder(orderData);

    return NextResponse.json({
      success: true,
      data: createdOrder,
      orderId: createdOrder.id,
    });
  } catch (error: any) {
    console.error("Direct Checkout Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process order." },
      { status: 500 }
    );
  }
}
