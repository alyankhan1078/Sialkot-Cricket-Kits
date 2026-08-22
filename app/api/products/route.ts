import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/src/lib/data-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const featured = searchParams.get("featured") === "true" ? true : undefined;
    const search = searchParams.get("search") || undefined;

    const products = await getProducts({ category, featured, search });
    return NextResponse.json({ success: true, count: products.length, data: products });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
