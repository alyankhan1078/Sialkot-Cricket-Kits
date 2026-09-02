import { NextRequest, NextResponse } from "next/server";
import { validateAdminSessionFromRequest } from "@/src/lib/admin-auth";
import {
  getPaymentSubmissions,
  getPaymentStatusHistory,
  checkDuplicateTransferReference,
  getOrderById,
} from "@/src/lib/data-service";
import { getNotificationLogsForOrder } from "@/src/lib/notifications";

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

    // Enrich with duplicate reference checks, associated order data, and notification logs
    const enriched = await Promise.all(
      submissions.map(async (sub) => {
        const [duplicateInfo, history, order, notificationLogs] = await Promise.all([
          checkDuplicateTransferReference(sub.transferReference, sub.orderId),
          getPaymentStatusHistory(sub.id),
          getOrderById(sub.orderId),
          getNotificationLogsForOrder(sub.orderId),
        ]);

        return {
          ...sub,
          isDuplicateReference: duplicateInfo.isDuplicate,
          duplicateMatchedOrders: duplicateInfo.matchedOrders,
          history,
          order,
          notificationLogs,
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
