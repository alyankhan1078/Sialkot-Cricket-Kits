import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/src/lib/admin-auth";
import {
  updateAdminPassword,
  addAuthorizedAdminEmail,
  getAuthorizedAdminEmails,
  createAdminSession,
  revokeAllAdminSessions,
} from "@/src/lib/data-service";

export async function GET(request: NextRequest) {
  if (!isAuthenticatedAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    emails: getAuthorizedAdminEmails(),
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthenticatedAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword, newEmail, action } = body;

    if (action === "revoke_all_sessions") {
      revokeAllAdminSessions();
      const userAgent = request.headers.get("user-agent") || "current-device";
      const freshToken = createAdminSession(userAgent);
      const res = NextResponse.json({
        success: true,
        message: "All other device sessions have been revoked successfully.",
      });
      res.cookies.set("sck_admin_token", freshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }

    if (newEmail) {
      if (!newEmail.includes("@")) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid email address." },
          { status: 400 }
        );
      }
      addAuthorizedAdminEmail(newEmail);
      return NextResponse.json({
        success: true,
        message: `Authorized admin email "${newEmail}" registered successfully.`,
        emails: getAuthorizedAdminEmails(),
      });
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const result = await updateAdminPassword(newPassword, currentPassword);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to update password." },
        { status: 400 }
      );
    }

    // Re-issue fresh session token for the current device
    const userAgent = request.headers.get("user-agent") || "current-device";
    const freshToken = createAdminSession(userAgent);
    const response = NextResponse.json({
      success: true,
      message: "Admin password updated successfully. All other device sessions have been signed out.",
    });

    response.cookies.set("sck_admin_token", freshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process security update request." },
      { status: 500 }
    );
  }
}
