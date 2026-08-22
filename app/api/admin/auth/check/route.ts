import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/src/lib/admin-auth";

export async function GET(request: NextRequest) {
  const isAuth = isAuthenticatedAdmin(request);
  return NextResponse.json({ authenticated: isAuth });
}
