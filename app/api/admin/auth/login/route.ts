import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAuthClient, getAdminSupabase } from "@/src/lib/supabase";
import { AUTHORIZED_ADMIN_EMAIL, getAdminResponseHeaders } from "@/src/lib/admin-auth";

// In-memory rate limiting for login attempts
interface RateLimitEntry {
  failures: number;
  lockedUntil: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

export async function POST(request: NextRequest) {
  const headers = getAdminResponseHeaders();

  try {
    const clientIp =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "admin-client";

    const now = Date.now();
    const rateLimit = rateLimitMap.get(clientIp);

    // 1. Check rate-limit lock
    if (rateLimit && rateLimit.lockedUntil > now) {
      const minutesRemaining = Math.ceil((rateLimit.lockedUntil - now) / 60000);
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed attempts. Device is temporarily locked for security. Please try again in ${minutesRemaining} minute${minutesRemaining > 1 ? "s" : ""}.`,
        },
        { status: 429, headers }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanPassword = typeof password === "string" ? password : "";

    // Fail early without revealing specific field validity
    if (!normalizedEmail || !cleanPassword) {
      recordFailure(clientIp, now);
      return NextResponse.json(
        { success: false, error: "Invalid administrator credentials." },
        { status: 401, headers }
      );
    }

    // 2. Authorize via Supabase Auth
    const sb = getSupabaseAuthClient() || getAdminSupabase();
    if (!sb) {
      return NextResponse.json(
        { success: false, error: "Authentication service is temporarily unavailable." },
        { status: 503, headers }
      );
    }

    const { data, error } = await sb.auth.signInWithPassword({
      email: normalizedEmail,
      password: cleanPassword,
    });

    if (error || !data?.session || !data?.user) {
      recordFailure(clientIp, now);
      return NextResponse.json(
        { success: false, error: "Invalid administrator credentials." },
        { status: 401, headers }
      );
    }

    const user = data.user;
    const userEmail = (user.email || "").trim().toLowerCase();
    const userRole = (user.app_metadata?.role || "").trim().toLowerCase();

    // 3. Strict verification of authorized admin email & app_metadata.role
    if (userEmail !== AUTHORIZED_ADMIN_EMAIL || userRole !== "admin") {
      // Invalidate session immediately if an unauthorized user logged in
      try {
        await sb.auth.admin?.signOut(data.session.access_token);
      } catch {}
      recordFailure(clientIp, now);
      return NextResponse.json(
        { success: false, error: "Invalid administrator credentials." },
        { status: 401, headers }
      );
    }

    // 4. Optional UUID verification if ADMIN_USER_ID is set
    if (process.env.ADMIN_USER_ID && user.id !== process.env.ADMIN_USER_ID.trim()) {
      recordFailure(clientIp, now);
      return NextResponse.json(
        { success: false, error: "Invalid administrator credentials." },
        { status: 401, headers }
      );
    }

    // Clear failed attempts upon successful login
    rateLimitMap.delete(clientIp);

    const response = NextResponse.json(
      {
        success: true,
        message: "Authenticated successfully. Welcome to Sialkot Cricket Kits Admin.",
        user: {
          id: user.id,
          email: userEmail,
          role: userRole,
        },
      },
      { status: 200, headers }
    );

    // 12-hour session cookies (43200 seconds)
    const sessionMaxAge = 12 * 60 * 60;

    response.cookies.set("sb_access_token", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionMaxAge,
    });

    if (data.session.refresh_token) {
      response.cookies.set("sb_refresh_token", data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: sessionMaxAge,
      });
    }

    // Explicitly delete legacy cookie
    response.cookies.delete("sck_admin_token");

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid administrator credentials." },
      { status: 401, headers }
    );
  }
}

function recordFailure(clientIp: string, now: number) {
  const current = rateLimitMap.get(clientIp) || { failures: 0, lockedUntil: 0 };
  current.failures += 1;
  if (current.failures >= 5) {
    current.lockedUntil = now + 15 * 60 * 1000; // 15-minute lockout
  }
  rateLimitMap.set(clientIp, current);
}
