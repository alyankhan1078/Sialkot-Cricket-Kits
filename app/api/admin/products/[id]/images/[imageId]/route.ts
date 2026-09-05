import { NextResponse } from "next/server";
import { updateProductImage, deleteProductImage, setMainProductImage } from "@/src/lib/data-service";
import { isAuthenticatedAdmin, getAdminResponseHeaders } from "@/src/lib/admin-auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  const { id, imageId } = await params;
  try {
    const body = await request.json();
    if (body.setMain) {
      const ok = await setMainProductImage(id, imageId);
      if (!ok) {
        return NextResponse.json({ success: false, error: "Failed to set main image" }, { status: 500, headers });
      }
      return NextResponse.json({ success: true }, { status: 200, headers });
    }

    const updated = await updateProductImage(id, imageId, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Image not found" }, { status: 404, headers });
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200, headers });
  } catch (error: any) {
    console.error("[PUT imageId]", error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update image" },
      { status: 500, headers }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  const { id, imageId } = await params;
  try {
    const ok = await deleteProductImage(id, imageId);
    if (!ok) {
      return NextResponse.json({ success: false, error: "Image not found" }, { status: 404, headers });
    }

    return NextResponse.json({ success: true }, { status: 200, headers });
  } catch (error: any) {
    console.error("[DELETE imageId]", error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete image" },
      { status: 500, headers }
    );
  }
}
