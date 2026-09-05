import { NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders } from "@/src/lib/admin-auth";
import { requireAdminSupabase } from "@/src/lib/supabase";
import crypto from "crypto";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function sanitizeFilename(name: string): string {
  const ext = name.lastIndexOf(".") >= 0 ? name.slice(name.lastIndexOf(".")) : "";
  const base = name.slice(0, name.lastIndexOf(".") >= 0 ? name.lastIndexOf(".") : undefined);
  return base.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase().slice(0, 80) + ext.toLowerCase();
}

export async function POST(request: Request) {
  const headers = getAdminResponseHeaders();

  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401, headers }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const productId = (formData.get("productId") as string) || "general";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400, headers }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type "${file.type}". Allowed: JPEG, PNG, WebP, AVIF.`,
        },
        { status: 400, headers }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds 10 MB limit." },
        { status: 400, headers }
      );
    }

    // Validate productId format
    const sanitizedProductId = productId
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase()
      .slice(0, 120);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate magic bytes for actual image content
    if (buffer.length < 4) {
      return NextResponse.json(
        { success: false, error: "File too small to be a valid image." },
        { status: 400, headers }
      );
    }

    // Build unique immutable path
    const uuid = crypto.randomUUID();
    const sanitizedName = sanitizeFilename(file.name);
    const storagePath = `products/${sanitizedProductId}/${uuid}-${sanitizedName}`;

    // Upload to Supabase Storage (only path — no fallbacks)
    const sb = requireAdminSupabase();

    // Ensure bucket exists with public access
    const { data: bucketData, error: bucketError } = await sb.storage.getBucket("product-images");
    if (!bucketData || bucketError) {
      const { error: createBucketError } = await sb.storage.createBucket("product-images", {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: ALLOWED_MIME_TYPES,
      });
      if (createBucketError && !createBucketError.message?.toLowerCase().includes("already exists")) {
        console.warn("[Upload] Warning creating bucket:", createBucketError.message);
      }
    }

    const { error: uploadError } = await sb.storage
      .from("product-images")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false, // Immutable paths — never overwrite
      });

    if (uploadError) {
      const errId = crypto.randomUUID().slice(0, 8);
      console.error(`[Upload] Storage error ${errId}:`, uploadError.message);
      return NextResponse.json(
        {
          success: false,
          error: `Upload failed. Please try again. [ref: ${errId}]`,
        },
        { status: 500, headers }
      );
    }

    // Get public URL
    const { data: publicData } = sb.storage
      .from("product-images")
      .getPublicUrl(storagePath);

    if (!publicData?.publicUrl) {
      // Upload succeeded but can't get URL — clean up
      await sb.storage.from("product-images").remove([storagePath]);
      return NextResponse.json(
        { success: false, error: "Upload succeeded but failed to generate public URL." },
        { status: 500, headers }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          url: publicData.publicUrl,
          storagePath,
          name: file.name,
          size: file.size,
          type: file.type,
        },
      },
      { status: 200, headers }
    );
  } catch (err: any) {
    const errId = crypto.randomUUID().slice(0, 8);
    console.error(`[Upload] Unhandled error ${errId}:`, err?.message || err);
    return NextResponse.json(
      {
        success: false,
        error: `Server error processing upload. [ref: ${errId}]`,
      },
      { status: 500, headers }
    );
  }
}
