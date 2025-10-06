"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const getToastConfig = () => {
    switch (toast.type) {
      case "success":
        return {
          icon: CheckCircle,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconColor: "text-green-600",
          titleColor: "text-green-900",
          descColor: "text-green-800"
        };
      case "error":
        return {
          icon: AlertCircle,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-600",
          titleColor: "text-red-900",
          descColor: "text-red-800"
        };
      case "warning":
        return {
          icon: AlertCircle,
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          iconColor: "text-orange-600",
          titleColor: "text-orange-900",
          descColor: "text-orange-800"
        };
      case "info":
        return {
          icon: Info,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconColor: "text-blue-600",
          titleColor: "text-blue-900",
          descColor: "text-blue-800"
        };
      default:
        return {
          icon: Info,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          iconColor: "text-gray-600",
          titleColor: "text-gray-900",
          descColor: "text-gray-800"
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "max-w-sm w-full bg-white border-2 rounded-lg shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right-full duration-300",
        config.borderColor
      )}
    >
      <div className={cn("flex-shrink-0", config.iconColor)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={cn("font-semibold text-sm", config.titleColor)}>
          {toast.title}
        </h4>
        {toast.description && (
          <p className={cn("text-sm mt-1", config.descColor)}>
            {toast.description}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(toast.id)}
        className="h-6 w-6 p-0 hover:bg-gray-100"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Convenience functions for common toasts
export function useToastHelpers() {
  const { addToast } = useToast();

  const showSuccess = useCallback((title: string, description?: string) => {
    return addToast({ type: "success", title, description });
  }, [addToast]);

  const showError = useCallback((title: string, description?: string) => {
    return addToast({ type: "error", title, description });
  }, [addToast]);

  const showInfo = useCallback((title: string, description?: string) => {
    return addToast({ type: "info", title, description });
  }, [addToast]);

  const showWarning = useCallback((title: string, description?: string) => {
    return addToast({ type: "warning", title, description });
  }, [addToast]);

  return { showSuccess, showError, showInfo, showWarning };
}
