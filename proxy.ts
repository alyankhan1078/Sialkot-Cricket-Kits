import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/src/lib/admin-auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname === "/admin/" || pathname.startsWith("/api/admin/auth/")) {
    return NextResponse.next({ headers: { "Cache-Control": "private, no-store" } });
  }

  if (!isAuthenticatedAdmin(request)) {
    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
