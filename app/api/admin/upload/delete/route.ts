import { NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders } from "@/src/lib/admin-auth";
import { requireAdminSupabase } from "@/src/lib/supabase";

export async function POST(request: Request) {
  const headers = getAdminResponseHeaders();

  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401, headers }
    );
  }

  try {
    const body = await request.json();
    const { storagePaths } = body;

    if (!Array.isArray(storagePaths) || storagePaths.length === 0) {
      return NextResponse.json(
        { success: false, error: "storagePaths array is required" },
        { status: 400, headers }
      );
    }

    // Validate all paths are strings and reasonable length
    const validPaths = storagePaths.filter(
      (p: any) => typeof p === "string" && p.length > 0 && p.length < 500
    );

    if (validPaths.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid storage paths provided" },
        { status: 400, headers }
      );
    }

    const sb = requireAdminSupabase();
    const { error } = await sb.storage
      .from("product-images")
      .remove(validPaths);

    if (error) {
      console.error("[Storage Delete] Error:", error.message);
      return NextResponse.json(
        { success: false, error: "Failed to delete storage objects" },
        { status: 500, headers }
      );
    }

    return NextResponse.json(
      { success: true, deleted: validPaths.length },
      { status: 200, headers }
    );
  } catch (err: any) {
    console.error("[Storage Delete] Unhandled error:", err?.message || err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500, headers }
    );
  }
}
