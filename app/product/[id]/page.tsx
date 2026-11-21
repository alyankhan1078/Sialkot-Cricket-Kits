import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { ProductCard } from "@/src/components/ProductCard";
import { ProductDetailsClient } from "@/src/components/ProductDetailsClient";
import { formatPrice } from "@/src/data/products";
import { getProductById, getProducts } from "@/src/lib/data-service";
import { productSeoName } from "@/src/lib/category-seo";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Product not found" };

  // Some stored SEO titles already end with a (sometimes truncated) brand
  // suffix such as "| Sialkot Cricke". Strip it and add the brand exactly once.
  // Lead with what the item is ("Apex Pro Beauty Processed Cricket Bat") so the title matches what people search.
  const baseTitle = (product.seoTitle || productSeoName(product.name, product.category)).replace(/\s*[|–-]\s*Sialkot\s*Cri[a-z]*(\s*Ki[a-z]*)?\s*$/i, "").trim() || product.name;
  const title = `${baseTitle} | Sialkot Cricket Kits`;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    `${productSeoName(product.name, product.category)} from Sialkot, £${product.price}. Ping video on request, tracked worldwide delivery.`;
  const canonicalUrl = `https://sialkotcricketkits.com/product/${product.id}`;
  const images = product.image ? [product.image] : ["/assets/brand/sialkot-cricket-kits-logo.png"];

  return {
    title: { absolute: title },
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

  // Ask the browser to fetch the main photo straight away (it is the largest thing on screen).
  const mainImage = product.images?.length ? product.images[0] : product.image;

  // Normalize product for client
  const clientProduct = {
    ...product,
    stock: product.stock,
  };

  const absolute = (src: string) => (src.startsWith("http") ? src : `https://sialkotcricketkits.com${src}`);
  const productUrl = `https://sialkotcricketkits.com/product/${product.id}`;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    url: productUrl,
    name: product.name,
    image: (product.images?.length ? product.images.slice(0, 6) : [product.image]).filter(Boolean).map(absolute),
    description: product.shortDescription || product.description,
    category: product.category,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "Sialkot Cricket Kits",
    },
    offers: {
      "@type": "Offer",
      url: `https://sialkotcricketkits.com/product/${product.id}`,
      priceCurrency: "GBP",
      price: product.price,
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Sialkot Cricket Kits",
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://sialkotcricketkits.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: "https://sialkotcricketkits.com/shop",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category,
        item: `https://sialkotcricketkits.com/shop?category=${encodeURIComponent(product.category)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `https://sialkotcricketkits.com/product/${product.id}`,
      },
    ],
  };

  return (
    <main className="product-page">
      {/* React moves this into <head>, so the browser starts fetching the main photo immediately. */}
      {mainImage && <link rel="preload" as="image" href={mainImage} fetchPriority="high" />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
