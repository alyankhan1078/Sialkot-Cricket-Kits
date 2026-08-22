"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { DBCategory } from "@/src/lib/data-service";
import { useAdminFeedback } from "@/src/components/AdminFeedbackContext";

export default function AdminCategoriesPage() {
  const { showToast, confirmAction } = useAdminFeedback();
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch {
      showToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Category "${newCatName}" added successfully!`, "success");
        setNewCatName("");
        fetchCategories();
      } else {
        showToast(data.error || "Failed to add category", "error");
      }
    } catch {
      showToast("Network error while adding category", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat: DBCategory) => {
    try {
      const newActive = !cat.active;
      await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActive }),
      });
      showToast(
        newActive ? `Category "${cat.name}" is now active` : `Category "${cat.name}" is now hidden`,
        "info"
      );
      fetchCategories();
    } catch {
      showToast("Failed to update category status", "error");
    }
  };

  const handleDelete = (id: number, name: string) => {
    confirmAction({
      title: `Delete "${name}" Category?`,
      message: `Are you sure you want to delete the category "${name}"? Products in this category will remain in the catalogue.`,
      confirmText: "Delete Category",
      cancelText: "Keep Category",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
          const json = await res.json();
          if (json.success) {
            showToast(`Category "${name}" was deleted successfully`, "success");
            fetchCategories();
          } else {
            showToast(json.error || "Failed to delete category", "error");
          }
        } catch {
          showToast("Network error while deleting category", "error");
        }
      },
    });
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Category Management</h1>
          <p>Organize shop sections, create custom categories, and control display status.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>
        {/* Add Category Form */}
        <div className="admin-card">
          <h2 style={{ fontSize: "1.1rem", margin: "0 0 1rem", color: "#fff" }}>Add New Category</h2>
          <form onSubmit={handleAddCategory}>
            <div className="admin-form-group">
              <label>Category Name</label>
              <input
                className="admin-input"
                required
                placeholder="e.g. Leather Cricket Balls"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={saving}
            >
              <Plus size={16} />
              <span>{saving ? "Adding..." : "Add Category"}</span>
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "2rem", color: "var(--adm-muted)", textAlign: "center" }}>
              Loading categories...
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Category Name</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, index) => (
                  <tr key={cat.id}>
                    <td style={{ color: "var(--adm-muted)", width: "50px" }}>#{index + 1}</td>
                    <td>
                      <strong style={{ color: "#fff" }}>{cat.name}</strong>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`admin-badge ${cat.active ? "admin-badge-active" : "admin-badge-inactive"}`}
                        style={{ border: "none", cursor: "pointer" }}
                      >
                        {cat.active ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="admin-btn admin-btn-danger"
                        style={{ padding: "0.4rem 0.6rem" }}
                        title="Delete category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
