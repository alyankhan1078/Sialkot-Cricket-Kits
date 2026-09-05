"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Upload, AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { categoryOrder } from "@/src/data/products";
import { useAdminFeedback } from "@/src/components/AdminFeedbackContext";

export default function AdminNewProductPage() {
  const router = useRouter();
  const { showToast } = useAdminFeedback();
  const [categories, setCategories] = useState<string[]>([...categoryOrder]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: categories[0] || "Beauty Processed Bats",
    price: "",
    stock: "Available",
    rightStock: "",
    leftStock: "",
    description: "",
    featured: false,
    active: true,
  });

  // Image upload state
  const [uploadedImage, setUploadedImage] = useState<{
    url: string;
    storagePath: string;
    name: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle primary image upload
  const handleImageUpload = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      showToast("Invalid format. Use JPG, PNG, WebP, or AVIF.", "warning");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("File exceeds 10 MB limit.", "warning");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", "new-product");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadedImage({
        url: data.data.url,
        storagePath: data.data.storagePath,
        name: file.name,
      });
      showToast("Image uploaded!", "success");
    } catch (err: any) {
      showToast(`Upload failed: ${err.message}`, "error");
    } finally {
      setUploading(false);
    }
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
        image: uploadedImage?.url || "/assets/products/bat-collection.webp",
        images: uploadedImage ? [uploadedImage.url] : undefined,
        description: formData.description,
        featured: formData.featured,
        active: formData.active,
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        router.replace("/admin");
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`"${formData.name}" created! Redirecting to editor for image management...`, "success");

        // If we uploaded an image, also create its product_images row
        if (uploadedImage && data.data?.id) {
          try {
            await fetch(`/api/admin/products/${data.data.id}/images`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                url: uploadedImage.url,
                storagePath: uploadedImage.storagePath,
                alt: `${formData.name} - Main`,
                isMain: true,
              }),
            });
          } catch {}
        }

        // Redirect to editor where they can add more images
        router.push(`/admin/products/${data.data.id}`);
      } else {
        const msg = data.error || "Failed to create product";
        setError(msg);
        showToast(msg, "error");
      }
    } catch {
      setError("Network error — please try again");
      showToast("Network error while creating product", "error");
    } finally {
      setSaving(false);
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
          <p>Create a new catalogue item. You can add more images after creation.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171", padding: "1rem", borderRadius: "8px", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="admin-card" style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "#fff" }}>Product Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="admin-form-group" style={{ gridColumn: "span 2" }}>
              <label>Product Name *</label>
              <input
                className="admin-input" required
                placeholder="e.g. CA Plus 15000 Premium Cricket Bat"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Category *</label>
              <select className="admin-select" value={formData.category} onChange={(e) => updateField("category", e.target.value)}>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="admin-form-group">
              <label>Price (£) *</label>
              <input type="number" className="admin-input" required min="0" step="0.01" placeholder="e.g. 499" value={formData.price} onChange={(e) => updateField("price", e.target.value)} />
            </div>

            <div className="admin-form-group">
              <label>Stock Status</label>
              <input className="admin-input" placeholder="e.g. Available" value={formData.stock} onChange={(e) => updateField("stock", e.target.value)} />
            </div>

            <div className="admin-form-group" style={{ display: "flex", gap: "0.5rem" }}>
              <div style={{ flex: 1 }}>
                <label>Right-Hand Stock</label>
                <input className="admin-input" value={formData.rightStock} onChange={(e) => updateField("rightStock", e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Left-Hand Stock</label>
                <input className="admin-input" value={formData.leftStock} onChange={(e) => updateField("leftStock", e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Primary Image Upload */}
        <div className="admin-card" style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "#fff" }}>📸 Primary Image</h3>
          <p style={{ color: "var(--adm-muted)", fontSize: "0.825rem", marginBottom: "1rem" }}>
            Upload the main product photo. You can add gallery images after creation.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp,image/avif"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
              e.target.value = "";
            }}
          />

          {uploadedImage ? (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <img
                src={uploadedImage.url}
                alt=""
                style={{ width: "80px", height: "80px", objectFit: "contain", borderRadius: "8px", background: "#070d17", border: "1px solid var(--adm-card-border)", padding: "0.25rem" }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ color: "#10b981", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <CheckCircle2 size={14} /> Uploaded: {uploadedImage.name}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="admin-btn admin-btn-secondary"
                  style={{ marginTop: "0.5rem", padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                >
                  Replace Image
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                border: "2px dashed #22354f", borderRadius: "10px", padding: "2rem",
                textAlign: "center", cursor: "pointer", background: "rgba(17, 28, 46, 0.4)",
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleImageUpload(e.dataTransfer.files[0]);
              }}
            >
              {uploading ? (
                <div style={{ color: "var(--adm-primary)" }}>
                  <Loader2 size={24} style={{ animation: "spin 1s linear infinite", marginBottom: "0.5rem" }} />
                  <div>Uploading...</div>
                </div>
              ) : (
                <>
                  <Upload size={32} style={{ color: "var(--adm-muted)", marginBottom: "0.5rem" }} />
                  <div style={{ color: "#cbd5e1", fontWeight: 600 }}>Click or drag to upload</div>
                  <div style={{ color: "var(--adm-muted)", fontSize: "0.8rem" }}>JPG, PNG, WebP, AVIF · Max 10 MB</div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="admin-card" style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "#fff" }}>📝 Description</h3>
          <div className="admin-form-group">
            <textarea
              className="admin-textarea" rows={4}
              placeholder="Enter product description..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
        </div>

        {/* Visibility */}
        <div className="admin-card" style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "#fff" }}>⚙️ Visibility</h3>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#cbd5e1" }}>
              <input type="checkbox" checked={formData.featured} onChange={(e) => updateField("featured", e.target.checked)} />
              Feature on Homepage
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#cbd5e1" }}>
              <input type="checkbox" checked={formData.active} onChange={(e) => updateField("active", e.target.checked)} />
              Active (Visible in Shop)
            </label>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <Link href="/admin/products" className="admin-btn admin-btn-secondary">Cancel</Link>
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving || uploading}>
            <Save size={16} />
            <span>{saving ? "Creating..." : "Create Product"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
