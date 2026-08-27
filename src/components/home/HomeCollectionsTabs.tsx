"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Trophy, Video } from "lucide-react";
import { ProductCard } from "@/src/components/ProductCard";
import type { Product } from "@/src/data/products";

interface CollectionsTabsProps {
  products: Product[];
}

export function HomeCollectionsTabs({ products }: CollectionsTabsProps) {
  const [activeTab, setActiveTab] = useState<"bats" | "protection" | "keeping" | "bags">("bats");

  // Filter products by tab
  const bats = products
    .filter((p) => ["Beauty Processed Bats", "Bonafide Bats"].includes(p.category))
    .slice(0, 8);

  const protection = products
    .filter((p) => ["Batting Pads", "Batting Gloves", "Thigh Pads", "Helmets"].includes(p.category))
    .slice(0, 8);

  const keeping = products
    .filter((p) => ["Keeping Gloves", "Keeping Inners", "Keeping Guards"].includes(p.category))
    .slice(0, 8);

  const bags = products
    .filter((p) => p.category === "Kit & Duffle Bags")
    .slice(0, 8);

  const activeProducts =
    activeTab === "bats"
      ? bats
      : activeTab === "protection"
      ? protection
      : activeTab === "keeping"
      ? keeping
      : bags;

  const activeCategoryUrl =
    activeTab === "bats"
      ? "/shop?category=Beauty%20Processed%20Bats"
      : activeTab === "protection"
      ? "/shop?category=Batting%20Pads"
      : activeTab === "keeping"
      ? "/shop?category=Keeping%20Gloves"
      : "/shop?category=Kit%20%26%20Duffle%20Bags";

  return (
    <section className="collections-showcase-section">
      <div className="collections-container">
        {/* Section Header */}
        <div className="collections-header-row">
          <div>
            <span className="section-eyebrow">2026 Factory Inventory</span>
            <h2 className="section-heading">
              Curated <span className="gold-text">Match Collections</span>
            </h2>
            <p className="section-subtext">
              Direct workshop pricing in GBP. Every single piece is individually inspected for seam, density, and finish.
            </p>
          </div>

          <Link href="/shop" className="view-all-shop-link">
            <span>Explore Entire 140+ Catalogue</span>
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* Tab Selector Buttons */}
        <div className="collections-tabs-bar">
          <button
            onClick={() => setActiveTab("bats")}
            className={`collection-tab ${activeTab === "bats" ? "active" : ""}`}
          >
            <Trophy size={16} />
            <span>Pro Match Bats ({bats.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("protection")}
            className={`collection-tab ${activeTab === "protection" ? "active" : ""}`}
          >
            <ShieldCheck size={16} />
            <span>Pads &amp; Gloves ({protection.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("keeping")}
            className={`collection-tab ${activeTab === "keeping" ? "active" : ""}`}
          >
            <Sparkles size={16} />
            <span>Wicketkeeping ({keeping.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("bags")}
            className={`collection-tab ${activeTab === "bags" ? "active" : ""}`}
          >
            <span>Tour &amp; Kit Bags ({bags.length})</span>
          </button>
        </div>

        {/* Product Grid */}
        <div className="product-grid four">
          {activeProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Category Bottom Bar */}
        <div className="collections-bottom-cta">
          <div className="bottom-cta-copy">
            <strong>Need specific weight, handle, or left-handed equipment?</strong>
            <p>We keep dedicated stock for left-handed batsmen and keepers in our Sialkot warehouse.</p>
          </div>
          <Link href={activeCategoryUrl} className="view-category-button">
            <span>Browse Full Category</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
