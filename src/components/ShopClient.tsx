"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  Flame,
  Shield,
  Award,
  Download,
  MessageCircle,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Tag,
  ShoppingBag,
  Video,
  Truck,
  ShieldCheck,
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

  // Reusable Sidebar & Drawer Content
  const renderSidebarContent = (isDrawer = false) => (
    <>
      {/* Sidebar Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SlidersHorizontal size={18} color="#f2a928" />
          <h2 style={{ fontSize: "0.95rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#ffffff", margin: 0 }}>
            Shop Catalogue
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              style={{ background: "none", border: "none", color: "#f2a928", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", padding: 0 }}
            >
              Reset All
            </button>
          )}
          {isDrawer && (
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close Filter Drawer"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "none",
                color: "#ffffff",
                width: 36,
                height: 36,
                minWidth: 36,
                minHeight: 36,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 1. Featured Collections */}
      <div>
        <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: 8 }}>
          Featured Collections
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <button
            type="button"
            onClick={() => {
              setCategory("All equipment");
              if (isDrawer) setMobileDrawerOpen(false);
              document.getElementById("catalogue-products")?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "9px 12px",
              minHeight: 44,
              borderRadius: 8,
              background: category === "All equipment" ? "rgba(242, 169, 40, 0.16)" : "transparent",
              border: category === "All equipment" ? "1px solid rgba(242, 169, 40, 0.4)" : "1px solid transparent",
              color: category === "All equipment" ? "#f2a928" : "#cbd5e1",
              fontWeight: category === "All equipment" ? 700 : 500,
              fontSize: "0.85rem",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShoppingBag size={15} /> All Equipment
            </span>
            <span style={{ fontSize: "0.72rem", background: "rgba(255, 255, 255, 0.08)", padding: "2px 6px", borderRadius: 4, color: "#94a3b8" }}>
              {categoryCounts["All equipment"] || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategory("Best Sellers");
              if (isDrawer) setMobileDrawerOpen(false);
              document.getElementById("catalogue-products")?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "9px 12px",
              minHeight: 44,
              borderRadius: 8,
              background: category === "Best Sellers" ? "linear-gradient(135deg, rgba(225, 29, 72, 0.22) 0%, rgba(245, 158, 11, 0.2) 100%)" : "transparent",
              border: category === "Best Sellers" ? "1px solid rgba(245, 158, 11, 0.6)" : "1px solid transparent",
              color: category === "Best Sellers" ? "#f59e0b" : "#cbd5e1",
              fontWeight: category === "Best Sellers" ? 700 : 500,
              fontSize: "0.85rem",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Flame size={15} color="#f59e0b" /> Best Selling Articles
            </span>
            <span style={{ fontSize: "0.72rem", background: "rgba(245, 158, 11, 0.18)", padding: "2px 6px", borderRadius: 4, color: "#f59e0b", fontWeight: 700 }}>
              {categoryCounts["Best Sellers"] || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategory("Featured");
              if (isDrawer) setMobileDrawerOpen(false);
              document.getElementById("catalogue-products")?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "9px 12px",
              minHeight: 44,
              borderRadius: 8,
              background: category === "Featured" ? "rgba(242, 169, 40, 0.16)" : "transparent",
              border: category === "Featured" ? "1px solid rgba(242, 169, 40, 0.4)" : "1px solid transparent",
              color: category === "Featured" ? "#f2a928" : "#cbd5e1",
              fontWeight: category === "Featured" ? 700 : 500,
              fontSize: "0.85rem",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={15} color="#f2a928" /> Featured Masterpieces
            </span>
            <span style={{ fontSize: "0.72rem", background: "rgba(255, 255, 255, 0.08)", padding: "2px 6px", borderRadius: 4, color: "#94a3b8" }}>
              {categoryCounts["Featured"] || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategory("Sale");
              if (isDrawer) setMobileDrawerOpen(false);
              document.getElementById("catalogue-products")?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "9px 12px",
              minHeight: 44,
              borderRadius: 8,
              background: category === "Sale" ? "rgba(239, 68, 68, 0.16)" : "transparent",
              border: category === "Sale" ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid transparent",
              color: category === "Sale" ? "#f87171" : "#cbd5e1",
              fontWeight: category === "Sale" ? 700 : 500,
              fontSize: "0.85rem",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Flame size={15} color="#ef4444" /> Clearance &amp; Value Deals
            </span>
            <span style={{ fontSize: "0.72rem", background: "rgba(255, 255, 255, 0.08)", padding: "2px 6px", borderRadius: 4, color: "#94a3b8" }}>
              {categoryCounts["Sale"] || 0}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Article Categories */}
      <div>
        <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: 8 }}>
          Articles By Category
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: isDrawer ? "none" : 320, overflowY: "auto", paddingRight: 4 }}>
          {categoriesList.map((item) => {
            const isSelected = category === item;
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
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 10px",
                  minHeight: 44,
                  borderRadius: 6,
                  background: isSelected ? "rgba(242, 169, 40, 0.14)" : "transparent",
                  border: isSelected ? "1px solid rgba(242, 169, 40, 0.35)" : "1px solid transparent",
                  color: isSelected ? "#f2a928" : "#cbd5e1",
                  fontWeight: isSelected ? 700 : 400,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item}
                </span>
                <span style={{ fontSize: "0.7rem", background: "rgba(255, 255, 255, 0.06)", padding: "1px 5px", borderRadius: 4, color: "#94a3b8", marginLeft: 6 }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Price Filter */}
      <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: 16 }}>
        <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: 8 }}>
          Price Range (£ GBP)
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { id: "all", label: "All Prices" },
            { id: "under-50", label: "Under £50 (Accessories & Grips)" },
            { id: "50-150", label: "£50 – £150 (Club Bats & Gear)" },
            { id: "150-250", label: "£150 – £250 (Pro Reserve Bats)" },
            { id: "250-plus", label: "£250+ (Player Edition Grade 1+)" },
          ].map((p) => (
            <label
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.8rem",
                color: priceFilter === p.id ? "#f2a928" : "#cbd5e1",
                cursor: "pointer",
                padding: "6px 0",
                minHeight: 36,
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
                style={{ accentColor: "#f2a928" }}
              />
              <span>{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 4. Availability Filter */}
      <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: 16 }}>
        <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: 8 }}>
          Availability
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { id: "all", label: "All Listings" },
            { id: "in-stock", label: "Ready to Ship (In Stock)" },
            { id: "favourites", label: `My Favourites (${favourites.length})` },
          ].map((a) => (
            <label
              key={a.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.8rem",
                color: availability === a.id ? "#f2a928" : "#cbd5e1",
                cursor: "pointer",
                padding: "6px 0",
                minHeight: 36,
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
                style={{ accentColor: "#f2a928" }}
              />
              <span>{a.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 5. Factory Direct Guarantee Sidebar Card */}
      <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: 16 }}>
        <div style={{ background: "rgba(242, 169, 40, 0.08)", border: "1px solid rgba(242, 169, 40, 0.25)", borderRadius: 10, padding: 12 }}>
          <strong style={{ color: "#f2a928", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Award size={15} /> Factory Direct Guarantee
          </strong>
          <p style={{ fontSize: "0.74rem", color: "#cbd5e1", margin: "0 0 10px", lineHeight: 1.4 }}>
            Every bat comes with a personalized live ping video demo sent via WhatsApp before courier dispatch.
          </p>
          <a
            href="/catalogue/Sialkot-Cricket-Kits-Catalogue-2026.pdf"
            target="_blank"
            download
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "8px 10px",
              minHeight: 44,
              background: "#181f2b",
              border: "1px solid #2d3748",
              borderRadius: 6,
              color: "#ffffff",
              fontSize: "0.75rem",
              fontWeight: 600,
              textDecoration: "none",
              marginBottom: 6,
            }}
          >
            <Download size={13} color="#f2a928" /> Download 2026 PDF
          </a>
          <a
            href={whatsappUrl("Hello Sialkot Cricket Kits, I am viewing your shop catalogue and would like to ask about a custom bat.")}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "8px 10px",
              minHeight: 44,
              background: "rgba(34, 197, 94, 0.18)",
              border: "1px solid rgba(34, 197, 94, 0.35)",
              borderRadius: 6,
              color: "#4ade80",
              fontSize: "0.75rem",
              fontWeight: 600,
              textDecoration: "none",
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
      {/* 🌟 Executive Hero Cover Showcase with Interactive Filter Badges */}
      <section
        style={{
          position: "relative",
          minHeight: "400px",
          background: "linear-gradient(90deg, rgba(12,16,23,0.96) 0%, rgba(12,16,23,0.85) 45%, rgba(12,16,23,0.4) 100%), url('/images/shop-catalogue-cover.jpg') center/cover no-repeat",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          padding: "46px 20px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", zIndex: 2 }}>
          <div style={{ maxWidth: 760 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(242, 169, 40, 0.15)", border: "1px solid rgba(242, 169, 40, 0.4)", padding: "6px 14px", borderRadius: 999, marginBottom: 14 }}>
              <Sparkles size={15} color="#f2a928" />
              <span style={{ color: "#f2a928", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Official 2026 Factory Catalogue
              </span>
            </div>

            <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)", fontWeight: 800, margin: "0 0 12px", color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1.15, textTransform: "uppercase" }}>
              Shop Cricket Equipment.
            </h1>

            <p style={{ color: "#cbd5e1", fontSize: "1rem", lineHeight: 1.6, margin: "0 0 20px", maxWidth: 640 }}>
              Search 100+ championship match-grade articles handcrafted directly in Sialkot, Pakistan. Direct express tracked courier dispatch to UK, USA, Australia, New Zealand, Europe &amp; Pakistan.
            </p>

            {/* 4 Interactive Feature Badges (Clickable filters) */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setCategory("Grade 1+ English Willow");
                  setQuery("");
                  document.getElementById("catalogue-products")?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 44,
                  background:
                    category === "Grade 1+ English Willow" ||
                    category === "English Willow A+ Quality" ||
                    category === "Beauty Processed Bats" ||
                    category === "Bonafide Bats"
                      ? "rgba(242, 169, 40, 0.25)"
                      : "rgba(255, 255, 255, 0.06)",
                  border:
                    category === "Grade 1+ English Willow" ||
                    category === "English Willow A+ Quality" ||
                    category === "Beauty Processed Bats" ||
                    category === "Bonafide Bats"
                      ? "1.5px solid #f2a928"
                      : "1px solid rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(8px)",
                  padding: "9px 14px",
                  borderRadius: 10,
                  fontSize: "0.82rem",
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <Award size={16} color="#f2a928" />
                <span style={{ fontWeight: 600 }}>Grade 1+ English Willow</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory("Bonafide Bats");
                  setQuery("");
                  document.getElementById("catalogue-products")?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 44,
                  background: category === "Bonafide Bats" ? "rgba(74, 222, 128, 0.22)" : "rgba(255, 255, 255, 0.06)",
                  border: category === "Bonafide Bats" ? "1.5px solid #4ade80" : "1px solid rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(8px)",
                  padding: "9px 14px",
                  borderRadius: 10,
                  fontSize: "0.82rem",
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <Video size={16} color="#4ade80" />
                <span style={{ fontWeight: 600 }}>Live Video Ping Demo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  document.getElementById("catalogue-products")?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 44,
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(8px)",
                  padding: "9px 14px",
                  borderRadius: 10,
                  fontSize: "0.82rem",
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <Truck size={16} color="#60a5fa" />
                <span style={{ fontWeight: 600 }}>Tracked Express Courier</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  document.getElementById("catalogue-products")?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 44,
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(8px)",
                  padding: "9px 14px",
                  borderRadius: 10,
                  fontSize: "0.82rem",
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <ShieldCheck size={16} color="#f2a928" />
                <span style={{ fontWeight: 600 }}>Flexible 35% / 50% Deposit</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 🛍️ Main Catalogue Container */}
      <div id="catalogue-products" style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 16px 60px", width: "100%", boxSizing: "border-box" }}>
        
        {/* Mobile Left Drawer Modal */}
        {isMobileDrawerOpen && (
          <div
            className="shop-mobile-drawer-layer"
            role="dialog"
            aria-modal="true"
            aria-label="Shop Catalogue Drawer"
            id="mobile-catalogue-drawer"
          >
            <button
              type="button"
              className="shop-mobile-drawer-backdrop"
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close Filter Drawer"
            />
            <div className="shop-mobile-drawer-content" role="document">
              {renderSidebarContent(true)}
            </div>
          </div>
        )}

        <div className="shop-layout-container">
          
          {/* 🏛️ LEFT SIDEBAR (Desktop Permanent Sticky) */}
          <aside className="shop-sidebar-desktop" aria-label="Desktop Catalogue Navigation">
            {renderSidebarContent(false)}
          </aside>

          {/* 🛍️ MAIN CATALOGUE AREA (Products appear FIRST on mobile!) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", minWidth: 0 }}>
            
            {/* Mobile Filter & Catalogue Bar (Visible only on mobile / tablet) */}
            <div className="mobile-catalogue-bar">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                aria-expanded={isMobileDrawerOpen}
                aria-controls="mobile-catalogue-drawer"
                aria-label="Open Catalogue and Filter Navigation"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  minHeight: 44,
                  background: hasActiveFilters ? "rgba(242, 169, 40, 0.18)" : "#141922",
                  border: hasActiveFilters ? "1.5px solid #f2a928" : "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: 8,
                  color: hasActiveFilters ? "#f2a928" : "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <SlidersHorizontal size={16} />
                <span>☰ Filter &amp; Categories {category !== "All equipment" ? `(${category})` : `(${filtered.length})`}</span>
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  style={{
                    padding: "10px 14px",
                    minHeight: 44,
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: 8,
                    color: "#94a3b8",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Top Search & Sort Filter Bar */}
            <div style={{ background: "#141922", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 14, padding: "14px 16px", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center", width: "100%", boxSizing: "border-box" }}>
              
              {/* Search Input Box */}
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                <Search size={17} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search bats, gloves, pads, bags, helmets..."
                  style={{
                    width: "100%",
                    padding: "10px 36px",
                    borderRadius: 8,
                    background: "#181f2b",
                    border: "1px solid #2d3748",
                    color: "#fff",
                    fontSize: "0.88rem",
                    boxSizing: "border-box",
                  }}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4 }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ArrowUpDown size={15} color="#f2a928" />
                <span style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 600 }}>Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  style={{
                    padding: "9px 12px",
                    borderRadius: 8,
                    background: "#181f2b",
                    border: "1px solid #2d3748",
                    color: "#fff",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Alphabetical (A–Z)</option>
                </select>
              </div>

            </div>

            {/* Active Filters Bar & Count */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "0 4px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.88rem", color: "#cbd5e1", fontWeight: 600 }}>
                  <strong style={{ color: "#f2a928" }}>{filtered.length}</strong> {filtered.length === 1 ? "article" : "articles"} found
                </span>

                {/* Active Category Chip */}
                {category !== "All equipment" && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(242, 169, 40, 0.15)", border: "1px solid rgba(242, 169, 40, 0.35)", padding: "3px 10px", borderRadius: 999, fontSize: "0.78rem", color: "#f2a928" }}>
                    <span>{category}</span>
                    <button type="button" onClick={() => setCategory("All equipment")} style={{ background: "none", border: "none", color: "#f2a928", cursor: "pointer", padding: 0 }}>
                      <X size={13} />
                    </button>
                  </span>
                )}

                {/* Active Price Chip */}
                {priceFilter !== "all" && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(242, 169, 40, 0.15)", border: "1px solid rgba(242, 169, 40, 0.35)", padding: "3px 10px", borderRadius: 999, fontSize: "0.78rem", color: "#f2a928" }}>
                    <span>Price: {priceFilter}</span>
                    <button type="button" onClick={() => setPriceFilter("all")} style={{ background: "none", border: "none", color: "#f2a928", cursor: "pointer", padding: 0 }}>
                      <X size={13} />
                    </button>
                  </span>
                )}

                {/* Active Search Query Chip */}
                {query && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(242, 169, 40, 0.15)", border: "1px solid rgba(242, 169, 40, 0.35)", padding: "3px 10px", borderRadius: 999, fontSize: "0.78rem", color: "#f2a928" }}>
                    <span>Query: &ldquo;{query}&rdquo;</span>
                    <button type="button" onClick={() => setQuery("")} style={{ background: "none", border: "none", color: "#f2a928", cursor: "pointer", padding: 0 }}>
                      <X size={13} />
                    </button>
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "0.78rem", cursor: "pointer", textDecoration: "underline" }}
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Product Cards Grid */}
            {filtered.length > 0 ? (
              <div className="shop-products-grid">
                {filtered.map((product) => (
                  <ProductCard product={product} key={product.id} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  background: "#141922",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 16,
                  padding: "48px 24px",
                  textAlign: "center",
                }}
              >
                <ShoppingBag size={48} style={{ color: "#f2a928", marginBottom: 12 }} />
                <h3 style={{ fontSize: "1.3rem", color: "#ffffff", marginBottom: 6 }}>No Matching Products Found</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", maxWidth: 400, margin: "0 auto 16px" }}>
                  We could not find any equipment matching your active filters. Try adjusting your search or category selection.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="button primary"
                  style={{
                    padding: "10px 18px",
                    background: "linear-gradient(135deg, #f2a928 0%, #d97706 100%)",
                    color: "#000",
                    fontWeight: 700,
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  View Full Catalogue
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </>
  );
}
