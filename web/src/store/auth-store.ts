import { create } from "zustand";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

type AuthStore = {
  status: AuthStatus;
  username: string | null;
  setAuthenticated: (username: string) => void;
  setUnauthenticated: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  status: "checking",
  username: null,
  setAuthenticated: (username) => set({ status: "authenticated", username }),
  setUnauthenticated: () => set({ status: "unauthenticated", username: null }),
}));
