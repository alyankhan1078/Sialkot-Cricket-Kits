"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  Flame,
  Award,
  Download,
  MessageCircle,
  ShoppingBag,
  Video,
  Truck,
  ShieldCheck,
  ArrowUpDown,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import { ProductCard } from "@/src/components/ProductCard";
import { useStore } from "@/src/components/StoreProvider";
import { categories as defaultCategories, products as defaultProducts, type Product, BEST_SELLING_PRODUCT_IDS } from "@/src/data/products";
import { whatsappUrl } from "@/src/lib/whatsapp";

type SortOption = "featured" | "price-low" | "price-high" | "name";
type PriceFilter = "all" | "under-50" | "50-150" | "150-250" | "250-plus";

export function ShopClient() {
  const [productsList, setProductsList] = useState<Product[]>(defaultProducts);
  const [categoriesList, setCategoriesList] = useState<string[]>(defaultCategories.map((c) => c.name));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All equipment");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState<SortOption>("featured");
  const [isMobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { favourites } = useStore();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setProductsList(res.data);
        }
      })
      .catch(() => {});

    fetch("/api/categories")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setCategoriesList(res.data.map((c: { name: string }) => c.name));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const requestedCategory = params.get("category");
      if (requestedCategory) setCategory(requestedCategory);
      if (params.get("focus") === "search") searchRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.classList.add("drawer-open");
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileDrawerOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.classList.remove("drawer-open");
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.classList.remove("drawer-open");
    }
  }, [isMobileDrawerOpen]);

  // Category item counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "All equipment": productsList.length,
      "Best Sellers": productsList.filter((p) => p.isBestSeller || p.featured || BEST_SELLING_PRODUCT_IDS.includes(p.id)).length,
      "Featured": productsList.filter((p) => p.featured).length,
      "Sale": productsList.filter((p) => p.price < 50 || p.featured).length,
      "Grade 1+ English Willow": productsList.filter((p) => p.category === "Beauty Processed Bats" || p.category === "Bonafide Bats").length,
      "English Willow A+ Quality": productsList.filter((p) => p.category === "Beauty Processed Bats" || p.category === "Bonafide Bats").length,
    };
    categoriesList.forEach((cat) => {
      counts[cat] = productsList.filter((p) => p.category === cat).length;
    });
    return counts;
  }, [categoriesList, productsList]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = productsList.filter((product) => {
      const matchesQuery =
        !normalized ||
        `${product.name} ${product.category} ${product.description || ""}`.toLowerCase().includes(normalized);

      let matchesCategory = true;
      if (category === "Best Sellers") {
        matchesCategory = Boolean(product.isBestSeller || product.featured || BEST_SELLING_PRODUCT_IDS.includes(product.id));
      } else if (category === "Featured") {
        matchesCategory = Boolean(product.featured);
      } else if (category === "Sale") {
        matchesCategory = product.price < 50 || Boolean(product.featured);
      } else if (category === "Grade 1+ English Willow" || category === "English Willow A+ Quality") {
        matchesCategory = product.category === "Beauty Processed Bats" || product.category === "Bonafide Bats";
      } else if (category !== "All equipment") {
        matchesCategory = product.category === category;
      }

      let matchesPrice = true;
      if (priceFilter === "under-50") matchesPrice = product.price < 50;
      else if (priceFilter === "50-150") matchesPrice = product.price >= 50 && product.price <= 150;
      else if (priceFilter === "150-250") matchesPrice = product.price > 150 && product.price <= 250;
      else if (priceFilter === "250-plus") matchesPrice = product.price > 250;

      const matchesAvailability =
        availability === "all" ||
        (availability === "in-stock" && product.stock !== "Confirm on WhatsApp") ||
        (availability === "favourites" && favourites.includes(product.id));

      return matchesQuery && matchesCategory && matchesPrice && matchesAvailability;
    });

    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
  }, [availability, category, favourites, priceFilter, query, sort, productsList]);

  const resetAllFilters = () => {
    setQuery("");
    setCategory("All equipment");
    setPriceFilter("all");
    setAvailability("all");
    setSort("featured");
  };

  const hasActiveFilters = query !== "" || category !== "All equipment" || priceFilter !== "all" || availability !== "all";

  // Reusable Sidebar & Drawer Content — now with white/light theme
  const renderSidebarContent = (isDrawer = false) => (
    <>
      {/* Sidebar Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LayoutGrid size={17} color="var(--gold)" />
          <h2 style={{ fontSize: ".9rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--text-primary)", margin: 0 }}>
            Categories
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              style={{ background: "none", border: "none", color: "var(--orange)", fontSize: ".72rem", fontWeight: 700, cursor: "pointer", padding: 0 }}
            >
              Reset all
            </button>
          )}
          {isDrawer && (
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close filter drawer"
              style={{
                background: "var(--surface-subtle)", border: "1px solid var(--border)",
                color: "var(--text-primary)", width: 36, height: 36, minWidth: 36,
                borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 1. Featured Collections */}
      <div>
        <span style={{ display: "block", fontSize: ".68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--text-muted)", marginBottom: 8 }}>
          Featured collections
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {[
            { key: "All equipment", label: "All Equipment", icon: <ShoppingBag size={14} /> },
            { key: "Best Sellers", label: "Best Selling Articles", icon: <Flame size={14} color="#f59e0b" /> },
            { key: "Featured", label: "Featured Masterpieces", icon: <Sparkles size={14} color="var(--gold)" /> },
            { key: "Sale", label: "Clearance & Value Deals", icon: <Award size={14} color="#ef4444" /> },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setCategory(key);
                if (isDrawer) setMobileDrawerOpen(false);
                document.getElementById("catalogue-products")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`sidebar-cat-btn${category === key ? " active" : ""}`}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                {icon} {label}
              </span>
              <span className="sidebar-cat-count">{categoryCounts[key] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Article Categories */}
      <div>
        <span style={{ display: "block", fontSize: ".68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--text-muted)", marginBottom: 8 }}>
          Shop by category
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: isDrawer ? "none" : 340, overflowY: "auto" }}>
          {categoriesList.map((item) => {
            const count = categoryCounts[item] || 0;
            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setCategory(item);
                  if (isDrawer) setMobileDrawerOpen(false);
                  document.getElementById("catalogue-products")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`sidebar-cat-btn${category === item ? " active" : ""}`}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item}
                </span>
                <span className="sidebar-cat-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Price Filter */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        <span style={{ display: "block", fontSize: ".68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--text-muted)", marginBottom: 8 }}>
          Price range (£ GBP)
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { id: "all", label: "All prices" },
            { id: "under-50", label: "Under £50" },
            { id: "50-150", label: "£50 – £150" },
            { id: "150-250", label: "£150 – £250" },
            { id: "250-plus", label: "£250+" },
          ].map((p) => (
            <label
              key={p.id}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: ".82rem", color: priceFilter === p.id ? "var(--orange)" : "var(--text-secondary)",
                cursor: "pointer", padding: "5px 4px", minHeight: 36,
              }}
            >
              <input
                type="radio"
                name={isDrawer ? "priceFilterDrawer" : "priceFilter"}
                checked={priceFilter === p.id}
                onChange={() => {
                  setPriceFilter(p.id as PriceFilter);
                  if (isDrawer) setMobileDrawerOpen(false);
                  document.getElementById("catalogue-products")?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{ accentColor: "var(--gold)" }}
              />
              <span>{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 4. Availability Filter */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        <span style={{ display: "block", fontSize: ".68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--text-muted)", marginBottom: 8 }}>
          Availability
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { id: "all", label: "All listings" },
            { id: "in-stock", label: "Ready to ship" },
            { id: "favourites", label: `My favourites (${favourites.length})` },
          ].map((a) => (
            <label
              key={a.id}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: ".82rem", color: availability === a.id ? "var(--orange)" : "var(--text-secondary)",
                cursor: "pointer", padding: "5px 4px", minHeight: 36,
              }}
            >
              <input
                type="radio"
                name={isDrawer ? "availabilityFilterDrawer" : "availabilityFilter"}
                checked={availability === a.id}
                onChange={() => {
                  setAvailability(a.id);
                  if (isDrawer) setMobileDrawerOpen(false);
                  document.getElementById("catalogue-products")?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{ accentColor: "var(--gold)" }}
              />
              <span>{a.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 5. Support card */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        <div style={{ background: "var(--accent-light)", border: "1px solid rgba(242,169,40,.25)", borderRadius: 10, padding: 12 }}>
          <strong style={{ color: "#7a4f00", fontSize: ".82rem", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Award size={14} /> Factory direct guarantee
          </strong>
          <p style={{ fontSize: ".74rem", color: "var(--text-secondary)", margin: "0 0 10px", lineHeight: 1.4 }}>
            Every bat includes a live ping video via WhatsApp before dispatch.
          </p>
          <a
            href={whatsappUrl("Hello Sialkot Cricket Kits, I am viewing your shop and would like help choosing equipment.")}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "8px 10px", minHeight: 42, background: "#168b52",
              border: "none", borderRadius: 6, color: "#fff",
              fontSize: ".75rem", fontWeight: 700, textDecoration: "none",
            }}
          >
            <MessageCircle size={13} /> Chat on WhatsApp
          </a>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Shop Hero — compact, premium, light */}
      <section
        style={{
          position: "relative",
          background: "linear-gradient(90deg, rgba(8,9,12,0.97) 0%, rgba(8,9,12,0.87) 50%, rgba(8,9,12,0.5) 100%), url('/images/shop-catalogue-cover.jpg') center/cover no-repeat",
          borderBottom: "1px solid rgba(255,255,255,.06)",
          padding: "3.5rem clamp(1.2rem, 6vw, 6rem)",
          width: "100%", boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: 820 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(242,169,40,.14)", border: "1px solid rgba(242,169,40,.35)", padding: "5px 12px", borderRadius: 999, marginBottom: 14 }}>
            <Sparkles size={13} color="#f2a928" />
            <span style={{ color: "#f2a928", fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>
              Official 2026 Factory Catalogue
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(1.7rem, 3.5vw, 3rem)", fontWeight: 800, margin: "0 0 10px", color: "#ffffff", letterSpacing: "-.03em", lineHeight: 1.15, textTransform: "uppercase" }}>
            Shop Cricket Equipment.
          </h1>
          <p style={{ color: "#cbd5e1", fontSize: ".95rem", lineHeight: 1.6, margin: "0 0 16px", maxWidth: 600 }}>
            100+ championship match-grade articles handcrafted in Sialkot. Express tracked courier to UK, USA, Australia, New Zealand, Europe &amp; Pakistan.
          </p>
          {/* Compact filter badges — on desktop hero */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} className="shop-hero-badges">
            {[
              { label: "Grade 1+ English Willow", cat: "Grade 1+ English Willow", icon: <Award size={14} color="#f2a928" /> },
              { label: "Tracked Express Courier", cat: null, icon: <Truck size={14} color="#60a5fa" /> },
              { label: "Live Video Ping Demo", cat: "Bonafide Bats", icon: <Video size={14} color="#4ade80" /> },
              { label: "Flexible Deposit", cat: null, icon: <ShieldCheck size={14} color="#f2a928" /> },
            ].map(({ label, cat, icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (cat) { setCategory(cat); setQuery(""); }
                  document.getElementById("catalogue-products")?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  minHeight: 40, background: "rgba(255,255,255,.07)",
                  border: "1px solid rgba(255,255,255,.15)",
                  backdropFilter: "blur(8px)", padding: "7px 13px",
                  borderRadius: 8, fontSize: ".78rem", color: "#ffffff",
                  cursor: "pointer", transition: "all .2s ease", fontWeight: 600,
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Catalogue Container */}
      <div id="catalogue-products" style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 16px 60px", width: "100%", boxSizing: "border-box" }}>

        {/* Mobile Categories Drawer */}
        {isMobileDrawerOpen && (
          <div
            className="shop-mobile-drawer-layer"
            role="dialog"
            aria-modal="true"
            aria-label="Categories and filters"
            id="mobile-catalogue-drawer"
          >
            <button
              type="button"
              className="shop-mobile-drawer-backdrop"
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close categories"
            />
            <div className="shop-mobile-drawer-content" role="document">
              {renderSidebarContent(true)}
            </div>
          </div>
        )}

        <div className="shop-layout-container">

          {/* LEFT SIDEBAR (Desktop only) */}
          <aside className="shop-sidebar-desktop" aria-label="Categories and filters">
            {renderSidebarContent(false)}
          </aside>

          {/* MAIN CATALOGUE AREA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", minWidth: 0 }}>

            {/* Mobile — Categories button + Reset (only on mobile) */}
            <div className="mobile-catalogue-bar">
              <button
                type="button"
                className="mobile-cat-trigger"
                onClick={() => setMobileDrawerOpen(true)}
                aria-expanded={isMobileDrawerOpen}
                aria-controls="mobile-catalogue-drawer"
                aria-label="Open categories and filters"
                style={{ flex: 1, justifyContent: "center" }}
              >
                <LayoutGrid size={16} className="mobile-cat-trigger-icon" style={{ color: "var(--gold)" }} />
                <span>
                  {category !== "All equipment" ? `Showing: ${category}` : "☷ Categories"}
                </span>
                <ChevronRight size={14} style={{ marginLeft: "auto", opacity: .5 }} />
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  style={{
                    padding: "10px 12px", minHeight: 44,
                    background: "var(--surface)", border: "1px solid var(--border-strong)",
                    borderRadius: 8, color: "var(--text-secondary)",
                    fontSize: ".78rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Search & Sort bar */}
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "12px 14px",
              display: "flex", flexWrap: "wrap", gap: 10,
              justifyContent: "space-between", alignItems: "center",
              width: "100%", boxSizing: "border-box",
              boxShadow: "var(--shadow-sm)",
            }}>
              {/* Search */}
              <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
                <Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search bats, gloves, pads, bags…"
                  style={{
                    width: "100%", padding: "9px 32px",
                    borderRadius: 7, background: "var(--surface-alt)",
                    border: "1px solid var(--border-strong)",
                    color: "var(--text-primary)", fontSize: ".86rem",
                    boxSizing: "border-box",
                  }}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 3 }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <ArrowUpDown size={14} color="var(--gold)" />
                <span style={{ fontSize: ".78rem", color: "var(--text-muted)", fontWeight: 600 }}>Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  style={{
                    padding: "8px 10px", borderRadius: 7,
                    background: "var(--surface-alt)", border: "1px solid var(--border-strong)",
                    color: "var(--text-primary)", fontSize: ".82rem",
                    fontWeight: 600, cursor: "pointer",
                  }}
                >
                  <option value="featured">Featured first</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Alphabetical (A–Z)</option>
                </select>
              </div>
            </div>

            {/* Active category / filter status */}
            {hasActiveFilters && (
              <div className="active-category-bar">
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {category !== "All equipment" && (
                    <span style={{ fontWeight: 700 }}>
                      Showing: {category}
                    </span>
                  )}
                  {query && (
                    <span style={{ fontSize: ".78rem", color: "var(--text-secondary)" }}>
                      Search: &ldquo;{query}&rdquo;
                    </span>
                  )}
                  {priceFilter !== "all" && (
                    <span style={{ fontSize: ".78rem", color: "var(--text-secondary)" }}>
                      Price: {priceFilter}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: ".76rem", color: "var(--text-muted)" }}>
                    {filtered.length} {filtered.length === 1 ? "result" : "results"}
                  </span>
                  <button onClick={resetAllFilters} aria-label="Clear all filters">
                    Clear all
                  </button>
                </div>
              </div>
            )}

            {/* Results count when no active filter */}
            {!hasActiveFilters && (
              <div style={{ fontSize: ".82rem", color: "var(--text-muted)", padding: "0 2px" }}>
                <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> articles available
              </div>
            )}

            {/* Product Grid */}
            {filtered.length > 0 ? (
              <div className="shop-products-grid">
                {filtered.map((product) => (
                  <ProductCard product={product} key={product.id} />
                ))}
              </div>
            ) : (
              <div style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "48px 24px", textAlign: "center",
              }}>
                <ShoppingBag size={40} style={{ color: "var(--gold)", marginBottom: 12 }} />
                <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: 6 }}>No products found</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: ".88rem", maxWidth: 400, margin: "0 auto 16px" }}>
                  Try adjusting your search or category selection.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="button primary compact"
                >
                  View all equipment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
