import { NextResponse } from "next/server";

/**
 * Retired endpoint.
 *
 * This older "direct order" API accepted prices from the browser and created
 * orders without any payment proof or terms acceptance. Nothing on the website
 * calls it any more, so it is switched off to enforce the payment-first rule:
 * every order must go through /api/checkout/submit-manual-order (advance paid,
 * receipt uploaded, terms accepted, prices checked on the server).
 *
 * The order lookup used by the success and invoice pages lives in
 * /api/checkout/order/[id] and is unaffected.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Orders can only be placed through the secure checkout with payment proof. Please use https://sialkotcricketkits.com/checkout.",
    },
    { status: 410 }
  );
}
