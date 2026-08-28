"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Heart, MessageCircle, ShoppingCart } from "lucide-react";
import { useStore } from "@/src/components/StoreProvider";
import { formatPrice, type Product, BEST_SELLING_PRODUCT_IDS } from "@/src/data/products";
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
          <img src={product.image} alt={`${product.name} available from Sialkot Cricket Kits`} loading="lazy" />
        </Link>
        <button
          className={`favourite-button${favourite ? " active" : ""}`}
          onClick={() => toggleFavourite(product.id)}
          aria-label={favourite ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}
        >
          <Heart size={18} fill={favourite ? "currentColor" : "none"} />
        </button>
        {isBest ? (
          <span className="product-badge" style={{ background: "linear-gradient(135deg, #e11d48 0%, #f59e0b 100%)", color: "#fff", fontWeight: 800, letterSpacing: "0.03em" }}>🔥 Best Seller</span>
        ) : product.featured ? (
          <span className="product-badge">Featured</span>
        ) : null}
      </div>
      <div className="product-card-body">
        <span className="product-category">{product.category}</span>
        <h3><Link href={`/product/${product.id}`}>{product.name}</Link></h3>
        <div className="stock-line"><span>{typeof product.stock === "number" ? `${product.stock} in stock` : product.stock}</span>{product.rightStock !== undefined && <small>RH {product.rightStock} · LH {product.leftStock}</small>}</div>
        <strong className="product-price">{formatPrice(product.price)}</strong>
        <div className="product-card-actions">
          <button
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className={isJustAdded ? "is-added" : ""}
            style={isJustAdded ? { background: "#166534", color: "#ffffff" } : undefined}
          >
            {isJustAdded ? <Check size={17} /> : <ShoppingCart size={17} />}
            <span>{isJustAdded ? "Added" : "Add"}</span>
          </button>
          <a href={whatsappUrl(productMessage(product))} target="_blank" rel="noreferrer" aria-label={`Order ${product.name} on WhatsApp`}><MessageCircle size={17} /></a>
          <Link href={`/product/${product.id}`} aria-label={`View details for ${product.name}`}><ArrowUpRight size={17} /></Link>
        </div>
      </div>
    </article>
  );
}

