import { NextRequest, NextResponse } from "next/server";
import { validateAdminSessionFromRequest } from "@/src/lib/admin-auth";
import { getPaymentSubmissionById, getPaymentSubmissionByOrderId } from "@/src/lib/data-service";
import { getAdminSupabase } from "@/src/lib/supabase";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // 1. Authorize Administrator
  if (!validateAdminSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized access to payment receipts" }, { status: 401 });
  }

  const { id } = await context.params;

  // 2. Find payment submission
  let submission = await getPaymentSubmissionById(id);
  if (!submission) {
    submission = await getPaymentSubmissionByOrderId(id);
  }

  if (!submission || !submission.receiptStoragePath) {
    return NextResponse.json({ error: "Payment receipt not found" }, { status: 404 });
  }

  const storagePath = submission.receiptStoragePath;

  // 3. If stored in Supabase Storage
  if (storagePath.startsWith("supabase://")) {
    try {
      const rawPath = storagePath.replace("supabase://", "");
      let bucket = "receipts";
      let filePath = rawPath;

      if (rawPath.startsWith("products/")) {
        bucket = "products";
        filePath = rawPath.replace("products/", "");
      } else if (rawPath.startsWith("receipts/")) {
        bucket = "receipts";
        filePath = rawPath.replace("receipts/", "");
      }

      const sb = getAdminSupabase();
      if (sb) {
        const { data: blob, error } = await sb.storage.from(bucket).download(filePath);
        if (!error && blob) {
          const arrayBuffer = await blob.arrayBuffer();
          return new NextResponse(arrayBuffer, {
            headers: {
              "Content-Type": submission.receiptMimeType || blob.type || "image/jpeg",
              "Content-Disposition": `inline; filename="${submission.receiptOriginalName || filePath}"`,
              "Cache-Control": "private, max-age=3600",
            },
          });
        }
      }
    } catch (sbErr) {
      console.error("[Supabase Receipt Download Error]:", sbErr);
    }
  }

  // 4. If stored as Base64 Data URL
  if (storagePath.startsWith("data:")) {
    const matches = storagePath.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: "Invalid receipt data format" }, { status: 500 });
    }

    const mimeType = matches[1];
    const binaryStr = atob(matches[2]);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${submission.receiptOriginalName || "receipt"}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  }

  return NextResponse.json({ error: "Receipt stored in external bucket or reference is unavailable." }, { status: 404 });
}
