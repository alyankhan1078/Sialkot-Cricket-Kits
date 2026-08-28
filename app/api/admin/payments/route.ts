import { NextRequest, NextResponse } from "next/server";
import { validateAdminSessionFromRequest } from "@/src/lib/admin-auth";
import { getPaymentSubmissions, getPaymentStatusHistory, checkDuplicateTransferReference } from "@/src/lib/data-service";

export async function GET(request: NextRequest) {
  if (!validateAdminSessionFromRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const orderId = searchParams.get("orderId") || undefined;

    const submissions = await getPaymentSubmissions({ status, search, orderId });

    // Enrich with duplicate reference checks and latest history
    const enriched = await Promise.all(
      submissions.map(async (sub) => {
        const duplicateInfo = await checkDuplicateTransferReference(sub.transferReference, sub.orderId);
        const history = await getPaymentStatusHistory(sub.id);
        return {
          ...sub,
          isDuplicateReference: duplicateInfo.isDuplicate,
          duplicateMatchedOrders: duplicateInfo.matchedOrders,
          history,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enriched,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load payment submissions" },
      { status: 500 }
    );
  }
}
