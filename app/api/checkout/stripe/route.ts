import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSettings } from "@/src/lib/data-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customerName, customerEmail, customerPhone, country, shippingFee, totalAmount, depositPercent, depositDueNow, balanceRemaining, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty. Please add items to checkout." },
        { status: 400 }
      );
    }

    const settings = await getSettings();
    const stripeSecretKey = settings.stripeSecretKey || process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Stripe card processing is not configured yet. Please add your Stripe Secret Key in Admin Settings or checkout via Wise / Bank / WhatsApp.",
          notConfigured: true,
        },
        { status: 400 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia" as any,
    });

    const origin = request.headers.get("origin") || "https://sialkot-cricket-kits-web.vercel.app";

    // Build Stripe Line Items (handling partial advance deposit vs 100% full payment)
    let line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    const isPartialDeposit = depositPercent && Number(depositPercent) < 100 && depositDueNow;

    if (isPartialDeposit) {
      const itemsListStr = items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ");
      line_items.push({
        price_data: {
          currency: "gbp",
          product_data: {
            name: `${depositPercent}% Advance Deposit for Order Confirmation`,
            description: `Total Order Value: £${totalAmount} (${itemsListStr} + Express Courier to ${country || "UK"}). Remaining £${balanceRemaining} payable upon video approval before courier dispatch.`,
          },
          unit_amount: Math.round(Number(depositDueNow) * 100),
        },
        quantity: 1,
      });
    } else {
      line_items = items.map((item: any) => ({
        price_data: {
          currency: "gbp",
          product_data: {
            name: item.name || "Cricket Equipment",
            description: item.category ? `Category: ${item.category}` : undefined,
            images: item.image && item.image.startsWith("http") ? [item.image] : undefined,
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: Number(item.quantity) || 1,
      }));

      // Add shipping line item if shipping fee > 0
      if (Number(shippingFee) > 0) {
        line_items.push({
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Tracked Express Courier Delivery (${country || "International"})`,
              description: "Express worldwide tracked door-to-door courier dispatch from Sialkot",
            },
            unit_amount: Math.round(Number(shippingFee) * 100),
          },
          quantity: 1,
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      customer_email: customerEmail || undefined,
      metadata: {
        customerName: customerName || "Customer",
        customerPhone: customerPhone || "N/A",
        country: country || "International",
        depositPlan: isPartialDeposit ? `${depositPercent}% Advance Deposit` : "100% Full Payment",
        depositDueNow: isPartialDeposit ? `£${depositDueNow}` : `£${totalAmount}`,
        balanceRemaining: isPartialDeposit ? `£${balanceRemaining}` : "£0 (Fully Paid)",
        totalOrderValue: `£${totalAmount}`,
        notes: notes || "",
        itemsSummary: items.map((i: any) => `${i.quantity}x ${i.name}`).join(", "),
      },
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop?payment_cancelled=true`,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initiate Stripe card checkout." },
      { status: 500 }
    );
  }
}
