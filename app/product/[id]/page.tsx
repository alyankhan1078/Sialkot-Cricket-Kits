import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { ProductCard } from "@/src/components/ProductCard";
import { ProductDetailsClient } from "@/src/components/ProductDetailsClient";
import { formatPrice } from "@/src/data/products";
import { getProductById, getProducts } from "@/src/lib/data-service";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Product not found | Sialkot Cricket Kits" };
  const description = `${product.name} — ${formatPrice(product.price)}. View current catalogue stock and enquire through Sialkot Cricket Kits.`;
  return {
    title: `${product.name} | Sialkot Cricket Kits`,
    description,
    openGraph: { title: product.name, description, images: [product.image] },
    twitter: { card: "summary_large_image", title: product.name, description, images: [product.image] },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product || !product.active) notFound();

  const allProducts = await getProducts();
  const related = allProducts
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);

  // Normalize product for client
  const clientProduct = {
    ...product,
    stock: product.stock,
  };

  return (
    <main className="product-page">
      <div className="breadcrumb">
        <Link href="/shop">
          <ArrowLeft size={16} /> Back to shop
        </Link>
        <span>/</span>
        <span>{product.category}</span>
      </div>
      <ProductDetailsClient product={clientProduct as any} />
      {related.length > 0 && (
        <section className="section related-section">
          <div className="section-intro">
            <p className="eyebrow dark">More in this category</p>
            <h2>Related products.</h2>
          </div>
          <div className="product-grid four">
            {related.map((item) => (
              <ProductCard product={item as any} key={item.id} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
