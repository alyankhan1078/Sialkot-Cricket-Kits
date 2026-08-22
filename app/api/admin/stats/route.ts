import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/src/lib/admin-auth";
import { getCategories, getEnquiries, getFaqs, getProducts } from "@/src/lib/data-service";

export async function GET(request: NextRequest) {
  if (!isAuthenticatedAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [products, categories, faqs, enquiries] = await Promise.all([
      getProducts({ includeInactive: true }),
      getCategories(true),
      getFaqs(true),
      getEnquiries(),
    ]);

    const activeProducts = products.filter((p) => p.active).length;
    const featuredProducts = products.filter((p) => p.featured).length;
    const unreadEnquiries = enquiries.filter((e) => !e.read).length;

    return NextResponse.json({
      success: true,
      data: {
        totalProducts: products.length,
        activeProducts,
        featuredProducts,
        totalCategories: categories.length,
        totalFaqs: faqs.length,
        totalEnquiries: enquiries.length,
        unreadEnquiries,
        recentEnquiries: enquiries.slice(0, 5),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
  }
}
