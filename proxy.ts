import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/src/lib/admin-auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/admin" || pathname === "/admin/";
  const isAuthEndpoint = pathname.startsWith("/api/admin/auth/");

  if (isLoginPage || isAuthEndpoint) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const authenticated = await isAuthenticatedAdmin(request);

  if (!authenticated) {
    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        {
          status: 401,
          headers: { "Cache-Control": "private, no-store" },
        }
      );
    }

    const loginUrl = new URL("/admin", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set(
    "Cache-Control",
    "private, no-store, max-age=0, must-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
