import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders } from "@/src/lib/admin-auth";
import { createProduct, getProducts, revalidateProductPages } from "@/src/lib/data-service";

export async function GET(request: NextRequest) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const products = await getProducts({ includeInactive: true });
    return NextResponse.json({ success: true, data: products }, { status: 200, headers });
  } catch (error: any) {
    console.error("[GET /api/admin/products]", error?.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500, headers }
    );
  }
}

export async function POST(request: NextRequest) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const body = await request.json();
    const { name, category, price, stock, rightStock, leftStock, image, images, description, featured, active } = body;

    // Server-side validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Product name is required", code: "VALIDATION_ERROR" },
        { status: 400, headers }
      );
    }
    if (name.length > 300) {
      return NextResponse.json(
        { success: false, error: "Product name too long (max 300 chars)", code: "VALIDATION_ERROR" },
        { status: 400, headers }
      );
    }
    if (!category || typeof category !== "string") {
      return NextResponse.json(
        { success: false, error: "Category is required", code: "VALIDATION_ERROR" },
        { status: 400, headers }
      );
    }
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json(
        { success: false, error: "Valid price is required (≥ 0)", code: "VALIDATION_ERROR" },
        { status: 400, headers }
      );
    }

    const slugify = (v: string) =>
      v
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const id = `${slugify(category)}-${slugify(name)}-${Date.now().toString().slice(-4)}`;

    const newProduct = await createProduct({
      id,
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      stock: stock ? String(stock) : "Available",
      rightStock: rightStock ? String(rightStock) : undefined,
      leftStock: leftStock ? String(leftStock) : undefined,
      image: image || "/assets/products/bat-collection.webp",
      images: Array.isArray(images) ? images : undefined,
      description: typeof description === "string" ? description.slice(0, 10000) : "",
      featured: !!featured,
      active: active !== undefined ? !!active : true,
      sortOrder: 0,
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201, headers });
  } catch (error: any) {
    console.error("[POST /api/admin/products]", error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create product" },
      { status: 500, headers }
    );
  }
}
