import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders } from "@/src/lib/admin-auth";
import { getEnquiries } from "@/src/lib/data-service";

export async function GET(request: NextRequest) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const enquiries = await getEnquiries();
    return NextResponse.json({ success: true, data: enquiries }, { status: 200, headers });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch enquiries" }, { status: 500, headers });
  }
}
