import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders } from "@/src/lib/admin-auth";
import { createProduct, getProducts } from "@/src/lib/data-service";

export async function GET(request: NextRequest) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const products = await getProducts({ includeInactive: true });
    return NextResponse.json({ success: true, data: products }, { status: 200, headers });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500, headers });
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

    if (!name || !category || price === undefined || !image) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, category, price, image" },
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
      name,
      category,
      price: Number(price),
      stock: stock ? String(stock) : "Available",
      rightStock: rightStock ? String(rightStock) : undefined,
      leftStock: leftStock ? String(leftStock) : undefined,
      image,
      images: Array.isArray(images) ? images : undefined,
      description: description || "",
      featured: !!featured,
      active: active !== undefined ? !!active : true,
      sortOrder: 0,
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 200, headers });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500, headers });
  }
}
