import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders } from "@/src/lib/admin-auth";
import { getSettings, updateSettings } from "@/src/lib/data-service";

export async function GET(request: NextRequest) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const settings = await getSettings();
    return NextResponse.json({ success: true, data: settings }, { status: 200, headers });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500, headers });
  }
}

export async function POST(request: NextRequest) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const body = await request.json();
    const updated = await updateSettings(body);
    return NextResponse.json({ success: true, data: updated }, { status: 200, headers });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500, headers });
  }
}
