"use client";

import { useLogoutMutation } from "@/hooks/use-auth";

export function LogoutButton() {
  const logout = useLogoutMutation();

  return (
    <button
      onClick={() => logout.mutate()}
      disabled={logout.isPending}
      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
    >
      Salir
    </button>
  );
}
