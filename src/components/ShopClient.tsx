"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/src/components/ProductCard";
import { useStore } from "@/src/components/StoreProvider";
import { categories as defaultCategories, products as defaultProducts, type Product } from "@/src/data/products";

type SortOption = "featured" | "price-low" | "price-high" | "name";

export function ShopClient() {
  const [productsList, setProductsList] = useState<Product[]>(defaultProducts);
  const [categoriesList, setCategoriesList] = useState<string[]>(defaultCategories.map((c) => c.name));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All equipment");
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState<SortOption>("featured");
  const { favourites } = useStore();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Dynamic fetch from API
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

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = productsList.filter((product) => {
      const matchesQuery =
        !normalized ||
        `${product.name} ${product.category} ${product.description || ""}`.toLowerCase().includes(normalized);
      const matchesCategory = category === "All equipment" || product.category === category;
      const matchesAvailability =
        availability === "all" ||
        (availability === "in-stock" && product.stock !== "Confirm on WhatsApp") ||
        (availability === "favourites" && favourites.includes(product.id));
      return matchesQuery && matchesCategory && matchesAvailability;
    });

    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
  }, [availability, category, favourites, query, sort, productsList]);

  return (
    <>
      <section className="shop-controls" aria-label="Product filters">
        <label className="search-field">
          <Search size={19} />
          <span className="sr-only">Search products</span>
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search bats, gloves, pads, bags..."
          />
        </label>
        <label>
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>All equipment</option>
            {categoriesList.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Availability</span>
          <select value={availability} onChange={(event) => setAvailability(event.target.value)}>
            <option value="all">All listings</option>
            <option value="in-stock">Confirmed stock</option>
            <option value="favourites">My favourites</option>
          </select>
        </label>
        <label>
          <span>Sort by</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="name">Product name</option>
          </select>
        </label>
      </section>
      <div className="shop-results-head">
        <p>
          <strong>{filtered.length}</strong> products found
        </p>
        <span>
          <SlidersHorizontal size={16} /> Live catalogue pricing and stock
        </span>
      </div>
      {filtered.length > 0 ? (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      ) : (
        <div className="empty-results">
          <h2>No matching products</h2>
          <p>Try a different search or category.</p>
        </div>
      )}
    </>
  );
}
