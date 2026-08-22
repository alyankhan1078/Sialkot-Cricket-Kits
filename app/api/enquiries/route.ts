import { NextRequest, NextResponse } from "next/server";
import { createEnquiry } from "@/src/lib/data-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, email, phone, country, message, product, extras } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }
    if (name.length > 100) {
      return NextResponse.json({ success: false, error: "Name too long (max 100 characters)" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 });
    }
    if (message.length > 2000) {
      return NextResponse.json({ success: false, error: "Message too long (max 2000 characters)" }, { status: 400 });
    }

    const enquiry = await createEnquiry({
      type: type === "custom_bat" ? "custom_bat" : "contact",
      name: name.trim().slice(0, 100),
      email: email ? String(email).trim().slice(0, 150) : undefined,
      phone: phone ? String(phone).trim().slice(0, 50) : undefined,
      country: country ? String(country).trim().slice(0, 100) : undefined,
      message: message.trim().slice(0, 2000),
      product: product ? String(product).trim().slice(0, 150) : undefined,
      extras: extras ? JSON.stringify(extras).slice(0, 2000) : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Enquiry submitted successfully",
      data: enquiry,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to submit enquiry" },
      { status: 500 }
    );
  }
}
