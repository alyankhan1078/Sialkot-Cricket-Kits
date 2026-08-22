import { NextRequest, NextResponse } from "next/server";
import { destroyAdminSession } from "@/src/lib/data-service";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("sck_admin_token")?.value;
  if (token) {
    destroyAdminSession(token);
  }

  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.delete("sck_admin_token");
  return response;
}
