"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Image as ImageIcon, Settings, ExternalLink } from "lucide-react";
import { categoryOrder } from "@/src/data/products";
import { useAdminFeedback } from "@/src/components/AdminFeedbackContext";
import { ProductImageManager } from "@/src/components/ProductImageManager";

export default function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast, confirmAction } = useAdminFeedback();
  const [activeTab, setActiveTab] = useState<"details" | "images">("details");
  const [categories, setCategories] = useState<string[]>([...categoryOrder]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    rightStock: "",
    leftStock: "",
    image: "",
    galleryInput: "",
    description: "",
    featured: false,
    active: true,
  });

  const fetchProduct = () => {
    fetch(`/api/admin/products/${id}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          const p = res.data;
          setFormData({
            name: p.name,
            category: p.category,
            price: String(p.price),
            stock: String(p.stock),
            rightStock: p.rightStock || "",
            leftStock: p.leftStock || "",
            image: p.image,
            galleryInput: p.images ? p.images.join("\n") : "",
            description: p.description || "",
            featured: !!p.featured,
            active: !!p.active,
          });
        } else {
          setError("Product not found");
        }
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Fetch categories
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.length > 0) {
          setCategories(res.data.map((c: { name: string }) => c.name));
        }
      })
      .catch(() => {});

    fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
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

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Product updated successfully", "success");
        router.push("/admin/products");
      } else {
        setError(data.error || "Failed to update product");
        showToast(data.error || "Failed to update product", "error");
      }
    } catch {
      setError("Network error");
      showToast("Network error while updating product", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    confirmAction({
      title: `Delete "${formData.name}"?`,
      message: "Are you sure you want to delete this product? This action cannot be undone.",
      confirmText: "Delete Product",
      cancelText: "Keep Product",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
          const json = await res.json();
          if (json.success) {
            showToast("Product deleted successfully", "success");
            router.push("/admin/products");
          } else {
            showToast(json.error || "Failed to delete product", "error");
          }
        } catch {
          showToast("Network error while deleting product", "error");
        }
      },
    });
  };

  if (loading) {
    return <div style={{ color: "var(--adm-muted)", padding: "2rem" }}>Loading product...</div>;
  }

  return (
    <div style={{ maxWidth: activeTab === "images" ? "1200px" : "900px" }}>
      {/* ── Top Navigation & Tabs ── */}
      <div style={{ marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link
          href="/admin/products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--adm-muted)",
            textDecoration: "none",
            fontSize: "0.875rem",
          }}
        >
          <ArrowLeft size={16} /> Back to products
        </Link>

        <Link
          href={`/product/${id}`}
          target="_blank"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--adm-primary)",
            fontSize: "0.85rem",
            textDecoration: "none",
          }}
        >
          <span>View on Live Storefront</span>
          <ExternalLink size={14} />
        </Link>
      </div>

      <div className="admin-header" style={{ marginBottom: "1.25rem" }}>
        <div>
          <h1>Edit Product: {formData.name || "item"}</h1>
          <p>Database ID: <code style={{ background: "#09101d", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>{id}</code></p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={handleDelete} className="admin-btn admin-btn-danger">
            <Trash2 size={16} />
            <span>Delete Product</span>
          </button>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--adm-card-border)", paddingBottom: "0.5rem" }}>
        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={`admin-btn ${activeTab === "details" ? "admin-btn-primary" : "admin-btn-secondary"}`}
          style={{ padding: "0.6rem 1.2rem", fontSize: "0.9rem" }}
        >
          <Settings size={16} />
          <span>Product Details & Pricing</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("images")}
          className={`admin-btn ${activeTab === "images" ? "admin-btn-primary" : "admin-btn-secondary"}`}
          style={{ padding: "0.6rem 1.2rem", fontSize: "0.9rem" }}
        >
          <ImageIcon size={16} />
          <span>Product Images & Media Gallery</span>
        </button>
      </div>

      {/* ── Tab 1: Images Manager ── */}
      {activeTab === "images" ? (
        <ProductImageManager
          productId={id}
          productName={formData.name}
          showBackLink={false}
          onSaved={() => fetchProduct()}
        />
      ) : (
        /* ── Tab 2: General Details Form ── */
        <div>
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
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Stock Status / Quantity</label>
                <input
                  className="admin-input"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>

              <div className="admin-form-group" style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label>Right-Hand Stock (optional)</label>
                  <input
                    className="admin-input"
                    value={formData.rightStock}
                    onChange={(e) => setFormData({ ...formData, rightStock: e.target.value })}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Left-Hand Stock (optional)</label>
                  <input
                    className="admin-input"
                    value={formData.leftStock}
                    onChange={(e) => setFormData({ ...formData, leftStock: e.target.value })}
                  />
                </div>
              </div>

              {/* Cover Picture Preview with Quick Launch to Media Manager */}
              <div className="admin-form-group" style={{ gridColumn: "span 2", background: "#09101d", padding: "1rem", borderRadius: "8px", border: "1px solid var(--adm-card-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <label style={{ margin: 0, fontWeight: 700 }}>Cover & Gallery Pictures</label>
                  <button
                    type="button"
                    onClick={() => setActiveTab("images")}
                    className="admin-btn admin-btn-primary"
                    style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                  >
                    <ImageIcon size={14} />
                    <span>Open Media Studio</span>
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <img
                    src={formData.image}
                    alt=""
                    style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "6px", background: "#000", border: "1px solid var(--adm-card-border)" }}
                  />
                  <div style={{ flex: 1 }}>
                    <input
                      className="admin-input"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Primary image URL..."
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-group" style={{ gridColumn: "span 2" }}>
                <label>Product Description</label>
                <textarea
                  className="admin-textarea"
                  rows={4}
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
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                <Save size={16} />
                <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
