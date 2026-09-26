"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "success" | "error" | "info" | "warning";
}

interface ToastContextType {
  toast: (opts: { title: string; description?: string; variant?: "success" | "error" | "info" | "warning" }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    ({ title, description, variant = "success" }: { title: string; description?: string; variant?: "success" | "error" | "info" | "warning" }) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, title, description, variant }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Fixed Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-lg border p-4 shadow-lg bg-white transition-all duration-300 transform translate-y-0 flex items-start justify-between gap-3 ${
              t.variant === "error"
                ? "border-red-200 bg-white text-slate-900"
                : t.variant === "warning"
                ? "border-amber-200 bg-white text-slate-900"
                : t.variant === "info"
                ? "border-sky-200 bg-white text-slate-900"
                : "border-blue-200 bg-white text-slate-900"
            }`}
          >
            <div className="flex items-start gap-3">
              {t.variant === "error" ? (
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              ) : t.variant === "warning" ? (
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              ) : t.variant === "info" ? (
                <Info className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-headings text-sm font-bold text-slate-900 leading-tight">{t.title}</p>
                {t.description && <p className="font-body text-xs text-slate-500 mt-1 leading-snug">{t.description}</p>}
              </div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-700 shrink-0 transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: ({ title }: { title: string }) => console.log(title),
    };
  }
  return ctx;
}
