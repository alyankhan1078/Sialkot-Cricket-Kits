import { NextRequest, NextResponse } from "next/server";
import { createAdminSession, verifyAdminPassword } from "@/src/lib/data-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json(
        { success: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    const sessionToken = createAdminSession();
    const response = NextResponse.json({ success: true, message: "Logged in successfully" });

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
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
