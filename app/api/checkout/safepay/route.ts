import { NextResponse } from "next/server";
import { createOrder, getProductById, updateOrder } from "@/src/lib/data-service";
import { calculateShippingFee, SHIPPING_DESTINATIONS } from "@/src/lib/shipping";
import { convertGbpToCurrency } from "@/src/lib/currency";
import { createSafepayTracker } from "@/src/lib/safepay";

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
      depositPercent,
      notes,
    } = body;

    // 1. Basic validation
    if (!customerName || !customerName.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (!customerPhone && !customerEmail) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid contact phone number or email address." },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty. Please add items before checking out." },
        { status: 400 }
      );
    }

    // 2. Authoritative server-side price lookup (prevent price tampering)
    const verifiedItems: Array<{
      productId: string;
      name: string;
      category: string;
      price: number;
      quantity: number;
      image?: string;
    }> = [];

    let calculatedSubtotalGbp = 0;
    let totalItemCount = 0;

    for (const item of items) {
      const productId = item.id || item.productId;
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      const serverProduct = await getProductById(productId);

      if (!serverProduct) {
        return NextResponse.json(
          {
            success: false,
            error: `Product with ID "${productId}" is unavailable or could not be found.`,
          },
          { status: 400 }
        );
      }

      const verifiedPrice = serverProduct.price;
      calculatedSubtotalGbp += verifiedPrice * quantity;
      totalItemCount += quantity;

      verifiedItems.push({
        productId: serverProduct.id,
        name: serverProduct.name,
        category: serverProduct.category,
        price: verifiedPrice,
        quantity,
        image: serverProduct.image,
      });
    }

    // 3. Authoritative server-side shipping fee calculation
    const shippingCountry = country || "Pakistan";
    const shippingCalc = calculateShippingFee(shippingCountry, totalItemCount);
    const shippingFeeGbp = shippingCalc.shippingFee;

    // 4. Calculate total order value and deposit
    const grandTotalGbp = Math.round((calculatedSubtotalGbp + shippingFeeGbp) * 100) / 100;

    // Validate deposit percentage (allowed: 30, 35, 50, 100; default: 50)
    const validDepositPercentages = [30, 35, 50, 100];
    const chosenDepositPercent = validDepositPercentages.includes(Number(depositPercent))
      ? Number(depositPercent)
      : 50;

    const depositDueGbp =
      chosenDepositPercent === 100
        ? grandTotalGbp
        : Math.round(grandTotalGbp * (chosenDepositPercent / 100) * 100) / 100;

    const balanceRemainingGbp = Math.max(0, Math.round((grandTotalGbp - depositDueGbp) * 100) / 100);

    // 5. Convert to PKR for Safepay gateway
    const amountInPkr = convertGbpToCurrency(depositDueGbp, "PKR");

    // 6. Build structured order record
    const year = new Date().getFullYear();
    const orderNotes = [
      chosenDepositPercent < 100
        ? `Safepay Payment Plan: ${chosenDepositPercent}% Advance Deposit (Due Now: £${depositDueGbp} / Rs ${amountInPkr.toLocaleString("en-PK")} | Balance: £${balanceRemainingGbp})`
        : `Safepay Payment Plan: 100% Full Payment Upfront (£${grandTotalGbp} / Rs ${amountInPkr.toLocaleString("en-PK")})`,
      notes ? `Customer Notes: ${notes}` : "",
      address ? `Delivery Address: ${address}, ${city || ""}, ${state || ""} ${postalCode || ""}, ${shippingCountry}` : "",
      `Tracked Courier: £${shippingFeeGbp} (${shippingCalc.destination.estimatedDelivery})`,
    ]
      .filter(Boolean)
      .join("\n");

    const orderData = {
      customerName: customerName.trim(),
      customerEmail: customerEmail?.trim() || undefined,
      customerPhone: customerPhone?.trim() || undefined,
      country: shippingCountry,
      items: verifiedItems.map((i) => ({
        productId: i.productId,
        name: i.name,
        category: i.category,
        price: i.price,
        quantity: i.quantity,
      })),
      subtotal: calculatedSubtotalGbp,
      shippingFee: shippingFeeGbp,
      totalAmount: grandTotalGbp,
      depositPercent: chosenDepositPercent,
      depositAmount: depositDueGbp,
      amountPaid: 0,
      balanceRemaining: balanceRemainingGbp,
      currency: "GBP",
      amountInPkr,
      status: "awaiting_payment" as const,
      paymentMethod: "Safepay Hosted Checkout (Cards / Raast / Wallets)",
      paymentProvider: "safepay" as const,
      notes: orderNotes,
    };

    const createdOrder = await createOrder(orderData);

    // 7. Initialize Safepay Payment Tracker Session
    const trackerResult = await createSafepayTracker({
      amount: amountInPkr,
      currency: "PKR",
      orderId: createdOrder.id,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      metadata: {
        orderId: createdOrder.id,
        depositPercent: chosenDepositPercent,
        depositDueGbp,
        totalOrderGbp: grandTotalGbp,
        balanceRemainingGbp,
        country: shippingCountry,
      },
    });

    if (!trackerResult.success || !trackerResult.token || !trackerResult.checkoutUrl) {
      // If Safepay returns an error, record failed status
      await updateOrder(createdOrder.id, {
        status: "payment_failed",
        notes: `${createdOrder.notes}\n[Safepay Init Error]: ${trackerResult.error || "Gateway initialization failed"}`,
      });

      return NextResponse.json(
        {
          success: false,
          error:
            trackerResult.error ||
            "Unable to initialize secure Safepay payment session. Please try again or contact us on WhatsApp.",
        },
        { status: 502 }
      );
    }

    // 8. Update order with Safepay Tracker Token
    await updateOrder(createdOrder.id, {
      providerTrackerId: trackerResult.token,
    });

    return NextResponse.json({
      success: true,
      url: trackerResult.checkoutUrl,
      tracker: trackerResult.token,
      orderId: createdOrder.id,
      amountInPkr,
      depositPercent: chosenDepositPercent,
      depositDueGbp,
    });
  } catch (error: any) {
    console.error("[Safepay Checkout Route Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process checkout session." },
      { status: 500 }
    );
  }
}
