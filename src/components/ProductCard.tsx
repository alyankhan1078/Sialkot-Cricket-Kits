"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Heart, MessageCircle, ShoppingCart } from "lucide-react";
import { useStore } from "@/src/components/StoreProvider";
import { type Product, BEST_SELLING_PRODUCT_IDS } from "@/src/data/products";
import { productMessage, whatsappUrl } from "@/src/lib/whatsapp";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, favourites, toggleFavourite, formatPrice } = useStore();
  const [isJustAdded, setIsJustAdded] = useState(false);
  const favourite = favourites.includes(product.id);
  const isBest = product.isBestSeller || BEST_SELLING_PRODUCT_IDS.includes(product.id);

  const handleAdd = () => {
    addToCart(product.id);
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 1600);
  };

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link href={`/product/${product.id}`} aria-label={`View ${product.name}`}>
          <img
            src={product.image}
            alt={product.imageAlt || `${product.name} from Sialkot Cricket Kits`}
            loading="lazy"
          />
        </Link>
        <button
          className={`favourite-button${favourite ? " active" : ""}`}
          onClick={() => toggleFavourite(product.id)}
          aria-label={favourite ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}
        >
          <Heart size={18} fill={favourite ? "currentColor" : "none"} />
        </button>
        {isBest ? (
          <span className="product-badge best-seller">🔥 Best Seller</span>
        ) : product.featured ? (
          <span className="product-badge">Featured</span>
        ) : null}
      </div>

      <div className="product-card-body">
        <span className="product-category">{product.category}</span>
        <h3 className="product-title">
          <Link href={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        {/* Compact 2-line clamped description without reserved min-height */}
        <p className="product-short-desc">
          {product.shortDescription || `${product.name} handcrafted in Sialkot, Pakistan.`}
        </p>

        <div className="stock-line">
          <span>{typeof product.stock === "number" ? `${product.stock} in stock` : product.stock}</span>
          {product.rightStock !== undefined && <small>RH {product.rightStock} · LH {product.leftStock}</small>}
        </div>

        <strong className="product-price">{formatPrice(product.price)}</strong>

        <div className="product-card-actions">
          <button
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className={isJustAdded ? "is-added" : ""}
            style={isJustAdded ? { background: "#166534", color: "#ffffff" } : undefined}
          >
            {isJustAdded ? <Check size={16} /> : <ShoppingCart size={16} />}
            <span>{isJustAdded ? "Added" : "Add"}</span>
          </button>
          <a
            href={whatsappUrl(productMessage(product))}
            target="_blank"
            rel="noreferrer"
            aria-label={`Order ${product.name} on WhatsApp`}
          >
            <MessageCircle size={16} />
          </a>
          <Link href={`/product/${product.id}`} aria-label={`View details for ${product.name}`}>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
