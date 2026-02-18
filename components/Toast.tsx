"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type ToastType = "success" | "warning" | "danger" | "info";

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
};

type ToastContextType = {
  toasts: Toast[];
  addToast: (type: ToastType, title: string, message?: string) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null;

  const icons: Record<ToastType, string> = {
    success: "✓",
    warning: "!",
    danger: "✕",
    info: "i",
  };

  return (
    <div className="toast-container" data-testid="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          data-testid={`toast-${toast.type}`}
        >
          <span
            className="toast-icon"
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
              background:
                toast.type === "success"
                  ? "var(--success-surface)"
                  : toast.type === "warning"
                  ? "var(--warning-surface)"
                  : toast.type === "danger"
                  ? "var(--danger-surface)"
                  : "var(--info-surface)",
              color:
                toast.type === "success"
                  ? "var(--success)"
                  : toast.type === "warning"
                  ? "var(--warning)"
                  : toast.type === "danger"
                  ? "var(--danger)"
                  : "var(--info)",
            }}
          >
            {icons[toast.type]}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: toast.message ? 2 : 0 }}>
              {toast.title}
            </div>
            {toast.message && (
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {toast.message}
              </div>
            )}
          </div>
          <button
            className="toast-close"
            onClick={() => removeToast(toast.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
