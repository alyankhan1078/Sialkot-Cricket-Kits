import { NextResponse } from "next/server";
import { getSettings, toPublicSettings } from "@/src/lib/data-service";

// Public endpoint: returns only contact/business details that are safe to show
// on the website. Secret keys and internal payment toggles are never included.
export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ success: true, data: toPublicSettings(settings) });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
