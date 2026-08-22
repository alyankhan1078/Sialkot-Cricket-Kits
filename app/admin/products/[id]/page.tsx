"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { categoryOrder } from "@/src/data/products";
import { useAdminFeedback } from "@/src/components/AdminFeedbackContext";

export default function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast, confirmAction } = useAdminFeedback();
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

    // Fetch product
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
          <h1>Edit Product</h1>
          <p>Modify details, prices, images, and inventory for {formData.name || "item"}.</p>
        </div>
        <button onClick={handleDelete} className="admin-btn admin-btn-danger">
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
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

          <div className="admin-form-group" style={{ gridColumn: "span 2" }}>
            <label>Primary Image URL or Path *</label>
            <input
              className="admin-input"
              required
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
          </div>

          <div className="admin-form-group" style={{ gridColumn: "span 2" }}>
            <label>Additional Gallery Image Paths (One per line)</label>
            <textarea
              className="admin-textarea"
              rows={3}
              value={formData.galleryInput}
              onChange={(e) => setFormData({ ...formData, galleryInput: e.target.value })}
            />
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
  );
}
