import { NextResponse } from "next/server";
import { getFaqs } from "@/src/lib/data-service";

export async function GET() {
  try {
    const faqs = await getFaqs();
    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}
