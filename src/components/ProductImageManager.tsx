"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  Star,
  Trash2,
  MoveLeft,
  MoveRight,
  GripVertical,
  Eye,
  RefreshCw,
  Save,
  RotateCcw,
  AlertTriangle,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import type { DBProductImage } from "@/src/lib/data-service";
import { useAdminFeedback } from "@/src/components/AdminFeedbackContext";

interface UploadingFile {
  id: string;
  file: File;
  progress: "uploading" | "success" | "error";
  previewUrl: string;
  errorMessage?: string;
}

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [productName, setProductName] = useState(initialProductName || "");

  // Drag & drop reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Lightbox preview state
  const [previewImage, setPreviewImage] = useState<DBProductImage | null>(null);

  // Replace image state
  const [replacingImageId, setReplacingImageId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Load images from DB
  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, imgRes] = await Promise.all([
        fetch(`/api/admin/products/${productId}`).then((r) => r.json()),
        fetch(`/api/admin/products/${productId}/images`).then((r) => r.json()),
      ]);

      if (prodRes.success && prodRes.data) {
        setProductName(prodRes.data.name);
      }

      if (imgRes.success && Array.isArray(imgRes.data)) {
        setImages(imgRes.data);
      }
    } catch {
      showToast("Failed to load product images", "error");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Upload a file to Storage, then create a DB row
  const uploadAndPersistImage = async (file: File, uploadId: string): Promise<DBProductImage | null> => {
    // 1. Upload to Storage
    const formData = new FormData();
    formData.append("file", file);
    formData.append("productId", productId);

    const uploadRes = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const uploadData = await uploadRes.json();

    if (!uploadRes.ok || !uploadData.success) {
      throw new Error(uploadData.error || "Upload failed");
    }

    // 2. Create DB row
    const dbRes = await fetch(`/api/admin/products/${productId}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: uploadData.data.url,
        storagePath: uploadData.data.storagePath,
        alt: `${productName || "Product"} - View`,
        isMain: images.length === 0,
      }),
    });
    const dbData = await dbRes.json();

    if (!dbRes.ok || !dbData.success) {
      // Rollback: delete the uploaded file from Storage
      try {
        await fetch("/api/admin/upload/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storagePaths: [uploadData.data.storagePath] }),
        });
      } catch {}
      throw new Error(dbData.error || "Failed to save image record");
    }

    return dbData.data;
  };

  // Handle file upload (multiple files)
  const handleFileUpload = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => {
      const isImage = ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type);
      const isUnderLimit = file.size <= 10 * 1024 * 1024;
      if (!isImage) showToast(`${file.name}: Invalid format. Use JPG, PNG, WebP, or AVIF.`, "warning");
      if (!isUnderLimit) showToast(`${file.name}: Exceeds 10 MB limit.`, "warning");
      return isImage && isUnderLimit;
    });

    if (validFiles.length === 0) return;

    // Create preview entries
    const previews: UploadingFile[] = validFiles.map((file) => ({
      id: `upload_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      file,
      progress: "uploading" as const,
      previewUrl: URL.createObjectURL(file),
    }));

    setUploadingFiles((prev) => [...prev, ...previews]);

    // Upload each file sequentially to avoid overwhelming the server
    for (const preview of previews) {
      try {
        const savedImage = await uploadAndPersistImage(preview.file, preview.id);
        if (savedImage) {
          setImages((prev) => [...prev, savedImage]);
        }
        setUploadingFiles((prev) =>
          prev.map((p) => (p.id === preview.id ? { ...p, progress: "success" } : p))
        );
      } catch (err: any) {
        setUploadingFiles((prev) =>
          prev.map((p) =>
            p.id === preview.id
              ? { ...p, progress: "error", errorMessage: err.message || "Upload failed" }
              : p
          )
        );
        showToast(`Failed to upload ${preview.file.name}: ${err.message}`, "error");
      }
    }

    // Clear successful uploads after a delay
    setTimeout(() => {
      setUploadingFiles((prev) => prev.filter((p) => p.progress === "error"));
    }, 3000);
  };

  // Retry a failed upload
  const handleRetryUpload = async (uploadItem: UploadingFile) => {
    setUploadingFiles((prev) =>
      prev.map((p) => (p.id === uploadItem.id ? { ...p, progress: "uploading", errorMessage: undefined } : p))
    );

    try {
      const savedImage = await uploadAndPersistImage(uploadItem.file, uploadItem.id);
      if (savedImage) {
        setImages((prev) => [...prev, savedImage]);
      }
      setUploadingFiles((prev) =>
        prev.map((p) => (p.id === uploadItem.id ? { ...p, progress: "success" } : p))
      );
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((p) => p.id !== uploadItem.id));
      }, 2000);
    } catch (err: any) {
      setUploadingFiles((prev) =>
        prev.map((p) =>
          p.id === uploadItem.id
            ? { ...p, progress: "error", errorMessage: err.message }
            : p
        )
      );
    }
  };

  // Handle image replacement — upload new file, update DB row, optionally delete old
  const handleReplaceFile = async (file: File) => {
    if (!replacingImageId) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      showToast("Invalid format. Use JPG, PNG, WebP, or AVIF.", "warning");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("File exceeds 10 MB limit.", "warning");
      return;
    }

    const oldImage = images.find((img) => img.id === replacingImageId);
    if (!oldImage) return;

    showToast(`Replacing image with ${file.name}...`, "info");

    try {
      // Upload new file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", productId);

      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.error || "Upload failed");
      }

      // Update DB row with new URL and storage path
      const updateRes = await fetch(`/api/admin/products/${productId}/images/${replacingImageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: uploadData.data.url,
          storagePath: uploadData.data.storagePath,
        }),
      });
      const updateData = await updateRes.json();

      if (!updateRes.ok || !updateData.success) {
        // Rollback: delete new upload
        await fetch("/api/admin/upload/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storagePaths: [uploadData.data.storagePath] }),
        });
        throw new Error(updateData.error || "Failed to update image record");
      }

      // Delete old Storage object
      if (oldImage.storagePath) {
        await fetch("/api/admin/upload/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storagePaths: [oldImage.storagePath] }),
        }).catch(() => {});
      }

      // Refresh from DB
      await loadImages();
      showToast("Image replaced successfully!", "success");
    } catch (err: any) {
      showToast(`Failed to replace image: ${err.message}`, "error");
    } finally {
      setReplacingImageId(null);
    }
  };

  // Set Main Image
  const handleSetMain = async (imageId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setMain: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to set main image");
      }
      await loadImages();
      showToast("Main image updated!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to set main image", "error");
    }
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
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/products/${productId}/images/${img.id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || "Failed to delete image");
          }
          await loadImages();
          showToast("Image deleted successfully", "success");
        } catch (err: any) {
          showToast(err.message || "Failed to delete image", "error");
        }
      },
    });
  };

  // Save reordered images
  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: images.map((img, idx) => ({
            id: img.id,
            url: img.url,
            storagePath: img.storagePath,
            alt: img.alt,
            isMain: img.isMain,
            position: idx,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save image order");
      }
      setImages(json.data);
      showToast("Image gallery saved!", "success");
      if (onSaved) onSaved(json.data);
    } catch (err: any) {
      showToast(err.message || "Failed to save images", "error");
    } finally {
      setSaving(false);
    }
  };

  // Move image position
  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);
    const reindexed = updated.map((img, idx) => ({ ...img, position: idx }));
    setImages(reindexed);
  };

  // Drag and Drop
  const handleDragStart = (index: number) => setDraggedIndex(index);
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
    setImages(updated.map((img, idx) => ({ ...img, position: idx })));
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Update alt text (local, saved via handleSaveOrder)
  const handleAltChange = (id: string, newAlt: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, alt: newAlt } : img))
    );
  };

  if (loading) {
    return (
      <div style={{ color: "var(--adm-muted)", padding: "3rem", textAlign: "center" }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite", marginBottom: "1rem" }} />
        <div>Loading Product Media...</div>
      </div>
    );
  }

  return (
    <div className="product-image-manager">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files) handleFileUpload(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        type="file"
        ref={replaceFileInputRef}
        accept="image/jpeg,image/png,image/webp,image/avif"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files?.[0]) handleReplaceFile(e.target.files[0]);
          e.target.value = "";
        }}
      />

      {/* Studio Banner Header */}
      <div className="admin-header" style={{ marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.15rem" }}>Product Images & Gallery</h2>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.825rem", color: "var(--adm-muted)" }}>
            Upload, reorder, and manage product photographs. Changes to order and alt text require saving.
          </p>
        </div>

        <button
          onClick={handleSaveOrder}
          className="admin-btn admin-btn-primary"
          disabled={saving}
        >
          <Save size={16} />
          <span>{saving ? "Saving..." : "Save Gallery Order"}</span>
        </button>
      </div>

      {/* Upload Drop Zone */}
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
          marginBottom: "1.5rem",
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.length > 0) {
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
              Upload Photos
            </strong>
            <span style={{ color: "var(--adm-muted)", fontSize: "0.825rem" }}>
              Drag & drop images here, or click to browse. JPG, PNG, WebP, AVIF up to 10 MB. Up to 10+ images per product.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="admin-btn admin-btn-primary"
          disabled={uploadingFiles.some((f) => f.progress === "uploading")}
        >
          <Upload size={16} />
          <span>Select Images to Upload</span>
        </button>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="admin-card" style={{ marginBottom: "1.5rem", padding: "1rem" }}>
          <h3 style={{ fontSize: "0.9rem", margin: "0 0 0.75rem", color: "#fff" }}>Upload Progress</h3>
          {uploadingFiles.map((uf) => (
            <div
              key={uf.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.5rem 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <img
                src={uf.previewUrl}
                alt=""
                style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }}
              />
              <span style={{ flex: 1, fontSize: "0.85rem", color: "#cbd5e1" }}>
                {uf.file.name}
              </span>
              {uf.progress === "uploading" && (
                <Loader2 size={16} style={{ color: "var(--adm-primary)", animation: "spin 1s linear infinite" }} />
              )}
              {uf.progress === "success" && (
                <CheckCircle2 size={16} style={{ color: "#10b981" }} />
              )}
              {uf.progress === "error" && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <XCircle size={16} style={{ color: "#ef4444" }} />
                  <span style={{ fontSize: "0.75rem", color: "#f87171" }}>{uf.errorMessage}</span>
                  <button
                    onClick={() => handleRetryUpload(uf)}
                    className="admin-btn admin-btn-secondary"
                    style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Gallery Grid */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.1rem", color: "#fff", margin: 0 }}>
              Gallery ({images.length} {images.length === 1 ? "image" : "images"})
            </h2>
            <span style={{ fontSize: "0.825rem", color: "var(--adm-muted)" }}>
              Drag to reorder · Star to set main image · Click eye to preview
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
            <h3 style={{ color: "#fff", margin: "0 0 0.5rem" }}>No images yet</h3>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              Upload your first image above to set the product cover and gallery.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.25rem",
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
                  onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                  className="admin-card"
                  style={{
                    padding: "0.75rem",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    background: img.isMain ? "#12233a" : "#111c2e",
                    border: isDragTarget
                      ? "2px dashed var(--adm-primary)"
                      : img.isMain
                      ? "2px solid #10b981"
                      : "1px solid var(--adm-card-border)",
                    boxShadow: img.isMain ? "0 0 20px rgba(16, 185, 129, 0.15)" : "none",
                    borderRadius: "10px",
                    cursor: "grab",
                    transition: "border 0.2s, box-shadow 0.2s",
                  }}
                >
                  {/* Position Badge */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <GripVertical size={14} color="var(--adm-muted)" />
                      <span
                        className="admin-badge"
                        style={{
                          background: img.isMain ? "var(--adm-primary)" : "#1e2d42",
                          color: img.isMain ? "#000" : "#fff",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                        }}
                      >
                        {img.isMain ? "★ MAIN" : `#${index + 1}`}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "0.2rem" }}>
                      <button type="button" onClick={() => handleMove(index, "left")} disabled={index === 0}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: "0.2rem 0.4rem", opacity: index === 0 ? 0.3 : 1 }} title="Move left">
                        <MoveLeft size={12} />
                      </button>
                      <button type="button" onClick={() => handleMove(index, "right")} disabled={index === images.length - 1}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: "0.2rem 0.4rem", opacity: index === images.length - 1 ? 0.3 : 1 }} title="Move right">
                        <MoveRight size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Image Preview */}
                  <div style={{
                    width: "100%", height: "200px", background: "#070d17", borderRadius: "8px",
                    overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative", border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <img
                      src={img.url}
                      alt={img.alt || productName}
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", padding: "0.5rem" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = "0.3";
                      }}
                    />
                    <button
                      type="button" onClick={() => setPreviewImage(img)}
                      style={{
                        position: "absolute", top: "6px", right: "6px",
                        background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "6px",
                        color: "#fff", padding: "0.3rem", cursor: "pointer",
                      }} title="Preview full size">
                      <Eye size={14} />
                    </button>
                  </div>

                  {/* Alt Text */}
                  <div style={{ margin: "0.6rem 0 0.4rem" }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--adm-muted)", display: "block", marginBottom: "0.2rem" }}>
                      Alt Text
                    </label>
                    <input
                      className="admin-input"
                      style={{ padding: "0.35rem 0.6rem", fontSize: "0.8rem" }}
                      value={img.alt}
                      placeholder="Describe this image..."
                      onChange={(e) => handleAltChange(img.id, e.target.value)}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "auto", paddingTop: "0.35rem" }}>
                    <button type="button" onClick={() => handleSetMain(img.id)}
                      className={`admin-btn ${img.isMain ? "admin-btn-primary" : "admin-btn-secondary"}`}
                      style={{ flex: 1, padding: "0.35rem 0.4rem", fontSize: "0.75rem", justifyContent: "center" }}>
                      <Star size={12} fill={img.isMain ? "currentColor" : "none"} />
                      <span>{img.isMain ? "Main" : "Set Main"}</span>
                    </button>
                    <button type="button" onClick={() => { setReplacingImageId(img.id); replaceFileInputRef.current?.click(); }}
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: "0.35rem 0.5rem" }} title="Replace image">
                      <RefreshCw size={12} />
                    </button>
                    <button type="button" onClick={() => handleDeleteImage(img)}
                      className="admin-btn admin-btn-danger"
                      style={{ padding: "0.35rem 0.5rem" }} title="Delete image">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {previewImage && (
        <div className="admin-modal-backdrop" onClick={() => setPreviewImage(null)}>
          <div
            className="admin-modal-card admin-modal-card-lg"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "850px", textAlign: "center" }}
          >
            <div className="admin-modal-header">
              <div style={{ textAlign: "left" }}>
                <h3 style={{ margin: 0 }}>{productName} — Full Resolution</h3>
                <span style={{ fontSize: "0.8rem", color: "var(--adm-muted)" }}>
                  {previewImage.alt || "Product image preview"}
                </span>
              </div>
              <button onClick={() => setPreviewImage(null)} className="admin-modal-close">✕</button>
            </div>
            <div style={{
              background: "#070d17", borderRadius: "10px", padding: "1rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              minHeight: "400px", maxHeight: "65vh", overflow: "hidden", margin: "1rem 0",
            }}>
              <img
                src={previewImage.url}
                alt={previewImage.alt || productName}
                style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain" }}
              />
            </div>
            <div className="admin-modal-actions" style={{ justifyContent: "flex-end" }}>
              <button onClick={() => setPreviewImage(null)} className="admin-btn admin-btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
