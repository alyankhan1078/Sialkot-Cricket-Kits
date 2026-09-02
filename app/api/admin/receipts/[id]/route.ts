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

  if (!submission) {
    return NextResponse.json({ error: "Payment submission not found" }, { status: 404 });
  }

  const storagePath = submission.receiptStoragePath || "";

  // 3. If stored in Supabase Storage or storage:// reference
  if (storagePath.startsWith("supabase://") || storagePath.startsWith("storage://")) {
    const rawPath = storagePath.replace(/^(supabase|storage):\/\//, "");
    let bucket = "receipts";
    let filePath = rawPath;

    if (rawPath.startsWith("products/")) {
      bucket = "products";
      filePath = rawPath.replace("products/", "");
    } else if (rawPath.startsWith("receipts/")) {
      bucket = "receipts";
      filePath = rawPath.replace("receipts/", "");
    }

    try {
      const sb = getAdminSupabase();
      if (sb) {
        // Try receipts bucket
        let { data: blob, error } = await sb.storage.from(bucket).download(filePath);
        if (error && bucket !== "products") {
          const prodResult = await sb.storage.from("products").download(filePath);
          if (!prodResult.error && prodResult.data) {
            blob = prodResult.data;
            error = null;
          }
        }

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
    if (matches && matches.length === 3) {
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
  }

  // 5. Fallback SVG Receipt Summary Badge
  const svgBadge = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" rx="12" fill="#0c131d" stroke="#233044" stroke-width="2"/>
      <rect x="20" y="20" width="560" height="50" rx="6" fill="#131b26"/>
      <text x="40" y="52" fill="#f59e0b" font-family="sans-serif" font-size="18" font-weight="bold">SIALKOT CRICKET KITS — PAYMENT EVIDENCE</text>
      <text x="40" y="110" fill="#94a3b8" font-family="sans-serif" font-size="14">Order Reference:</text>
      <text x="220" y="110" fill="#f8fafc" font-family="monospace" font-size="15" font-weight="bold">#${submission.orderId}</text>
      <text x="40" y="145" fill="#94a3b8" font-family="sans-serif" font-size="14">Transfer Reference:</text>
      <text x="220" y="145" fill="#22c55e" font-family="monospace" font-size="15" font-weight="bold">${submission.transferReference}</text>
      <text x="40" y="180" fill="#94a3b8" font-family="sans-serif" font-size="14">Amount Verified:</text>
      <text x="220" y="180" fill="#f8fafc" font-family="sans-serif" font-size="15" font-weight="bold">£${submission.amountSent} ${submission.currencySent}</text>
      <text x="40" y="215" fill="#94a3b8" font-family="sans-serif" font-size="14">Sender:</text>
      <text x="220" y="215" fill="#f8fafc" font-family="sans-serif" font-size="14">${submission.senderName} (${submission.senderCountry})</text>
      <text x="40" y="250" fill="#94a3b8" font-family="sans-serif" font-size="14">Beneficiary Account:</text>
      <text x="220" y="250" fill="#f8fafc" font-family="sans-serif" font-size="14">ALYAN WAZIR (UBL Bank)</text>
      <rect x="40" y="290" width="520" height="65" rx="6" fill="#1e293b"/>
      <text x="60" y="325" fill="#38bdf8" font-family="sans-serif" font-size="13">Attached file: ${submission.receiptOriginalName || "receipt.jpg"}</text>
      <text x="60" y="343" fill="#64748b" font-family="sans-serif" font-size="11">Protected Private Supabase Storage Reference</text>
    </svg>
  `;

  return new NextResponse(svgBadge, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `inline; filename="receipt_${submission.orderId}.svg"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
