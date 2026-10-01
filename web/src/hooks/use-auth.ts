import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

export function useMeQuery() {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const me = await api.auth.me();
        setAuthenticated(me.username);
        return me;
      } catch (err) {
        setUnauthenticated();
        throw err;
      }
    },
    retry: false,
  });
}

export function useLoginMutation() {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      api.auth.login(username, password),
    onSuccess: (data) => {
      setAuthenticated(data.username);
    },
  });
}

export function useLogoutMutation() {
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: () => {
      setUnauthenticated();
      queryClient.clear();
    },
  });
}
