import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders } from "@/src/lib/admin-auth";
import { deleteProduct, getProductById, updateProduct } from "@/src/lib/data-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404, headers });
    }
    return NextResponse.json({ success: true, data: product }, { status: 200, headers });
  } catch (error: any) {
    console.error("[GET /api/admin/products/[id]]", error?.message);
    return NextResponse.json({ success: false, error: "Failed to fetch product" }, { status: 500, headers });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Server-side validation for provided fields
    if (body.name !== undefined && (typeof body.name !== "string" || body.name.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: "Product name cannot be empty", code: "VALIDATION_ERROR" },
        { status: 400, headers }
      );
    }
    if (body.price !== undefined && (isNaN(Number(body.price)) || Number(body.price) < 0)) {
      return NextResponse.json(
        { success: false, error: "Price must be a valid non-negative number", code: "VALIDATION_ERROR" },
        { status: 400, headers }
      );
    }
    if (body.name !== undefined && body.name.length > 300) {
      return NextResponse.json(
        { success: false, error: "Product name too long (max 300 chars)", code: "VALIDATION_ERROR" },
        { status: 400, headers }
      );
    }

    // Sanitize numeric fields
    const updateData: Record<string, any> = { ...body };
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);

    const updated = await updateProduct(id, updateData);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404, headers });
    }
    return NextResponse.json({ success: true, data: updated }, { status: 200, headers });
  } catch (error: any) {
    console.error("[PUT /api/admin/products/[id]]", error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update product" },
      { status: 500, headers }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const { id } = await params;
    const deleted = await deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404, headers });
    }
    return NextResponse.json({ success: true, message: "Product deleted" }, { status: 200, headers });
  } catch (error: any) {
    console.error("[DELETE /api/admin/products/[id]]", error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete product" },
      { status: 500, headers }
    );
  }
}
