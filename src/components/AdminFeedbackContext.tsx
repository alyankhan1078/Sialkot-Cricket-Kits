"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle, X, Trash2 } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
}

interface AdminFeedbackContextValue {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  confirmAction: (options: ConfirmOptions) => void;
}

const AdminFeedbackContext = createContext<AdminFeedbackContextValue | null>(null);

export function AdminFeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmOptions | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success", title?: string) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      setToasts((prev) => [...prev, { id, message, type, title }]);
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const confirmAction = useCallback((options: ConfirmOptions) => {
    setConfirmModal(options);
  }, []);

  const handleConfirm = async () => {
    if (!confirmModal) return;
    setIsConfirming(true);
    try {
      await confirmModal.onConfirm();
    } finally {
      setIsConfirming(false);
      setConfirmModal(null);
    }
  };

  const handleCancel = () => {
    if (isConfirming) return;
    setConfirmModal(null);
  };

  return (
    <AdminFeedbackContext.Provider value={{ showToast, confirmAction }}>
      {children}

      {/* ── Toast Notifications Layer ── */}
      <div className="admin-toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`admin-toast admin-toast-${toast.type}`}>
            <div className="admin-toast-icon">
              {toast.type === "success" && <CheckCircle2 size={18} />}
              {toast.type === "error" && <XCircle size={18} />}
              {toast.type === "warning" && <AlertTriangle size={18} />}
              {toast.type === "info" && <Info size={18} />}
            </div>
            <div className="admin-toast-content">
              {toast.title && <strong className="admin-toast-title">{toast.title}</strong>}
              <span className="admin-toast-message">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="admin-toast-close"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* ── Beautiful Confirmation Modal Dialog ── */}
      {confirmModal && (
        <div className="admin-modal-backdrop" onClick={handleCancel}>
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <div
                className={`admin-modal-badge ${
                  confirmModal.danger ? "admin-modal-badge-danger" : "admin-modal-badge-warning"
                }`}
              >
                {confirmModal.danger ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
              </div>
              <button
                onClick={handleCancel}
                className="admin-modal-close"
                aria-label="Close dialog"
                disabled={isConfirming}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <h3>{confirmModal.title}</h3>
              <p>{confirmModal.message}</p>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="admin-btn admin-btn-secondary"
                disabled={isConfirming}
              >
                {confirmModal.cancelText || "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`admin-btn ${
                  confirmModal.danger ? "admin-btn-danger-solid" : "admin-btn-primary"
                }`}
                disabled={isConfirming}
              >
                {isConfirming
                  ? "Processing..."
                  : confirmModal.confirmText || (confirmModal.danger ? "Delete" : "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminFeedbackContext.Provider>
  );
}

export function useAdminFeedback() {
  const context = useContext(AdminFeedbackContext);
  if (!context) {
    throw new Error("useAdminFeedback must be used within an AdminFeedbackProvider");
  }
  return context;
}
