import { NextResponse } from "next/server";
import { generateSalesCsv } from "@/src/lib/data-service";
import { validateAdminSessionFromRequest } from "@/src/lib/admin-auth";

export async function GET(request: Request) {
  if (!validateAdminSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const rangeName = searchParams.get("range") || "All_Time";

  try {
    const csvContent = await generateSalesCsv(startDate, endDate);
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `Sialkot_Cricket_Kits_Sales_Report_${rangeName}_${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate sales report" }, { status: 500 });
  }
}
