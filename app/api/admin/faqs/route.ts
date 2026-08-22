import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/src/lib/admin-auth";
import { createFaq, getFaqs } from "@/src/lib/data-service";

export async function GET(request: NextRequest) {
  if (!isAuthenticatedAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const faqs = await getFaqs(true);
    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch FAQs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticatedAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { question, answer } = body;
    if (!question || !answer) {
      return NextResponse.json({ success: false, error: "Question and answer are required" }, { status: 400 });
    }

    const newFaq = await createFaq(question.trim(), answer.trim());
    return NextResponse.json({ success: true, data: newFaq });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create FAQ" }, { status: 500 });
  }
}
