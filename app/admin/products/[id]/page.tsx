"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Image as ImageIcon, Settings, ExternalLink, Eye, EyeOff, Star, AlertTriangle } from "lucide-react";
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
  const [categories, setCategories] = useState<string[]>([...categoryOrder]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    rightStock: "",
    leftStock: "",
    image: "",
    description: "",
    seoTitle: "",
    seoDescription: "",
    featured: false,
    active: true,
  });

  const [initialFormData, setInitialFormData] = useState<typeof formData | null>(null);

  const fetchProduct = useCallback(() => {
    fetch(`/api/admin/products/${id}`)
      .then((res) => {
        if (res.status === 401) {
          router.replace("/admin");
          return null;
        }
        return res.json();
      })
      .then((res) => {
        if (!res) return;
        if (res.success && res.data) {
          const p = res.data;
          const data = {
            name: p.name || "",
            category: p.category || "",
            price: String(p.price ?? ""),
            stock: String(p.stock ?? ""),
            rightStock: p.rightStock || "",
            leftStock: p.leftStock || "",
            image: p.image || "",
            description: p.description || "",
            seoTitle: p.seoTitle || "",
            seoDescription: p.seoDescription || "",
            featured: !!p.featured,
            active: !!p.active,
          };
          setFormData(data);
          setInitialFormData(data);
        } else {
          setError("Product not found");
        }
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.length > 0) {
          setCategories(res.data.map((c: { name: string }) => c.name));
        }
      })
      .catch(() => {});

    fetchProduct();
  }, [fetchProduct]);

  // Track unsaved changes
  useEffect(() => {
    if (initialFormData) {
      setHasChanges(JSON.stringify(formData) !== JSON.stringify(initialFormData));
    }
  }, [formData, initialFormData]);

  // Unsaved changes warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        stock: formData.stock,
        rightStock: formData.rightStock || undefined,
        leftStock: formData.leftStock || undefined,
        description: formData.description,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
        featured: formData.featured,
        active: formData.active,
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        router.replace("/admin");
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Product updated successfully!", "success");
        await fetchProduct();
        setHasChanges(false);
      } else {
        const msg = data.error || "Failed to update product";
        setError(msg);
        showToast(msg, "error");
      }
    } catch {
      setError("Network error — please try again");
      showToast("Network error while updating product", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    confirmAction({
      title: `Delete "${formData.name}"?`,
      message: "This will permanently delete the product and all its images. This cannot be undone.",
      confirmText: "Delete Product",
      cancelText: "Keep Product",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
          const json = await res.json();
          if (res.ok && json.success) {
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
    <div style={{ maxWidth: "1000px" }}>
      {/* Navigation */}
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/admin/products" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--adm-muted)", textDecoration: "none", fontSize: "0.875rem" }}>
          <ArrowLeft size={16} /> Back to products
        </Link>
        <Link href={`/product/${id}`} target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--adm-primary)", fontSize: "0.85rem", textDecoration: "none" }}>
          <span>View on Storefront</span>
          <ExternalLink size={14} />
        </Link>
      </div>

      {/* Header */}
      <div className="admin-header" style={{ marginBottom: "1.25rem" }}>
        <div>
          <h1>Edit: {formData.name || "Product"}</h1>
          <p>ID: <code style={{ background: "#09101d", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>{id}</code></p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={handleDelete} className="admin-btn admin-btn-danger">
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171", padding: "1rem", borderRadius: "8px", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
          <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#f87171", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Product Details Form */}
      <form onSubmit={handleSubmit}>
        {/* Section: Product Information */}
        <div className="admin-card" style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Settings size={16} /> Product Information
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="admin-form-group" style={{ gridColumn: "span 2" }}>
              <label>Product Name *</label>
              <input className="admin-input" required value={formData.name} onChange={(e) => updateField("name", e.target.value)} />
            </div>
            <div className="admin-form-group">
              <label>Category *</label>
              <select className="admin-select" value={formData.category} onChange={(e) => updateField("category", e.target.value)}>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label>Price (£) *</label>
              <input type="number" className="admin-input" required min="0" step="0.01" value={formData.price} onChange={(e) => updateField("price", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section: Inventory */}
        <div className="admin-card" style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "#fff" }}>📦 Inventory & Stock</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div className="admin-form-group">
              <label>Stock Status</label>
              <input className="admin-input" value={formData.stock} onChange={(e) => updateField("stock", e.target.value)} placeholder="e.g. Available" />
            </div>
            <div className="admin-form-group">
              <label>Right-Hand Stock</label>
              <input className="admin-input" value={formData.rightStock} onChange={(e) => updateField("rightStock", e.target.value)} />
            </div>
            <div className="admin-form-group">
              <label>Left-Hand Stock</label>
              <input className="admin-input" value={formData.leftStock} onChange={(e) => updateField("leftStock", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section: Description */}
        <div className="admin-card" style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "#fff" }}>📝 Description</h3>
          <div className="admin-form-group">
            <textarea className="admin-textarea" rows={5} value={formData.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Full product description..." />
          </div>
        </div>

        {/* Section: SEO */}
        <div className="admin-card" style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "#fff" }}>🔍 SEO Preview</h3>
          <div style={{ display: "grid", gap: "1rem" }}>
            <div className="admin-form-group">
              <label>SEO Title</label>
              <input className="admin-input" value={formData.seoTitle} onChange={(e) => updateField("seoTitle", e.target.value)} placeholder={formData.name + " | Sialkot Cricket Kits"} />
              <small style={{ color: "var(--adm-muted)", fontSize: "0.75rem" }}>
                {(formData.seoTitle || formData.name).length}/60 characters
              </small>
            </div>
            <div className="admin-form-group">
              <label>SEO Description</label>
              <textarea className="admin-textarea" rows={2} value={formData.seoDescription} onChange={(e) => updateField("seoDescription", e.target.value)} placeholder="Meta description for search engines..." />
              <small style={{ color: "var(--adm-muted)", fontSize: "0.75rem" }}>
                {(formData.seoDescription || "").length}/160 characters
              </small>
            </div>
          </div>
          {/* Preview Box */}
          <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "#09101d", borderRadius: "8px", border: "1px solid var(--adm-card-border)" }}>
            <div style={{ color: "#1a73e8", fontSize: "1rem", fontWeight: 500 }}>
              {formData.seoTitle || formData.name || "Product Name"} | Sialkot Cricket Kits
            </div>
            <div style={{ color: "#10b981", fontSize: "0.75rem" }}>
              sialkotcricketkits.com/product/{id}
            </div>
            <div style={{ color: "#94a3b8", fontSize: "0.825rem", marginTop: "0.25rem" }}>
              {formData.seoDescription || formData.description?.slice(0, 160) || "Product description..."}
            </div>
          </div>
        </div>

        {/* Section: Visibility */}
        <div className="admin-card" style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "#fff" }}>⚙️ Visibility & Featured</h3>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#cbd5e1" }}>
              <input type="checkbox" checked={formData.active} onChange={(e) => updateField("active", e.target.checked)} />
              {formData.active ? <Eye size={16} /> : <EyeOff size={16} />}
              {formData.active ? "Visible in Shop" : "Hidden from Shop"}
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#cbd5e1" }}>
              <input type="checkbox" checked={formData.featured} onChange={(e) => updateField("featured", e.target.checked)} />
              <Star size={16} fill={formData.featured ? "currentColor" : "none"} style={{ color: formData.featured ? "#fbbf24" : "inherit" }} />
              {formData.featured ? "Featured on Homepage" : "Not Featured"}
            </label>
          </div>
        </div>

        {/* Sticky Save Bar */}
        <div style={{
          position: "sticky", bottom: "1rem", background: "#111c2e", border: "1px solid var(--adm-card-border)",
          borderRadius: "10px", padding: "0.75rem 1.25rem",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.3)", zIndex: 10,
        }}>
          <div style={{ fontSize: "0.85rem", color: "var(--adm-muted)" }}>
            {hasChanges && <span style={{ color: "#fbbf24" }}>● Unsaved changes</span>}
            {!hasChanges && <span style={{ color: "#10b981" }}>✓ All changes saved</span>}
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link href="/admin/products" className="admin-btn admin-btn-secondary">Cancel</Link>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              <Save size={16} />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Image Manager Section */}
      <div style={{ marginTop: "2rem" }}>
        <ProductImageManager
          productId={id}
          productName={formData.name}
          showBackLink={false}
          onSaved={() => fetchProduct()}
        />
      </div>
    </div>
  );
}
