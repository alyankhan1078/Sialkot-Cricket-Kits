import { NextRequest, NextResponse } from "next/server";
import { createAdminSession, verifyAdminLogin } from "@/src/lib/data-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const clientIp =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "admin-client";

    const userAgent = request.headers.get("user-agent") || "generic-device";

    const verification = await verifyAdminLogin({ email, password, clientIp });

    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error || "Authentication failed" },
        { status: 401 }
      );
    }

    const sessionToken = createAdminSession(userAgent);
    const response = NextResponse.json({
      success: true,
      message: "Authenticated successfully. Welcome back, Admin.",
    });

    // Set HTTP-only secure cookie
    response.cookies.set("sck_admin_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Login request failed. Please try again." },
      { status: 500 }
    );
  }
}
