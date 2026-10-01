"use client";

import type { ReactNode } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useMeQuery } from "@/hooks/use-auth";
import { LoginScreen } from "@/components/login-screen";

export function AuthGate({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);
  useMeQuery();

  if (status === "checking") return null;
  if (status === "unauthenticated") return <LoginScreen />;
  return <>{children}</>;
}
