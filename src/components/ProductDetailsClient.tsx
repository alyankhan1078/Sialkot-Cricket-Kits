"use client";

import { useState } from "react";
import { Heart, MessageCircle, Minus, Plus, ShoppingCart, Video } from "lucide-react";
import { useStore } from "@/src/components/StoreProvider";
import { formatPrice, type Product } from "@/src/data/products";
import { productMessage, whatsappUrl } from "@/src/lib/whatsapp";

export function ProductDetailsClient({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [country, setCountry] = useState("");
  const gallery = product.images?.length ? product.images : [product.image];
  const [activeImage, setActiveImage] = useState(gallery[0]);
  const { addToCart, favourites, toggleFavourite } = useStore();
  const favourite = favourites.includes(product.id);

  return (
    <section className="product-detail">
      <div className="product-detail-media">
        <div className="product-detail-image"><img src={activeImage} alt={`${product.name} from Sialkot Cricket Kits`} /></div>
        {gallery.length > 1 && (
          <div className="product-gallery" aria-label={`${product.name} image gallery`}>
            {gallery.map((image, index) => (
              <button
                className={activeImage === image ? "active" : ""}
                key={image}
                onClick={() => setActiveImage(image)}
                aria-label={`View ${product.name} image ${index + 1}`}
                aria-pressed={activeImage === image}
              >
                <img src={image} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="product-detail-copy">
        <span className="mini-label">{product.category}</span>
        <h1>{product.name}</h1>
        <strong className="detail-price">{formatPrice(product.price)}</strong>
        <p>{product.description}</p>
        <div className="detail-stock"><span>Catalogue stock</span><strong>{typeof product.stock === "number" ? `${product.stock} available` : product.stock}</strong>{product.rightStock !== undefined && <small>Right-hand: {product.rightStock} · Left-hand: {product.leftStock}</small>}</div>
        <div className="detail-fields">
          <div><label>Quantity</label><div className="quantity-control large"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Reduce quantity"><Minus size={16} /></button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><Plus size={16} /></button></div></div>
          <label><span>Delivery country (optional)</span><input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="e.g. United Kingdom" /></label>
        </div>
        <div className="detail-actions">
          <button className="button primary" onClick={() => addToCart(product.id, quantity)}><ShoppingCart size={18} /> Add to cart</button>
          <a className="button whatsapp" href={whatsappUrl(productMessage(product, quantity, country))} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Order on WhatsApp</a>
          <button className={`button favourite${favourite ? " active" : ""}`} onClick={() => toggleFavourite(product.id)}><Heart size={18} fill={favourite ? "currentColor" : "none"} /> {favourite ? "Saved" : "Save"}</button>
        </div>
        <a className="ping-link" href={whatsappUrl(`Hello Sialkot Cricket Kits, I would like original pictures or a live product video for ${product.name}. Please confirm availability.`)} target="_blank" rel="noreferrer"><Video size={18} /> Request original pictures or a live ping/product video</a>
        <p className="detail-note">Shipping is confirmed separately according to destination and parcel size. Please confirm stock before payment.</p>
      </div>
    </section>
  );
}
