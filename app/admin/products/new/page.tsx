"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { categoryOrder } from "@/src/data/products";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([...categoryOrder]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: categories[0] || "Beauty Processed Bats",
    price: "",
    stock: "Available",
    rightStock: "",
    leftStock: "",
    image: "/assets/products/bat-collection.webp",
    galleryInput: "",
    description: "",
    featured: false,
    active: true,
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.length > 0) {
          setCategories(res.data.map((c: { name: string }) => c.name));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const gallery = formData.galleryInput
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const payload = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        stock: formData.stock,
        rightStock: formData.rightStock || undefined,
        leftStock: formData.leftStock || undefined,
        image: formData.image,
        images: gallery.length > 0 ? gallery : undefined,
        description: formData.description,
        featured: formData.featured,
        active: formData.active,
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin/products");
      } else {
        setError(data.error || "Failed to create product");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/admin/products"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--adm-muted)", textDecoration: "none", fontSize: "0.875rem" }}
        >
          <ArrowLeft size={16} /> Back to products
        </Link>
      </div>

      <div className="admin-header">
        <div>
          <h1>Add New Product</h1>
          <p>Create a new catalogue item with specifications and images.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-card">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          <div className="admin-form-group" style={{ gridColumn: "span 2" }}>
            <label>Product Name *</label>
            <input
              className="admin-input"
              required
              placeholder="e.g. Apex Pro Limited Edition Bat"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label>Category *</label>
            <select
              className="admin-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label>Price (PKR) *</label>
            <input
              type="number"
              className="admin-input"
              required
              min="0"
              placeholder="e.g. 65499"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label>Stock Status / Quantity</label>
            <input
              className="admin-input"
              placeholder="e.g. 10 or 'Available' or 'Confirm on WhatsApp'"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            />
          </div>

          <div className="admin-form-group" style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ flex: 1 }}>
              <label>Right-Hand Stock (optional)</label>
              <input
                className="admin-input"
                placeholder="e.g. 6"
                value={formData.rightStock}
                onChange={(e) => setFormData({ ...formData, rightStock: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Left-Hand Stock (optional)</label>
              <input
                className="admin-input"
                placeholder="e.g. 2"
                value={formData.leftStock}
                onChange={(e) => setFormData({ ...formData, leftStock: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-group" style={{ gridColumn: "span 2" }}>
            <label>Primary Image URL or Asset Path *</label>
            <input
              className="admin-input"
              required
              placeholder="/assets/products/item-001.webp or external image URL"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
          </div>

          <div className="admin-form-group" style={{ gridColumn: "span 2" }}>
            <label>Additional Gallery Image Paths (One per line)</label>
            <textarea
              className="admin-textarea"
              rows={3}
              placeholder="/assets/products/bats/apex-edition/apex-pro-front-a.webp&#10;/assets/products/bats/apex-edition/apex-pro-reverse.webp"
              value={formData.galleryInput}
              onChange={(e) => setFormData({ ...formData, galleryInput: e.target.value })}
            />
          </div>

          <div className="admin-form-group" style={{ gridColumn: "span 2" }}>
            <label>Product Description</label>
            <textarea
              className="admin-textarea"
              rows={4}
              placeholder="Enter product description, specifications, willow details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="admin-form-group" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            />
            <label htmlFor="featured" style={{ margin: 0, cursor: "pointer" }}>
              Feature on Homepage
            </label>
          </div>

          <div className="admin-form-group" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            <label htmlFor="active" style={{ margin: 0, cursor: "pointer" }}>
              Active (Visible in Shop)
            </label>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <Link href="/admin/products" className="admin-btn admin-btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
            <Save size={16} />
            <span>{loading ? "Saving..." : "Create Product"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
