"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  Star,
  Trash2,
  MoveLeft,
  MoveRight,
  GripVertical,
  Eye,
  RefreshCw,
  Plus,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  ArrowLeft,
  Link as LinkIcon,
  Search,
} from "lucide-react";
import type { DBProductImage, DBProduct } from "@/src/lib/data-service";
import { useAdminFeedback } from "@/src/components/AdminFeedbackContext";

interface ProductImageManagerProps {
  productId: string;
  productName?: string;
  onSaved?: (images: DBProductImage[]) => void;
  showBackLink?: boolean;
}

export function ProductImageManager({
  productId,
  productName: initialProductName,
  onSaved,
  showBackLink = true,
}: ProductImageManagerProps) {
  const { showToast, confirmAction } = useAdminFeedback();
  const [images, setImages] = useState<DBProductImage[]>([]);
  const [initialImages, setInitialImages] = useState<DBProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [productName, setProductName] = useState(initialProductName || "");
  const [productCategory, setProductCategory] = useState("");
  const [allProducts, setAllProducts] = useState<DBProduct[]>([]);

  // Drag & drop reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Lightbox preview state
  const [previewImage, setPreviewImage] = useState<DBProductImage | null>(null);

  // Replace image state
  const [replacingImageId, setReplacingImageId] = useState<string | null>(null);

  // Direct URL input state
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [customAlt, setCustomAlt] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const hasUnsavedChanges = JSON.stringify(images) !== JSON.stringify(initialImages);

  // Fetch product info & images
  const loadProductAndImages = async (idToLoad: string) => {
    setLoading(true);
    try {
      const [prodRes, imgRes, allProdRes] = await Promise.all([
        fetch(`/api/admin/products/${idToLoad}`).then((r) => r.json()),
        fetch(`/api/admin/products/${idToLoad}/images`).then((r) => r.json()),
        fetch(`/api/admin/products`).then((r) => r.json()),
      ]);

      if (prodRes.success && prodRes.data) {
        setProductName(prodRes.data.name);
        setProductCategory(prodRes.data.category);
      }

      if (imgRes.success && Array.isArray(imgRes.data)) {
        setImages(imgRes.data);
        setInitialImages(JSON.parse(JSON.stringify(imgRes.data)));
      }

      if (allProdRes.success && Array.isArray(allProdRes.data)) {
        setAllProducts(allProdRes.data);
      }
    } catch {
      showToast("Failed to load product media", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductAndImages(productId);
  }, [productId]);

  // Handle saving changes
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });

      const json = await res.json();
      if (json.success) {
        setImages(json.data);
        setInitialImages(JSON.parse(JSON.stringify(json.data)));
        showToast("Product images updated and published successfully!", "success");
        if (onSaved) onSaved(json.data);
      } else {
        showToast(json.error || "Failed to save images", "error");
      }
    } catch {
      showToast("Network error while saving images", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handle Cancel / Reset
  const handleCancelChanges = () => {
    if (!hasUnsavedChanges) return;
    confirmAction({
      title: "Discard Unsaved Changes?",
      message: "Are you sure you want to revert all image changes made during this session?",
      confirmText: "Discard Changes",
      cancelText: "Keep Editing",
      danger: true,
      onConfirm: () => {
        setImages(JSON.parse(JSON.stringify(initialImages)));
        showToast("Image changes discarded", "info");
      },
    });
  };

  // Upload file handler
  const handleFileUpload = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => {
      const isImage = ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type);
      const isUnderLimit = file.size <= 10 * 1024 * 1024;
      if (!isImage) showToast(`${file.name}: Invalid format. Use JPG, PNG, or WebP.`, "warning");
      if (!isUnderLimit) showToast(`${file.name}: Exceeds 10MB limit.`, "warning");
      return isImage && isUnderLimit;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    const newUploadedImages: DBProductImage[] = [...images];

    const readFileAsDataUrl = (f: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve("");
        reader.readAsDataURL(f);
      });
    };

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setUploadProgress(`Processing ${i + 1} of ${validFiles.length}: ${file.name}...`);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", productId);

      let finalUrl = "";

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.data?.url) {
          finalUrl = data.data.url;
        }
      } catch {
        // Fallback to local Data URL
      }

      if (!finalUrl) {
        finalUrl = await readFileAsDataUrl(file);
      }

      if (finalUrl) {
        const isFirstImage = newUploadedImages.length === 0;
        newUploadedImages.push({
          id: `img_${productId}_${Date.now()}_${i}`,
          productId,
          url: finalUrl,
          alt: `${productName || "Product"} - View ${newUploadedImages.length + 1}`,
          position: newUploadedImages.length,
          isMain: isFirstImage,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        showToast(`Could not process ${file.name}`, "error");
      }
    }

    setImages(newUploadedImages);
    setUploading(false);
    setUploadProgress("");
    showToast(`${validFiles.length} image(s) added! Click "Save Image Changes" to publish.`, "success");
  };

  // Handle image replacement
  const handleReplaceFile = async (file: File) => {
    if (!replacingImageId) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
      showToast("Invalid format. Use JPG, PNG, or WebP.", "warning");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("File exceeds 10MB limit.", "warning");
      return;
    }

    setUploading(true);
    setUploadProgress(`Replacing picture with ${file.name}...`);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("productId", productId);

    let finalUrl = "";

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        finalUrl = data.data.url;
      }
    } catch {
      // Fallback
    }

    if (!finalUrl) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setImages((prev) =>
          prev.map((img) =>
            img.id === replacingImageId
              ? { ...img, url: dataUrl, updatedAt: new Date().toISOString() }
              : img
          )
        );
        showToast("Image replaced! Click Save to apply.", "success");
      };
      reader.readAsDataURL(file);
    } else {
      setImages((prev) =>
        prev.map((img) =>
          img.id === replacingImageId
            ? { ...img, url: finalUrl, updatedAt: new Date().toISOString() }
            : img
        )
      );
      showToast("Image replaced! Click Save to apply.", "success");
    }

    setUploading(false);
    setUploadProgress("");
    setReplacingImageId(null);
  };

  // Add URL image
  const handleAddUrlImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    const newImg: DBProductImage = {
      id: `img_${productId}_${Date.now()}`,
      productId,
      url: customUrl.trim(),
      alt: customAlt.trim() || `${productName} View ${images.length + 1}`,
      position: images.length,
      isMain: images.length === 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setImages((prev) => [...prev, newImg]);
    setCustomUrl("");
    setCustomAlt("");
    setShowUrlInput(false);
    showToast("Image URL added to gallery! Click Save to publish.", "info");
  };

  // Set Main Image
  const handleSetMain = (imageId: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isMain: img.id === imageId,
      }))
    );
    showToast("Selected as primary main image", "info");
  };

  // Delete Image
  const handleDeleteImage = (img: DBProductImage) => {
    confirmAction({
      title: "Remove this picture?",
      message: `Are you sure you want to delete this image? ${
        img.isMain ? "This is currently the MAIN image. The next image will become the main image." : ""
      }`,
      confirmText: "Delete Picture",
      cancelText: "Keep Picture",
      danger: true,
      onConfirm: () => {
        setImages((prev) => {
          const filtered = prev.filter((item) => item.id !== img.id);
          if (img.isMain && filtered.length > 0) {
            filtered[0].isMain = true;
          }
          return filtered.map((item, idx) => ({ ...item, position: idx }));
        });
        showToast("Picture removed from gallery", "info");
      },
    });
  };

  // Move image position
  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);

    // Re-index
    const reindexed = updated.map((img, idx) => ({ ...img, position: idx }));
    setImages(reindexed);
  };

  // Drag and Drop reordering handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...images];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    const reindexed = updated.map((img, idx) => ({ ...img, position: idx }));
    setImages(reindexed);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Update alt text
  const handleAltChange = (id: string, newAlt: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, alt: newAlt } : img))
    );
  };

  if (loading) {
    return (
      <div style={{ color: "var(--adm-muted)", padding: "3rem", textAlign: "center" }}>
        Loading Product Media Studio...
      </div>
    );
  }

  return (
    <div className="product-image-manager">
      {/* ── Hidden File Inputs ── */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files) handleFileUpload(e.target.files);
        }}
      />
      <input
        type="file"
        ref={replaceFileInputRef}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleReplaceFile(e.target.files[0]);
          }
        }}
      />

      {/* ── Header Navigation ── */}
      {showBackLink && (
        <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
            <ArrowLeft size={16} /> Back to Products
          </Link>

          {/* Quick Product Switcher */}
          {allProducts.length > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--adm-muted)" }}>Switch Product:</span>
              <select
                className="admin-select"
                style={{ width: "auto", minWidth: "220px", padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
                value={productId}
                onChange={(e) => {
                  window.location.href = `/admin/products/${e.target.value}/images`;
                }}
              >
                {allProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* ── Studio Banner Header ── */}
      <div className="admin-header" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
            <h1>{productName || "Product Media Manager"}</h1>
            {hasUnsavedChanges && (
              <span
                className="admin-badge"
                style={{ background: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", fontSize: "0.75rem" }}
              >
                ● Unsaved Changes
              </span>
            )}
          </div>
          <p>
            Category: <strong style={{ color: "var(--adm-primary)" }}>{productCategory}</strong> · Product Database ID:{" "}
            <code style={{ background: "#09101d", padding: "0.15rem 0.4rem", borderRadius: "4px", color: "#cbd5e1" }}>
              {productId}
            </code>
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          {hasUnsavedChanges && (
            <button
              onClick={handleCancelChanges}
              className="admin-btn admin-btn-secondary"
              disabled={saving}
            >
              <RotateCcw size={16} />
              <span>Cancel</span>
            </button>
          )}

          <button
            onClick={handleSaveChanges}
            className="admin-btn admin-btn-primary"
            disabled={saving || uploading}
          >
            <Save size={16} />
            <span>{saving ? "Saving Media..." : "Save Image Changes"}</span>
          </button>
        </div>
      </div>

      {/* ── Upload & Actions Toolbar ── */}
      <div
        className="admin-card"
        style={{
          border: "2px dashed #22354f",
          background: "rgba(17, 28, 46, 0.6)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "1rem",
          position: "relative",
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
          }
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.15)",
              color: "var(--adm-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Upload size={24} />
          </div>
          <div style={{ textAlign: "left" }}>
            <strong style={{ color: "#fff", fontSize: "1rem", display: "block" }}>
              Upload Photos for {productName}
            </strong>
            <span style={{ color: "var(--adm-muted)", fontSize: "0.825rem" }}>
              Drag and drop images here, or browse files (Supports JPG, PNG, WebP up to 10MB)
            </span>
          </div>
        </div>

        {uploading && (
          <div style={{ color: "var(--adm-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
            ⏳ {uploadProgress}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="admin-btn admin-btn-primary"
            disabled={uploading}
          >
            <Upload size={16} />
            <span>Select Images to Upload</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="admin-btn admin-btn-secondary"
          >
            <LinkIcon size={16} />
            <span>{showUrlInput ? "Hide URL Input" : "Add Image by URL / Path"}</span>
          </button>
        </div>

        {/* URL Input Form */}
        {showUrlInput && (
          <form
            onSubmit={handleAddUrlImage}
            style={{
              display: "flex",
              gap: "0.75rem",
              width: "100%",
              maxWidth: "650px",
              marginTop: "0.75rem",
              background: "#09101d",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid var(--adm-card-border)",
            }}
          >
            <input
              className="admin-input"
              style={{ flex: 2 }}
              placeholder="e.g. /assets/products/item-001.webp or https://..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              required
            />
            <input
              className="admin-input"
              style={{ flex: 1 }}
              placeholder="SEO Alt text"
              value={customAlt}
              onChange={(e) => setCustomAlt(e.target.value)}
            />
            <button type="submit" className="admin-btn admin-btn-primary">
              <Plus size={16} />
              <span>Add</span>
            </button>
          </form>
        )}
      </div>

      {/* ── Image Gallery Grid ── */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.2rem", color: "#fff", margin: 0 }}>
              Product Image Gallery ({images.length} pictures)
            </h2>
            <span style={{ fontSize: "0.825rem", color: "var(--adm-muted)" }}>
              Drag to reorder · Star to set Main/Cover picture · Click eye to preview
            </span>
          </div>
          {images.length > 0 && (
            <span style={{ color: "var(--adm-primary)", fontSize: "0.85rem", fontWeight: 600 }}>
              Main: {images.find((i) => i.isMain)?.alt || "First Photo"}
            </span>
          )}
        </div>

        {images.length === 0 ? (
          <div
            className="admin-card"
            style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--adm-muted)" }}
          >
            <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
            <h3 style={{ color: "#fff", margin: "0 0 0.5rem" }}>No pictures attached yet</h3>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              Upload your first picture above to set the product cover and gallery.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {images.map((img, index) => {
              const isDragTarget = dragOverIndex === index;
              return (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  className="admin-card"
                  style={{
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    background: img.isMain ? "#12233a" : "#111c2e",
                    border: isDragTarget
                      ? "2px dashed var(--adm-primary)"
                      : img.isMain
                      ? "2px solid #10b981"
                      : "1px solid var(--adm-card-border)",
                    boxShadow: img.isMain ? "0 0 20px rgba(16, 185, 129, 0.2)" : "none",
                    borderRadius: "12px",
                    transition: "all 0.2s",
                    cursor: "grab",
                  }}
                >
                  {/* Position Badge & Main Indicator */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <GripVertical size={16} color="var(--adm-muted)" />
                      <span
                        className="admin-badge"
                        style={{
                          background: img.isMain ? "var(--adm-primary)" : "#1e2d42",
                          color: img.isMain ? "#000" : "#fff",
                          fontWeight: 700,
                        }}
                      >
                        {img.isMain ? "★ MAIN COVER" : `#${index + 1}`}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      <button
                        type="button"
                        onClick={() => handleMove(index, "left")}
                        disabled={index === 0}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: "0.25rem 0.5rem", opacity: index === 0 ? 0.3 : 1 }}
                        title="Move left"
                      >
                        <MoveLeft size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, "right")}
                        disabled={index === images.length - 1}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: "0.25rem 0.5rem", opacity: index === images.length - 1 ? 0.3 : 1 }}
                        title="Move right"
                      >
                        <MoveRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Responsive Image Box (object-fit: contain) */}
                  <div
                    style={{
                      width: "100%",
                      height: "220px",
                      background: "#070d17",
                      borderRadius: "8px",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <img
                      src={img.url}
                      alt={img.alt || productName}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        padding: "0.5rem",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/products/bat-collection.webp";
                      }}
                    />

                    {/* Quick Lightbox Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewImage(img)}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "rgba(0, 0, 0, 0.7)",
                        backdropFilter: "blur(4px)",
                        border: "none",
                        borderRadius: "6px",
                        color: "#fff",
                        padding: "0.4rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Enlarge preview"
                    >
                      <Eye size={14} />
                    </button>
                  </div>

                  {/* SEO Alt Text Input */}
                  <div style={{ margin: "0.85rem 0 0.5rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--adm-muted)", display: "block", marginBottom: "0.25rem" }}>
                      SEO Alt Text
                    </label>
                    <input
                      className="admin-input"
                      style={{ padding: "0.45rem 0.75rem", fontSize: "0.825rem" }}
                      value={img.alt}
                      placeholder="Descriptive keywords (e.g. Back view, edge profile)..."
                      onChange={(e) => handleAltChange(img.id, e.target.value)}
                    />
                  </div>

                  {/* Image Action Buttons */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                      marginTop: "auto",
                      paddingTop: "0.5rem",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSetMain(img.id)}
                      className={`admin-btn ${img.isMain ? "admin-btn-primary" : "admin-btn-secondary"}`}
                      style={{ flex: 1, padding: "0.45rem 0.5rem", fontSize: "0.8rem", justifyContent: "center" }}
                    >
                      <Star size={14} fill={img.isMain ? "currentColor" : "none"} />
                      <span>{img.isMain ? "Main Image" : "Set as Main"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setReplacingImageId(img.id);
                        replaceFileInputRef.current?.click();
                      }}
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: "0.45rem 0.6rem" }}
                      title="Replace this picture with new file"
                    >
                      <RefreshCw size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img)}
                      className="admin-btn admin-btn-danger"
                      style={{ padding: "0.45rem 0.6rem" }}
                      title="Delete picture"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── High-Resolution Lightbox Modal ── */}
      {previewImage && (
        <div className="admin-modal-backdrop" onClick={() => setPreviewImage(null)}>
          <div
            className="admin-modal-card admin-modal-card-lg"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "850px", textAlign: "center" }}
          >
            <div className="admin-modal-header">
              <div style={{ textAlign: "left" }}>
                <h3 style={{ margin: 0 }}>{productName} — Full Resolution View</h3>
                <span style={{ fontSize: "0.8rem", color: "var(--adm-muted)" }}>
                  {previewImage.alt || "Product image preview"}
                </span>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="admin-modal-close"
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: "#070d17",
                borderRadius: "10px",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "400px",
                maxHeight: "65vh",
                overflow: "hidden",
                margin: "1rem 0",
              }}
            >
              <img
                src={previewImage.url}
                alt={previewImage.alt || productName}
                style={{
                  maxWidth: "100%",
                  maxHeight: "60vh",
                  objectFit: "contain",
                }}
              />
            </div>

            <div className="admin-modal-actions" style={{ justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--adm-muted)" }}>
                URL: <code style={{ color: "var(--adm-primary)" }}>{previewImage.url}</code>
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="admin-btn admin-btn-primary"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
