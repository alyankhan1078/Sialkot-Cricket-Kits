"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Menu,
  X,
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  Sparkles,
  ChevronRight,
  Shield,
  Layers,
  ShoppingBag,
  Flame,
} from "lucide-react";
import { ProductCard } from "@/src/components/ProductCard";
import { type Product, type Category, categoryOrder } from "@/src/data/products";

interface HomeProductsDirectProps {
  initialProducts: Product[];
  initialCategories?: Array<{ id: string; name: string }>;
}

export function HomeProductsDirect({
  initialProducts,
  initialCategories,
}: HomeProductsDirectProps) {
  const [products] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Equipment");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "name">("featured");
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(18);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "All Equipment": products.length,
    };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Available category list
  const categoriesList = useMemo(() => {
    const names = ["All Equipment", ...categoryOrder];
    return names;
  }, []);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory !== "All Equipment") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    const sorted = [...result];
    if (sortBy === "price-low") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "featured") {
      sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return sorted;
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleCount(18);
  }, [selectedCategory, searchQuery, sortBy]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsDrawerOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isDrawerOpen]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <section className="home-direct-products-section" id="products">
      <div className="home-direct-container">
        {/* TOP CONTROL BAR */}
        <div className="home-products-toolbar">
          {/* Left: 3-icon button (Hamburger / Menu) to view catalogue categories */}
          <div className="toolbar-left">
            <button
              type="button"
              className="catalogue-trigger-btn"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open equipment catalogue categories"
            >
              <div className="three-lines-icon" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <span className="trigger-label">Catalogue Categories</span>
              <span className="trigger-badge">
                {selectedCategory === "All Equipment"
                  ? `${products.length} Items`
                  : `${categoryCounts[selectedCategory] || 0} Items`}
              </span>
            </button>

            {/* Active category pill */}
            {selectedCategory !== "All Equipment" && (
              <div className="active-cat-pill">
                <span>{selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("All Equipment")}
                  aria-label="Clear category filter"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Right: Search + Sort */}
          <div className="toolbar-right">
            <div className="search-input-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search bats, pads, gloves..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="search-clear-btn"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="sort-select-wrap">
              <ArrowUpDown size={15} className="sort-icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="sort-select"
                aria-label="Sort products"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* QUICK CATEGORY HORIZONTAL BAR (Desktop & Mobile quick access) */}
        <div className="quick-categories-scroll">
          {categoriesList.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`quick-cat-btn ${active ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
                <span className="cat-pill-count">{categoryCounts[cat] || 0}</span>
              </button>
            );
          })}
          <button
            type="button"
            className="quick-cat-btn more-btn"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open full category list"
          >
            <span>+ More</span>
          </button>
        </div>

        {/* RESULTS SUMMARY BAR */}
        <div className="products-summary-line">
          <span>
            Showing <strong>{displayedProducts.length}</strong> of{" "}
            <strong>{filteredProducts.length}</strong> cricket products in{" "}
            <strong className="active-cat-name">{selectedCategory}</strong>
          </span>
        </div>

        {/* PARALLEL 3-COLUMN PRODUCT GRID */}
        {displayedProducts.length > 0 ? (
          <div className="direct-products-grid three-col">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="no-products-state">
            <ShoppingBag size={48} className="no-products-icon" />
            <h3>No products found</h3>
            <p>
              We couldn&apos;t find any items matching &quot;{searchQuery}&quot; in{" "}
              {selectedCategory}.
            </p>
            <button
              type="button"
              className="reset-filters-btn"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Equipment");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* LOAD MORE BUTTON */}
        {visibleCount < filteredProducts.length && (
          <div className="load-more-wrap">
            <button
              type="button"
              className="load-more-btn"
              onClick={() => setVisibleCount((prev) => prev + 18)}
            >
              Load More Products ({filteredProducts.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>

      {/* SLIDE-OUT CATEGORIES DRAWER (When 3-icon button is clicked) */}
      {isDrawerOpen && (
        <div className="catalogue-drawer-layer" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="catalogue-drawer-backdrop"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="catalogue-drawer-panel">
            <div className="catalogue-drawer-header">
              <div className="header-title-group">
                <div className="three-lines-icon small" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <h3>Equipment Catalogue</h3>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close categories drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="catalogue-drawer-subtitle">
              Select a category to instantly browse products:
            </div>

            {/* Categories List */}
            <div className="catalogue-drawer-list">
              {categoriesList.map((catName) => {
                const count = categoryCounts[catName] || 0;
                const isSelected = selectedCategory === catName;

                return (
                  <button
                    key={catName}
                    type="button"
                    className={`category-item-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedCategory(catName);
                      setIsDrawerOpen(false); // Closes on selection as requested!
                    }}
                  >
                    <div className="cat-item-left">
                      <span className="cat-bullet" />
                      <span className="cat-name">{catName}</span>
                    </div>
                    <div className="cat-item-right">
                      <span className="cat-count-badge">{count}</span>
                      <ChevronRight size={16} className="cat-arrow" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="catalogue-drawer-footer">
              <button
                type="button"
                className="drawer-all-btn"
                onClick={() => {
                  setSelectedCategory("All Equipment");
                  setIsDrawerOpen(false);
                }}
              >
                View All {products.length} Products
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
