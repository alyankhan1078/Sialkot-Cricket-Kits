"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Image as ImageIcon, RefreshCw } from "lucide-react";
import type { DBProduct } from "@/src/lib/data-service";
import { useAdminFeedback } from "@/src/components/AdminFeedbackContext";
import "../orders/orders.css";
import "./products.css";

export default function AdminProductsPage() {
  const { showToast, confirmAction } = useAdminFeedback();
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [visibility, setVisibility] = useState<"all" | "visible" | "hidden">("all");
  // Draft values while the owner types in a cell, keyed by `${id}:${field}`.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      if (res.status === 401) {
        window.location.assign("/admin");
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (json.success) setProducts(json.data);
      else showToast(json.error || "Failed to load products", "error");
    } catch {
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    // Initial load.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.category)))], [products]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (visibility === "visible" && !p.active) return false;
      if (visibility === "hidden" && p.active) return false;
      return !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    });
  }, [products, search, category, visibility]);

  const save = async (product: DBProduct, patch: Partial<DBProduct>, label: string) => {
    const key = `${product.id}:${Object.keys(patch)[0]}`;
    setSavingKey(key);
    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(product.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.status === 401) {
        window.location.assign("/admin");
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setProducts((list) => list.map((p) => (p.id === product.id ? { ...p, ...patch } : p)));
        setDrafts((d) => {
          const next = { ...d };
          delete next[key];
          return next;
        });
        showToast(`${product.name}: ${label} saved`, "success");
      } else {
        showToast(json.error || "Could not save", "error");
      }
    } catch {
      showToast("Network error while saving", "error");
    } finally {
      setSavingKey(null);
    }
  };

  const commitPrice = (p: DBProduct) => {
    const key = `${p.id}:price`;
    if (drafts[key] === undefined) return;
    const value = Number(drafts[key]);
    if (!Number.isFinite(value) || value < 0) {
      showToast("Please enter a valid price", "error");
      return;
    }
    if (value === p.price) {
      setDrafts((d) => {
        const next = { ...d };
        delete next[key];
        return next;
      });
      return;
    }
    save(p, { price: value }, `price £${value}`);
  };

  const commitStock = (p: DBProduct) => {
    const key = `${p.id}:stock`;
    if (drafts[key] === undefined) return;
    const value = drafts[key].trim();
    if (value === String(p.stock ?? "")) {
      setDrafts((d) => {
        const next = { ...d };
        delete next[key];
        return next;
      });
      return;
    }
    save(p, { stock: value }, "stock");
  };

  const handleDelete = (p: DBProduct) => {
    confirmAction({
      title: `Delete "${p.name}"?`,
      message: "It will be removed from your catalogue permanently. To hide it for now, switch off “Visible” instead.",
      confirmText: "Delete product",
      cancelText: "Keep product",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/products/${encodeURIComponent(p.id)}`, { method: "DELETE" });
          const json = await res.json().catch(() => ({}));
          if (json.success) {
            showToast(`"${p.name}" deleted`, "success");
            load();
          } else {
            showToast(json.error || "Failed to delete product", "error");
          }
        } catch {
          showToast("Network error while deleting", "error");
        }
      },
    });
  };

  const draft = (p: DBProduct, field: "price" | "stock") =>
    drafts[`${p.id}:${field}`] ?? String(field === "price" ? p.price : p.stock ?? "");
  const setDraft = (p: DBProduct, field: "price" | "stock", value: string) =>
    setDrafts((d) => ({ ...d, [`${p.id}:${field}`]: value }));
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>, commit: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
      (e.target as HTMLInputElement).blur();
    }
  };

  const Toggle = ({ on, label, onChange, busy }: { on: boolean; label: string; onChange: () => void; busy: boolean }) => (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={`prd-switch ${on ? "on" : ""}`} onClick={onChange} disabled={busy}>
      <span className="prd-knob" />
    </button>
  );

  return (
    <div className="ord prd">
      <header className="ord-head">
        <div>
          <h1>Products</h1>
          <p>Edit price and stock right in the table. Changes save when you press Enter or leave the cell.</p>
        </div>
        <div className="ord-head-actions">
          <button type="button" className="ord-btn" onClick={load} disabled={loading} aria-label="Refresh products">
            <RefreshCw size={16} className={loading ? "ord-spin" : ""} aria-hidden="true" />
            <span className="ord-hide-sm">Refresh</span>
          </button>
          <Link href="/admin/products/new" className="ord-btn primary">
            <Plus size={16} aria-hidden="true" /> Add product
          </Link>
        </div>
      </header>

      <div className="ord-toolbar">
        <label className="ord-search">
          <Search size={16} aria-hidden="true" />
          <span className="ord-sr">Search products</span>
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product or category" />
        </label>
        <label className="ord-sr" htmlFor="prd-cat">Category</label>
        <select id="prd-cat" className="ord-select prd-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>
          ))}
        </select>
        <div className="ord-chips" role="group" aria-label="Visibility">
          {(
            [
              ["all", "All"],
              ["visible", "Visible"],
              ["hidden", "Hidden"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" aria-pressed={visibility === id} className={`ord-chip ${visibility === id ? "active" : ""}`} onClick={() => setVisibility(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="ord-table-wrap">
        <table className="ord-table prd-table">
          <thead>
            <tr>
              <th scope="col" className="sticky">Product</th>
              <th scope="col">Category</th>
              <th scope="col" className="num">Price £</th>
              <th scope="col">Stock</th>
              <th scope="col">Featured</th>
              <th scope="col">Visible</th>
              <th scope="col"><span className="ord-sr">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`s${i}`}><td colSpan={7}><span className="ord-skel" /></td></tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={7} className="ord-empty">No products match.</td></tr>
            )}
            {!loading &&
              rows.map((p) => (
                <tr key={p.id} className={p.active ? "" : "prd-hidden"}>
                  <td className="sticky">
                    <div className="prd-name">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt="" loading="lazy" decoding="async" width={40} height={40} />
                      <Link href={`/admin/products/${encodeURIComponent(p.id)}`}>{p.name}</Link>
                    </div>
                  </td>
                  <td className="muted nowrap">{p.category}</td>
                  <td className="num">
                    <label className="ord-sr" htmlFor={`price-${p.id}`}>Price for {p.name}</label>
                    <input
                      id={`price-${p.id}`}
                      className="prd-cell num"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="1"
                      value={draft(p, "price")}
                      onChange={(e) => setDraft(p, "price", e.target.value)}
                      onBlur={() => commitPrice(p)}
                      onKeyDown={(e) => onKey(e, () => commitPrice(p))}
                      disabled={savingKey === `${p.id}:price`}
                    />
                  </td>
                  <td>
                    <label className="ord-sr" htmlFor={`stock-${p.id}`}>Stock for {p.name}</label>
                    <input
                      id={`stock-${p.id}`}
                      className="prd-cell"
                      type="text"
                      value={draft(p, "stock")}
                      onChange={(e) => setDraft(p, "stock", e.target.value)}
                      onBlur={() => commitStock(p)}
                      onKeyDown={(e) => onKey(e, () => commitStock(p))}
                      disabled={savingKey === `${p.id}:stock`}
                    />
                  </td>
                  <td>
                    <Toggle on={p.featured} label={`Featured: ${p.name}`} busy={savingKey === `${p.id}:featured`} onChange={() => save(p, { featured: !p.featured }, p.featured ? "removed from featured" : "featured on homepage")} />
                  </td>
                  <td>
                    <Toggle on={p.active} label={`Visible in shop: ${p.name}`} busy={savingKey === `${p.id}:active`} onChange={() => save(p, { active: !p.active }, p.active ? "hidden from shop" : "visible in shop")} />
                  </td>
                  <td>
                    <div className="prd-actions">
                      <Link href={`/admin/products/${encodeURIComponent(p.id)}/images`} className="ord-icon" aria-label={`Photos of ${p.name}`}><ImageIcon size={16} aria-hidden="true" /></Link>
                      <Link href={`/admin/products/${encodeURIComponent(p.id)}`} className="ord-icon" aria-label={`Edit ${p.name}`}><Pencil size={16} aria-hidden="true" /></Link>
                      <button type="button" className="ord-icon" aria-label={`Delete ${p.name}`} onClick={() => handleDelete(p)}><Trash2 size={16} aria-hidden="true" /></button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
          {!loading && rows.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={7}>{rows.length} of {products.length} products · {products.filter((p) => !p.active).length} hidden</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="ord-cards">
        {loading && Array.from({ length: 3 }).map((_, i) => <div key={`c${i}`} className="ord-card ord-skel-card" />)}
        {!loading && rows.length === 0 && <p className="ord-empty">No products match.</p>}
        {!loading &&
          rows.map((p) => (
            <article key={p.id} className={`ord-card prd-card ${p.active ? "" : "prd-hidden"}`}>
              <div className="prd-card-top">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" loading="lazy" decoding="async" width={56} height={56} />
                <div className="prd-card-title">
                  <Link href={`/admin/products/${encodeURIComponent(p.id)}`}>{p.name}</Link>
                  <span className="muted">{p.category}</span>
                </div>
              </div>
              <div className="prd-card-grid">
                <label className="ord-field">
                  <span>Price £</span>
                  <input
                    className="prd-cell num"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={draft(p, "price")}
                    onChange={(e) => setDraft(p, "price", e.target.value)}
                    onBlur={() => commitPrice(p)}
                    onKeyDown={(e) => onKey(e, () => commitPrice(p))}
                  />
                </label>
                <label className="ord-field">
                  <span>Stock</span>
                  <input
                    className="prd-cell"
                    type="text"
                    value={draft(p, "stock")}
                    onChange={(e) => setDraft(p, "stock", e.target.value)}
                    onBlur={() => commitStock(p)}
                    onKeyDown={(e) => onKey(e, () => commitStock(p))}
                  />
                </label>
              </div>
              <div className="prd-card-switches">
                <span>Featured <Toggle on={p.featured} label={`Featured: ${p.name}`} busy={savingKey === `${p.id}:featured`} onChange={() => save(p, { featured: !p.featured }, p.featured ? "removed from featured" : "featured on homepage")} /></span>
                <span>Visible <Toggle on={p.active} label={`Visible in shop: ${p.name}`} busy={savingKey === `${p.id}:active`} onChange={() => save(p, { active: !p.active }, p.active ? "hidden from shop" : "visible in shop")} /></span>
                <Link href={`/admin/products/${encodeURIComponent(p.id)}/images`} className="ord-icon" aria-label={`Photos of ${p.name}`}><ImageIcon size={16} aria-hidden="true" /></Link>
              </div>
            </article>
          ))}
      </div>
    </div>
  );
}
