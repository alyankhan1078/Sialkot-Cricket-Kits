import { NextResponse } from "next/server";
import { getProductImages, saveProductImages, addProductImage } from "@/src/lib/data-service";
import { isAuthenticatedAdmin, getAdminResponseHeaders } from "@/src/lib/admin-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  const { id } = await params;
  try {
    const images = await getProductImages(id);
    return NextResponse.json({ success: true, data: images }, { status: 200, headers });
  } catch (error: any) {
    console.error("[GET images]", error?.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product images" },
      { status: 500, headers }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json(
        { success: false, error: "Image URL is required" },
        { status: 400, headers }
      );
    }

    const newImage = await addProductImage(id, {
      url: body.url,
      storagePath: body.storagePath,
      alt: body.alt,
      isMain: body.isMain,
    });

    return NextResponse.json({ success: true, data: newImage }, { status: 201, headers });
  } catch (error: any) {
    console.error("[POST images]", error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to add image" },
      { status: 500, headers }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    if (!Array.isArray(body.images)) {
      return NextResponse.json(
        { success: false, error: "Images array is required" },
        { status: 400, headers }
      );
    }

    const saved = await saveProductImages(id, body.images);
    return NextResponse.json({ success: true, data: saved }, { status: 200, headers });
  } catch (error: any) {
    console.error("[PUT images]", error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save images" },
      { status: 500, headers }
    );
  }
}
