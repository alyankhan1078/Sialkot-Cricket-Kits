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

  const title = product.seoTitle || `${product.name} | Sialkot Cricket Kits`;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    `${product.name} available at Sialkot Cricket Kits for £${product.price}. Handcrafted in Sialkot with worldwide tracked delivery.`;
  const canonicalUrl = `https://sialkotcricketkits.co.uk/product/${product.id}`;
  const images = product.image ? [product.image] : ["/assets/brand/sialkot-cricket-kits-logo.png"];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Sialkot Cricket Kits",
      images: images.map((url) => ({
        url,
        alt: product.imageAlt || product.name,
      })),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image,
    description: product.shortDescription || product.description,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "Sialkot Cricket Kits",
    },
    offers: {
      "@type": "Offer",
      url: `https://sialkotcricketkits.co.uk/product/${product.id}`,
      priceCurrency: "GBP",
      price: product.price,
      availability:
        String(product.stock) === "0" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Sialkot Cricket Kits",
      },
    },
  };

  return (
    <main className="product-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
