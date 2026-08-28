import { NextRequest, NextResponse } from "next/server";
import { validateAdminSessionFromRequest } from "@/src/lib/admin-auth";
import { getPaymentSubmissionById, getPaymentSubmissionByOrderId } from "@/src/lib/data-service";
import path from "path";
import fs from "fs/promises";

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

  // 3. If stored as Base64 Data URL
  if (storagePath.startsWith("data:")) {
    const matches = storagePath.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: "Invalid receipt data format" }, { status: 500 });
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${submission.receiptOriginalName || "receipt"}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  }

  // 4. If stored on disk in private_receipts
  try {
    // Prevent path traversal attacks
    const sanitizedFileName = path.basename(storagePath);
    const fullPath = path.join(process.cwd(), "private_receipts", sanitizedFileName);
    const fileBuffer = await fs.readFile(fullPath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": submission.receiptMimeType || "image/jpeg",
        "Content-Disposition": `inline; filename="${submission.receiptOriginalName || sanitizedFileName}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[Receipt Read Error]:", err);
    return NextResponse.json({ error: "Failed to load receipt from private storage" }, { status: 404 });
  }
}
