import { NextResponse } from "next/server";
import { createOrder, getSettings } from "@/src/lib/data-service";
import { sendOrderConfirmationEmail } from "@/src/lib/email";
import { isCountrySupported } from "@/src/lib/countries";
import { validateCheckoutCustomerInfo, type CheckoutCustomerInput } from "@/src/lib/validation";

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

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please select at least one item in your cart before checking out." },
        { status: 400 }
      );
    }

    const customerInput: CheckoutCustomerInput = {
      fullName: customerName || "",
      email: customerEmail || "",
      phone: customerPhone || "",
      phoneDialCode: body.phoneDialCode || "",
      country: country || "",
      countryCode: body.countryCode || "",
      address: address || "",
      city: city || "",
      state: state || "",
      postalCode: postalCode || "",
      deliveryInstructions: notes || "",
    };

    const validation = validateCheckoutCustomerInfo(customerInput);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          errors: validation.errors,
          error: Object.values(validation.errors)[0] || "Invalid customer or delivery details provided.",
        },
        { status: 400 }
      );
    }

    const validatedCustomerName = validation.normalized.fullName;
    const validatedCustomerEmail = validation.normalized.email;
    const validatedCustomerPhone = validation.normalized.phoneE164;
    const validatedCountry = validation.normalized.country;

    const itemsSubtotal = items.reduce(
      (sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
    const shippingFee = Number(body.shippingFee) || 0;
    const finalTotal = body.totalAmount ? Number(body.totalAmount) : itemsSubtotal + shippingFee;

    const depositPercentage = body.depositPercentage ? Number(body.depositPercentage) : 50;
    const amountPaidNow = body.amountPaidNow ? Number(body.amountPaidNow) : Math.round(finalTotal * (depositPercentage / 100) * 100) / 100;
    const balanceRemaining = body.balanceRemaining !== undefined ? Number(body.balanceRemaining) : Math.round((finalTotal - amountPaidNow) * 100) / 100;

    const fullNotes = [
      depositPercentage < 100
        ? `Order Confirmation Plan: ${depositPercentage}% Advance Deposit (Due/Paid Today: £${amountPaidNow} | Balance Due Before Dispatch: £${balanceRemaining})`
        : "Order Confirmation Plan: 100% Full Payment Upfront (Fully Paid)",
      notes ? `Customer Notes: ${notes}` : "",
      address ? `Shipping Address: ${address}, ${city || ""}, ${state || ""} ${postalCode || ""}, ${country || ""}` : "",
      shippingFee > 0 ? `Tracked Courier Shipping Fee: £${shippingFee}` : "",
      transactionRef ? `Payment Ref / Transaction ID: ${transactionRef}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const orderData = {
      customerName: validatedCustomerName,
      customerEmail: validatedCustomerEmail,
      customerPhone: validatedCustomerPhone,
      country: validatedCountry,
      address: validation.normalized.address,
      city: validation.normalized.city,
      state: validation.normalized.state,
      postalCode: validation.normalized.postalCode,
      deliveryInstructions: validation.normalized.deliveryInstructions,
      items: items.map((i: any) => ({
        productId: i.id || i.productId,
        name: i.name,
        category: i.category,
        price: Number(i.price) || 0,
        quantity: Number(i.quantity) || 1,
      })),
      totalAmount: finalTotal,
      paymentStatus: "awaiting_payment" as const,
      fulfilmentStatus: "new" as const,
      status: "pending" as const,
      paymentMethod: paymentMethod || "Direct Website Order",
      notes: fullNotes,
    };

    const createdOrder = await createOrder(orderData);

    // Send confirmation email asynchronously (does not block order response if email takes time)
    sendOrderConfirmationEmail(createdOrder).catch((err) => {
      console.error("[Background Email Dispatch Error]:", err);
    });

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
