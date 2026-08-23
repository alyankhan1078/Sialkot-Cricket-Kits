import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSettings } from "@/src/lib/data-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customerName, customerEmail, customerPhone, country, notes } = body;

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

    // Build Stripe Line Items
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
      price_data: {
        currency: "gbp",
        product_data: {
          name: item.name || "Cricket Equipment",
          description: item.category ? `Category: ${item.category}` : undefined,
          images: item.image && item.image.startsWith("http") ? [item.image] : undefined,
        },
        unit_amount: Math.round(Number(item.price) * 100), // convert GBP to pence
      },
      quantity: Number(item.quantity) || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      customer_email: customerEmail || undefined,
      metadata: {
        customerName: customerName || "Customer",
        customerPhone: customerPhone || "N/A",
        country: country || "International",
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
