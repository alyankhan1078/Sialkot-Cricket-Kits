"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import type { DBFaq } from "@/src/lib/data-service";
import { useAdminFeedback } from "@/src/components/AdminFeedbackContext";

export default function AdminFaqsPage() {
  const { showToast, confirmAction } = useAdminFeedback();
  const [faqs, setFaqs] = useState<DBFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<DBFaq | null>(null);

  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchFaqs = async () => {
    try {
      const res = await fetch("/api/admin/faqs");
      const json = await res.json();
      if (json.success) {
        setFaqs(json.data);
      }
    } catch {
      showToast("Failed to load FAQs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion, answer: newAnswer }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("FAQ added successfully!", "success");
        setNewQuestion("");
        setNewAnswer("");
        fetchFaqs();
      } else {
        showToast(data.error || "Failed to create FAQ", "error");
      }
    } catch {
      showToast("Network error while creating FAQ", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/faqs/${editingFaq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: editingFaq.question, answer: editingFaq.answer, active: editingFaq.active }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("FAQ updated successfully!", "success");
        setEditingFaq(null);
        fetchFaqs();
      } else {
        showToast(data.error || "Failed to update FAQ", "error");
      }
    } catch {
      showToast("Network error while updating FAQ", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number, questionText: string) => {
    confirmAction({
      title: "Delete FAQ Entry?",
      message: `Are you sure you want to delete this FAQ: "${questionText.slice(0, 50)}..."?`,
      confirmText: "Delete FAQ",
      cancelText: "Keep FAQ",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
          const json = await res.json();
          if (json.success) {
            showToast("FAQ deleted successfully", "success");
            fetchFaqs();
          } else {
            showToast(json.error || "Failed to delete FAQ", "error");
          }
        } catch {
          showToast("Network error while deleting FAQ", "error");
        }
      },
    });
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>FAQ Management</h1>
          <p>Create and update customer questions and clear answers displayed across the site.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>
        {/* Add/Edit Form */}
        <div className="admin-card">
          <h2 style={{ fontSize: "1.1rem", margin: "0 0 1rem", color: "#fff" }}>
            {editingFaq ? "Edit FAQ" : "Add New FAQ"}
          </h2>

          {editingFaq ? (
            <form onSubmit={handleUpdateFaq}>
              <div className="admin-form-group">
                <label>Question</label>
                <input
                  className="admin-input"
                  required
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Answer</label>
                <textarea
                  className="admin-textarea"
                  rows={4}
                  required
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                />
              </div>

              <div className="admin-form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="faq-active"
                  checked={editingFaq.active}
                  onChange={(e) => setEditingFaq({ ...editingFaq, active: e.target.checked })}
                />
                <label htmlFor="faq-active" style={{ margin: 0 }}>
                  Active
                </label>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  className="admin-btn admin-btn-secondary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                  disabled={saving}
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAddFaq}>
              <div className="admin-form-group">
                <label>Question</label>
                <input
                  className="admin-input"
                  required
                  placeholder="e.g. Do you ship to Australia and UK?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Answer</label>
                <textarea
                  className="admin-textarea"
                  rows={4}
                  required
                  placeholder="Provide clear ordering or shipping information..."
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={saving}
              >
                <Plus size={16} />
                <span>{saving ? "Adding..." : "Add FAQ"}</span>
              </button>
            </form>
          )}
        </div>

        {/* FAQs List */}
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "2rem", color: "var(--adm-muted)", textAlign: "center" }}>
              Loading FAQs...
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  style={{
                    padding: "1.25rem",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <span style={{ color: "var(--adm-primary)", fontWeight: 700, fontSize: "0.85rem" }}>
                        #{index + 1}
                      </span>
                      <strong style={{ color: "#fff", fontSize: "0.95rem" }}>{faq.question}</strong>
                      {!faq.active && (
                        <span className="admin-badge admin-badge-inactive">Hidden</span>
                      )}
                    </div>
                    <p style={{ color: "var(--adm-muted)", fontSize: "0.875rem", margin: 0, lineHeight: 1.5 }}>
                      {faq.answer}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0, alignItems: "flex-start" }}>
                    <button
                      onClick={() => setEditingFaq(faq)}
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: "0.4rem 0.6rem" }}
                      title="Edit FAQ"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id, faq.question)}
                      className="admin-btn admin-btn-danger"
                      style={{ padding: "0.4rem 0.6rem" }}
                      title="Delete FAQ"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
