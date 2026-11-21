import type { Metadata } from "next";
import { ShopClient } from "@/src/components/ShopClient";
import { getCategories, getProducts } from "@/src/lib/data-service";
import type { Product } from "@/src/data/products";
import { CATEGORY_SEO } from "@/src/lib/category-seo";

type ShopProps = { searchParams: Promise<{ category?: string | string[] }> };

function pickCategory(raw: string | string[] | undefined): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && CATEGORY_SEO[value] ? value : undefined;
}

// Each category gets its own title, description and canonical URL, so Google can rank
// "batting pads" and "cricket bats" pages separately instead of treating them as one page.
export async function generateMetadata({ searchParams }: ShopProps): Promise<Metadata> {
  const category = pickCategory((await searchParams).category);
  if (!category) {
    return {
      title: "Shop Cricket Bats, Pads, Gloves & Kit",
      description:
        "Shop cricket bats, batting pads, gloves, keeping gear, helmets, kit bags and teamwear from Sialkot. Prices in GBP, tracked worldwide delivery.",
      alternates: { canonical: "/shop" },
    };
  }
  const seo = CATEGORY_SEO[category];
  const url = `/shop?category=${encodeURIComponent(category)}`;
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: url },
    openGraph: { title: `${seo.title} | Sialkot Cricket Kits`, description: seo.description, url },
  };
}

export default async function ShopPage({ searchParams }: ShopProps) {
  const category = pickCategory((await searchParams).category);
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  // Only the fields the product cards and filters use, so the page stays small.
  const cards = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    stock: p.stock,
    leftStock: p.leftStock,
    rightStock: p.rightStock,
    image: p.image,
    imageAlt: p.imageAlt || p.name,
    shortDescription: p.shortDescription || "",
    description: p.shortDescription || "",
    featured: p.featured,
  })) as unknown as Product[];

  return (
    <main className="shop-page">
      <ShopClient initialProducts={cards} initialCategories={categories.map((c) => c.name)} initialCategory={category} />
    </main>
  );
}
