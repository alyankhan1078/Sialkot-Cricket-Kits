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
  } catch (error) {
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
    const updated = await updateProduct(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404, headers });
    }
    return NextResponse.json({ success: true, data: updated }, { status: 200, headers });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500, headers });
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
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500, headers });
  }
}
