import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders } from "@/src/lib/admin-auth";
import { createCategory, getCategories } from "@/src/lib/data-service";

export async function GET(request: NextRequest) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const categories = await getCategories(true);
    return NextResponse.json({ success: true, data: categories }, { status: 200, headers });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500, headers });
  }
}

export async function POST(request: NextRequest) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const body = await request.json();
    const { name } = body;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400, headers });
    }

    const newCat = await createCategory(name.trim());
    return NextResponse.json({ success: true, data: newCat }, { status: 200, headers });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500, headers });
  }
}
