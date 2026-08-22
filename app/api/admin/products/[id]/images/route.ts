import { NextResponse } from "next/server";
import { getProductImages, saveProductImages, addProductImage } from "@/src/lib/data-service";
import { validateAdminSessionFromRequest } from "@/src/lib/admin-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateAdminSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const images = await getProductImages(id);
    return NextResponse.json({ success: true, data: images });
  } catch {
    return NextResponse.json({ error: "Failed to fetch product images" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateAdminSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    if (!body.url) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const newImage = await addProductImage(id, {
      url: body.url,
      alt: body.alt,
      isMain: body.isMain,
    });

    return NextResponse.json({ success: true, data: newImage });
  } catch {
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateAdminSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    if (!Array.isArray(body.images)) {
      return NextResponse.json({ error: "Images array is required" }, { status: 400 });
    }

    const saved = await saveProductImages(id, body.images);
    return NextResponse.json({ success: true, data: saved });
  } catch {
    return NextResponse.json({ error: "Failed to save images" }, { status: 500 });
  }
}
