"use client";

import Link from "next/link";
import { ArrowUpRight, Heart, MessageCircle, ShoppingCart } from "lucide-react";
import { useStore } from "@/src/components/StoreProvider";
import { formatPrice, type Product } from "@/src/data/products";
import { productMessage, whatsappUrl } from "@/src/lib/whatsapp";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, favourites, toggleFavourite } = useStore();
  const favourite = favourites.includes(product.id);
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link href={`/product/${product.id}`} aria-label={`View ${product.name}`}>
          <img src={product.image} alt={`${product.name} available from Sialkot Cricket Kits`} loading="lazy" />
        </Link>
        <button className={`favourite-button${favourite ? " active" : ""}`} onClick={() => toggleFavourite(product.id)} aria-label={favourite ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}><Heart size={18} fill={favourite ? "currentColor" : "none"} /></button>
        {product.featured && <span className="product-badge">Featured</span>}
      </div>
      <div className="product-card-body">
        <span className="product-category">{product.category}</span>
        <h3><Link href={`/product/${product.id}`}>{product.name}</Link></h3>
        <div className="stock-line"><span>{typeof product.stock === "number" ? `${product.stock} in stock` : product.stock}</span>{product.rightStock !== undefined && <small>RH {product.rightStock} · LH {product.leftStock}</small>}</div>
        <strong className="product-price">{formatPrice(product.price)}</strong>
        <div className="product-card-actions">
          <button onClick={() => addToCart(product.id)} aria-label={`Add ${product.name} to cart`}><ShoppingCart size={17} /> Add</button>
          <a href={whatsappUrl(productMessage(product))} target="_blank" rel="noreferrer" aria-label={`Order ${product.name} on WhatsApp`}><MessageCircle size={17} /></a>
          <Link href={`/product/${product.id}`} aria-label={`View details for ${product.name}`}><ArrowUpRight size={17} /></Link>
        </div>
      </div>
    </article>
  );
}

