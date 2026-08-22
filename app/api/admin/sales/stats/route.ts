import { NextResponse } from "next/server";
import { getSalesStats } from "@/src/lib/data-service";
import { validateAdminSessionFromRequest } from "@/src/lib/admin-auth";

export async function GET(request: Request) {
  if (!validateAdminSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await getSalesStats();
    return NextResponse.json({ success: true, data: stats });
  } catch {
    return NextResponse.json({ error: "Failed to fetch sales statistics" }, { status: 500 });
  }
}
