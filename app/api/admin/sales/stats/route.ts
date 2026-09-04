import { NextResponse } from "next/server";
import { getSalesStats } from "@/src/lib/data-service";
import { isAuthenticatedAdmin, getAdminResponseHeaders } from "@/src/lib/admin-auth";

export async function GET(request: Request) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const stats = await getSalesStats();
    return NextResponse.json({ success: true, data: stats }, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "Failed to fetch sales statistics" }, { status: 500, headers });
  }
}
