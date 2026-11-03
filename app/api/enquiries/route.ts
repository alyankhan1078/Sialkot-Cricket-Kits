import { NextRequest, NextResponse } from "next/server";
import { createEnquiry, findRecentDuplicateEnquiry } from "@/src/lib/data-service";
import { checkRateLimit, getClientIp } from "@/src/lib/rate-limit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max: number): string | undefined {
  if (value === undefined || value === null) return undefined;
  const text = String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]+/g, "").trim();
  return text ? text.slice(0, max) : undefined;
}

/**
 * Public contact form endpoint.
 *
 * Custom bat orders are NOT accepted here any more: they can only be placed
 * through the paid checkout (advance payment + receipt + terms).
 */
export async function POST(request: NextRequest) {
  const okResponse = () =>
    NextResponse.json({ success: true, message: "Enquiry submitted successfully" });

  try {
    const limit = checkRateLimit(`enquiry:${getClientIp(request)}`, 5, 10 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many messages from this connection. Please try again in a few minutes." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    // Bots: honeypot filled in, or form submitted faster than a human could type.
    // Pretend success so they do not retry, but store nothing.
    const elapsedMs = Number(body.elapsedMs);
    if (clean(body.website, 200) || (Number.isFinite(elapsedMs) && elapsedMs >= 0 && elapsedMs < 2500)) {
      return okResponse();
    }

    const name = clean(body.name, 100);
    const message = clean(body.message, 2000);
    const email = clean(body.email, 150);

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 });
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ success: false, error: "Please enter a valid email address" }, { status: 400 });
    }

    // Same person sending the same message again (double click, re-send): keep one copy.
    const duplicate = await findRecentDuplicateEnquiry({ name, email, message }, 30 * 60 * 1000);
    if (duplicate) {
      return okResponse();
    }

    const extras: Record<string, string> = {};
    const enquiryType = clean(body.enquiryType, 80);
    const productModel = clean(body.productModel, 150);
    const quantity = clean(body.quantity, 20);
    const orderNumber = clean(body.orderNumber, 40);
    if (enquiryType) extras.enquiryType = enquiryType;
    if (productModel) extras.productModel = productModel;
    if (quantity) extras.quantity = quantity;
    if (orderNumber) extras.orderNumber = orderNumber;

    await createEnquiry({
      type: "contact",
      name,
      email,
      phone: clean(body.phone, 50),
      country: clean(body.country, 100),
      message,
      product: productModel,
      extras: Object.keys(extras).length > 0 ? JSON.stringify(extras) : undefined,
    });

    return okResponse();
  } catch {
    return NextResponse.json({ success: false, error: "Failed to submit enquiry" }, { status: 500 });
  }
}
