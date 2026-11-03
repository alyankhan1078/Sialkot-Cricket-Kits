import type { Metadata } from "next";
import { ShopClient } from "@/src/components/ShopClient";
import { getCategories, getProducts } from "@/src/lib/data-service";
import type { Product } from "@/src/data/products";

export const metadata: Metadata = {
  title: "Official 2026 Catalogue",
  description:
    "Browse cricket bats, batting pads, gloves, keeping gear, kit bags and teamwear made in Sialkot, with tracked worldwide delivery and prices in GBP.",
};

export default async function ShopPage() {
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
    <main className="shop-page" style={{ background: "#0c1017", minHeight: "100vh", color: "#ffffff" }}>
      <ShopClient initialProducts={cards} initialCategories={categories.map((c) => c.name)} />
    </main>
  );
}
