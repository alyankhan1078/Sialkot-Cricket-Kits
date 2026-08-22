"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Layers } from "lucide-react";
import type { DBCategory } from "@/src/lib/data-service";

export default function AdminCategoriesPage() {
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
      // error
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
        setNewCatName("");
        fetchCategories();
      } else {
        alert(data.error || "Failed to add category");
      }
    } catch {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat: DBCategory) => {
    try {
      await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !cat.active }),
      });
      fetchCategories();
    } catch {
      alert("Failed to update category");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"? Products in this category will remain.`)) return;
    try {
      await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      fetchCategories();
    } catch {
      alert("Failed to delete category");
    }
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
