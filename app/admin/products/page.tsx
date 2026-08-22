"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Star } from "lucide-react";
import { formatPrice } from "@/src/data/products";
import type { DBProduct } from "@/src/lib/data-service";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
        const uniqueCats = Array.from(new Set(json.data.map((p: DBProduct) => p.category))) as string[];
        setCategories(uniqueCats);
      }
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleFeatured = async (product: DBProduct) => {
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !product.featured }),
      });
      fetchProducts();
    } catch {
      alert("Failed to update product");
    }
  };

  const handleToggleActive = async (product: DBProduct) => {
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      });
      fetchProducts();
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch {
      alert("Failed to delete product");
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Product Management</h1>
          <p>Add, edit, toggle visibility, and update pricing and stock for your catalogue items.</p>
        </div>
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
          <Plus size={16} />
          <span>Add New Product</span>
        </Link>
      </div>

      <div className="admin-card" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "250px" }}>
          <Search
            size={18}
            style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--adm-muted)" }}
          />
          <input
            className="admin-input"
            style={{ paddingLeft: "2.75rem" }}
            placeholder="Search products by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="admin-select"
          style={{ width: "auto", minWidth: "200px" }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories ({products.length})</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "2rem", color: "var(--adm-muted)", textAlign: "center" }}>Loading products...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "3rem", color: "var(--adm-muted)", textAlign: "center" }}>
            No products match your criteria.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Image</th>
                  <th>Name & Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img
                        src={product.image}
                        alt=""
                        style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "6px", background: "#000" }}
                      />
                    </td>
                    <td>
                      <strong style={{ color: "#fff", display: "block" }}>{product.name}</strong>
                      <span style={{ fontSize: "0.8rem", color: "var(--adm-muted)" }}>{product.category}</span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--adm-primary)" }}>{formatPrice(product.price)}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                        {product.stock}
                        {product.rightStock && (
                          <small style={{ display: "block", color: "#64748b" }}>
                            R: {product.rightStock} | L: {product.leftStock}
                          </small>
                        )}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: product.featured ? "#fbbf24" : "#475569",
                        }}
                        title={product.featured ? "Featured on homepage" : "Not featured"}
                      >
                        <Star size={18} fill={product.featured ? "currentColor" : "none"} />
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`admin-badge ${product.active ? "admin-badge-active" : "admin-badge-inactive"}`}
                        style={{ border: "none", cursor: "pointer" }}
                      >
                        {product.active ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: "0.4rem 0.6rem" }}
                          title="Edit product"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="admin-btn admin-btn-danger"
                          style={{ padding: "0.4rem 0.6rem" }}
                          title="Delete product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
