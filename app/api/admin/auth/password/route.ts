import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedAdminUser,
  AUTHORIZED_ADMIN_EMAIL,
  getAdminResponseHeaders,
} from "@/src/lib/admin-auth";
import { getAdminSupabase, getSupabaseAuthClient } from "@/src/lib/supabase";

export async function GET(request: NextRequest) {
  const adminUser = await getAuthenticatedAdminUser(request);
  const headers = getAdminResponseHeaders();

  if (!adminUser) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  return NextResponse.json(
    {
      success: true,
      email: AUTHORIZED_ADMIN_EMAIL,
      role: adminUser.role,
      id: adminUser.id,
    },
    { status: 200, headers }
  );
}

export async function POST(request: NextRequest) {
  const adminUser = await getAuthenticatedAdminUser(request);
  const headers = getAdminResponseHeaders();

  if (!adminUser) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { newPassword, action } = body;

    const sbAdmin = getAdminSupabase();
    const sbClient = getSupabaseAuthClient();

    // 1. Action: Trigger official password reset email to authorized Gmail
    if (action === "send_reset_email") {
      const sb = sbClient || sbAdmin;
      if (!sb) {
        return NextResponse.json(
          { success: false, error: "Supabase client unavailable" },
          { status: 500, headers }
        );
      }

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://sialkotcricketkits.com";

      const { error } = await sb.auth.resetPasswordForEmail(AUTHORIZED_ADMIN_EMAIL, {
        redirectTo: `${siteUrl}/admin`,
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message || "Failed to dispatch reset email" },
          { status: 400, headers }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: `Password reset link sent securely to ${AUTHORIZED_ADMIN_EMAIL}.`,
        },
        { status: 200, headers }
      );
    }

    // 2. Action: Direct secure password change
    if (newPassword) {
      if (typeof newPassword !== "string" || newPassword.length < 8) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 8 characters." },
          { status: 400, headers }
        );
      }

      if (!sbAdmin) {
        return NextResponse.json(
          { success: false, error: "Supabase Admin Service Role unavailable." },
          { status: 500, headers }
        );
      }

      const { error } = await sbAdmin.auth.admin.updateUserById(adminUser.id, {
        password: newPassword,
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message || "Failed to update password in Supabase." },
          { status: 400, headers }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Admin password updated successfully in Supabase Auth.",
        },
        { status: 200, headers }
      );
    }

    return NextResponse.json(
      { success: false, error: "Invalid action or missing parameters." },
      { status: 400, headers }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to process security update." },
      { status: 500, headers }
    );
  }
}
