import { create } from "zustand";

type Toast = { type: "error" | "success"; message: string } | null;

type UIStore = {
  toast: Toast;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  clearToast: () => void;
};

export const useUIStore = create<UIStore>((set) => ({
  toast: null,
  showError: (message) => set({ toast: { type: "error", message } }),
  showSuccess: (message) => set({ toast: { type: "success", message } }),
  clearToast: () => set({ toast: null }),
}));
