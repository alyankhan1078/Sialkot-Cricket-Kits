import { NextResponse } from "next/server";
import { getCategories, getProducts } from "@/src/lib/data-service";

export async function GET() {
  try {
    const [categories, products] = await Promise.all([
      getCategories(),
      getProducts(),
    ]);

    const categoriesWithCount = categories.map((cat) => {
      const catProducts = products.filter((p) => p.category === cat.name);
      return {
        ...cat,
        count: catProducts.length,
        image: catProducts[0]?.image || "/assets/brand/sialkot-cricket-kits-logo.png",
      };
    });

    return NextResponse.json({ success: true, data: categoriesWithCount });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
