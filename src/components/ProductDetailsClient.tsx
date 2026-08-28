"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Heart,
  MessageCircle,
  Minus,
  Plus,
  ShoppingCart,
  Video,
  ShieldCheck,
  Truck,
  Sparkles,
  Info,
  Layers,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { useStore } from "@/src/components/StoreProvider";
import { type Product } from "@/src/data/products";
import { productMessage, whatsappUrl } from "@/src/lib/whatsapp";
import { BUSINESS_CONFIG } from "@/src/lib/business-config";

export function ProductDetailsClient({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [country, setCountry] = useState("");
  const gallery = product.images?.length ? product.images : [product.image];
  const [activeImage, setActiveImage] = useState(gallery[0]);
  const { addToCart, favourites, toggleFavourite, formatPrice } = useStore();
  const [isJustAdded, setIsJustAdded] = useState(false);
  const favourite = favourites.includes(product.id);

  const handleAdd = () => {
    addToCart(product.id, quantity);
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 1600);
  };

  // Filter out any invalid / empty specification rows
  const cleanSpecs = (product.specifications || []).filter(
    (s) =>
      s &&
      s.label &&
      s.value &&
      !["n/a", "null", "undefined", "unknown", "lorem ipsum", "to be confirmed"].includes(
        s.value.toLowerCase().trim()
      )
  );

  const isBatCategory =
    product.category.includes("Bat") ||
    product.category === "Beauty Processed Bats" ||
    product.category === "Bonafide Bats" ||
    product.category === "Junior & Harrow Bats";

  return (
    <section className="product-detail">
      {/* Left Media Column */}
      <div className="product-detail-media">
        <div className="product-detail-image">
          <img
            src={activeImage}
            alt={product.imageAlt || `${product.name} from Sialkot Cricket Kits`}
          />
        </div>
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

      {/* Right Product Details Column */}
      <div className="product-detail-copy">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span className="mini-label">{product.category}</span>
          {product.disclosureType === "beauty_processed" && (
            <span
              style={{
                fontSize: ".72rem",
                fontWeight: 700,
                background: "rgba(242, 169, 40, 0.15)",
                color: "#f2a928",
                padding: "2px 8px",
                borderRadius: 4,
                border: "1px solid rgba(242, 169, 40, 0.3)",
              }}
            >
              Beauty Processed
            </span>
          )}
          {product.disclosureType === "bonafide" && (
            <span
              style={{
                fontSize: ".72rem",
                fontWeight: 700,
                background: "rgba(34, 197, 94, 0.15)",
                color: "#4ade80",
                padding: "2px 8px",
                borderRadius: 4,
                border: "1px solid rgba(34, 197, 94, 0.3)",
              }}
            >
              Raw Bonafide Willow
            </span>
          )}
        </div>

        <h1>{product.name}</h1>

        <strong className="detail-price">{formatPrice(product.price)}</strong>

        {/* 2. Opening Statement */}
        {product.openingStatement && (
          <div
            style={{
              fontSize: ".96rem",
              fontWeight: 600,
              color: "#f1f5f9",
              lineHeight: 1.5,
              marginBottom: 12,
              paddingLeft: 12,
              borderLeft: "3px solid var(--primary, #f2a928)",
            }}
          >
            {product.openingStatement}
          </div>
        )}

        {/* 3. Full Product Description */}
        <p style={{ lineHeight: 1.65, fontSize: ".9rem", color: "#cbd5e1", margin: "12px 0 16px" }}>
          {product.description}
        </p>

        {/* 5. Best For Callout */}
        {product.bestFor && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: ".82rem",
              color: "#94a3b8",
              marginBottom: 16,
            }}
          >
            <Sparkles size={15} color="var(--primary, #f2a928)" />
            <span>
              <strong style={{ color: "#fff" }}>Best For:</strong> {product.bestFor}
            </span>
          </div>
        )}

        {/* 4. Key Highlights */}
        {product.highlights && product.highlights.length > 0 && (
          <div
            style={{
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "14px 18px",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontSize: ".76rem",
                fontWeight: 700,
                color: "var(--primary, #f2a928)",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Layers size={14} /> Key Highlights
            </div>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {product.highlights.map((h, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    fontSize: ".84rem",
                    color: "#cbd5e1",
                    lineHeight: 1.45,
                  }}
                >
                  <Check size={15} color="#22c55e" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 6. Clean Specifications Table */}
        {cleanSpecs.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: ".76rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: 8,
              }}
            >
              Product Specifications
            </div>
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                overflow: "hidden",
                fontSize: ".82rem",
              }}
            >
              {cleanSpecs.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 1fr",
                    padding: "8px 14px",
                    background: idx % 2 === 0 ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.2)",
                    borderBottom: idx < cleanSpecs.length - 1 ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
                  }}
                >
                  <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{s.label}</span>
                  <span style={{ color: "#fff", fontWeight: 500 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Stock Line */}
        <div className="detail-stock" style={{ marginBottom: 16 }}>
          <span>Catalogue stock</span>
          <strong>{typeof product.stock === "number" ? `${product.stock} available` : product.stock}</strong>
          {product.rightStock !== undefined && (
            <small>Right-hand: {product.rightStock} · Left-hand: {product.leftStock}</small>
          )}
        </div>

        {/* Quantity & Country Controls */}
        <div className="detail-fields">
          <div>
            <label>Quantity</label>
            <div className="quantity-control large">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Reduce quantity">
                <Minus size={16} />
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">
                <Plus size={16} />
              </button>
            </div>
          </div>
          <label>
            <span>Delivery country (optional)</span>
            <input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              placeholder="e.g. United Kingdom"
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="detail-actions">
          <button
            className={`button primary ${isJustAdded ? "is-added" : ""}`}
            onClick={handleAdd}
            style={isJustAdded ? { background: "#166534" } : undefined}
          >
            {isJustAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
            <span>{isJustAdded ? "✓ Added to Cart!" : "Add to cart"}</span>
          </button>
          <a
            className="button whatsapp"
            href={whatsappUrl(productMessage(product, quantity, country))}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} /> Order on WhatsApp
          </a>
          <button
            className={`button favourite${favourite ? " active" : ""}`}
            onClick={() => toggleFavourite(product.id)}
          >
            <Heart size={18} fill={favourite ? "currentColor" : "none"} /> {favourite ? "Saved" : "Save"}
          </button>
        </div>

        {/* Live Video / Ping Request CTA */}
        <a
          className="ping-link"
          href={whatsappUrl(
            `Hello Sialkot Cricket Kits, I would like original pictures or a live product video for ${product.name}. Please confirm availability.`
          )}
          target="_blank"
          rel="noreferrer"
        >
          <Video size={18} /> Request original pictures or a live ping/product video
        </a>

        {/* Category-Specific Disclosures */}
        {product.disclosureType === "beauty_processed" && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              background: "rgba(242, 169, 40, 0.08)",
              border: "1px solid rgba(242, 169, 40, 0.25)",
              borderRadius: 8,
              fontSize: ".8rem",
              color: "#fbbf24",
              lineHeight: 1.45,
            }}
          >
            <strong>Beauty Processed Disclosure:</strong> Beauty Processed bats receive additional cosmetic finishing intended to create a cleaner and more uniform visual presentation. Surface marks may become less visible and the grain presentation may appear cleaner or more prominent. This cosmetic process does not, by itself, guarantee a higher natural grade or improved playing performance.{" "}
            <Link
              href="/policies/international-agreement"
              style={{ color: "#38bdf8", textDecoration: "underline" }}
            >
              Read full policy agreement
            </Link>
          </div>
        )}

        {product.disclosureType === "bonafide" && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              background: "rgba(34, 197, 94, 0.08)",
              border: "1px solid rgba(34, 197, 94, 0.25)",
              borderRadius: 8,
              fontSize: ".8rem",
              color: "#86efac",
              lineHeight: 1.45,
            }}
          >
            <strong>Bonafide Natural Willow Disclosure:</strong> Bonafide bats are supplied in their natural, unbleached state. Willow is an organic material, and natural variations—including individual grain counts, grain spacing, shade differences, and minor cosmetic markings—are expected natural characteristics and are not defects.
          </div>
        )}

        {isBatCategory && product.disclosureType !== "beauty_processed" && product.disclosureType !== "bonafide" && (
          <div
            style={{
              marginTop: 14,
              padding: "10px 14px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: ".78rem",
              color: "var(--text-muted)",
              lineHeight: 1.4,
            }}
          >
            <strong>Natural Willow Notice:</strong> Willow is a natural material, so grain pattern, colour and minor natural markings may vary between individual bats.
          </div>
        )}

        {/* 7. Order Assistance Callout */}
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            background: "rgba(56, 189, 248, 0.08)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            borderRadius: 8,
            fontSize: ".82rem",
            color: "#bae6fd",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <HelpCircle size={17} color="#38bdf8" />
            <span>Need help confirming the right size or specification?</span>
          </div>
          <a
            href={whatsappUrl(`Hello Sialkot Cricket Kits, I need help selecting the right size/specification for ${product.name}.`)}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#38bdf8",
              fontWeight: 700,
              textDecoration: "underline",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Chat on WhatsApp ({BUSINESS_CONFIG.displayPhone}) <ArrowRight size={14} />
          </a>
        </div>

        {/* Shipping & Transit Note */}
        <p className="detail-note" style={{ marginTop: 14 }}>
          Worldwide Express Tracked Courier (DHL / FedEx). Multi-item combined shipping discounts are calculated automatically in cart.
        </p>
      </div>
    </section>
  );
}
