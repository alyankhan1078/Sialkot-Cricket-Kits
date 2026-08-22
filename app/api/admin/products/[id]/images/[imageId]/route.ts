import { NextResponse } from "next/server";
import { updateProductImage, deleteProductImage, setMainProductImage } from "@/src/lib/data-service";
import { validateAdminSessionFromRequest } from "@/src/lib/admin-auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  if (!validateAdminSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, imageId } = await params;
  try {
    const body = await request.json();
    if (body.setMain) {
      const ok = await setMainProductImage(id, imageId);
      return NextResponse.json({ success: ok });
    }

    const updated = await updateProductImage(id, imageId, body);
    if (!updated) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  if (!validateAdminSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, imageId } = await params;
  try {
    const ok = await deleteProductImage(id, imageId);
    if (!ok) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
