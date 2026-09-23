import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useUIStore } from "@/store/ui-store";
import type { Client } from "@/schemas/client.schema";

type CreateClientPayload = Pick<Client, "name" | "email" | "taxId" | "address">;

export function useClientsQuery() {
  return useQuery({ queryKey: ["clients"], queryFn: api.clients.list });
}

export function useCreateClientMutation() {
  const queryClient = useQueryClient();
  const showError = useUIStore((state) => state.showError);

  return useMutation({
    mutationFn: (data: CreateClientPayload) => api.clients.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : "Error desconocido");
    },
  });
}

export function useDeleteClientMutation() {
  const queryClient = useQueryClient();
  const showError = useUIStore((state) => state.showError);

  return useMutation({
    mutationFn: (id: string) => api.clients.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : "Error desconocido");
    },
  });
}
