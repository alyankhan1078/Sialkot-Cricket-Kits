import { NextRequest, NextResponse } from "next/server";
import { getAdminResponseHeaders } from "@/src/lib/admin-auth";
import { getSupabaseAuthClient, getAdminSupabase } from "@/src/lib/supabase";

export async function POST(request: NextRequest) {
  const headers = getAdminResponseHeaders();

  // Attempt to invalidate Supabase token if available
  try {
    const token =
      request.cookies.get("sb_access_token")?.value ||
      request.cookies.get("sb-access-token")?.value;
    if (token) {
      const sb = getSupabaseAuthClient() || getAdminSupabase();
      if (sb) {
        await sb.auth.admin?.signOut(token).catch(() => {});
      }
    }
  } catch {}

  const response = NextResponse.json(
    { success: true, message: "Logged out successfully." },
    { status: 200, headers }
  );

  // Clear all auth cookies
  response.cookies.delete("sb_access_token");
  response.cookies.delete("sb-access-token");
  response.cookies.delete("sb_refresh_token");
  response.cookies.delete("supabase_auth_token");
  response.cookies.delete("sck_admin_token");

  return response;
}
