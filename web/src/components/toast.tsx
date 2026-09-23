"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/ui-store";

export function Toast() {
  const toast = useUIStore((state) => state.toast);
  const clearToast = useUIStore((state) => state.clearToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(clearToast, 4000);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  if (!toast) return null;

  const styles =
    toast.type === "error"
      ? "bg-red-600 text-white dark:bg-red-500"
      : "bg-green-600 text-white dark:bg-green-500";

  return (
    <div className="fixed right-6 top-6 z-50">
      <div className={`rounded-md px-4 py-3 text-sm font-medium shadow-lg ${styles}`}>{toast.message}</div>
    </div>
  );
}
