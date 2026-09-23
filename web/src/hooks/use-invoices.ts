import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useUIStore } from "@/store/ui-store";
import type { InvoiceStatus } from "@/schemas/invoice.schema";

type CreateInvoicePayload = {
  clientId: string;
  dueDate: string;
  notes?: string;
  items: { description: string; quantity: number; unitPrice: number }[];
};

export function useInvoicesQuery() {
  return useQuery({ queryKey: ["invoices"], queryFn: api.invoices.list });
}

export function useInvoiceQuery(id: string) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: () => api.invoices.get(id),
    enabled: !!id,
  });
}

export function useCreateInvoiceMutation() {
  const queryClient = useQueryClient();
  const showError = useUIStore((state) => state.showError);

  return useMutation({
    mutationFn: (data: CreateInvoicePayload) => api.invoices.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : "Error desconocido");
    },
  });
}

export function useUpdateInvoiceStatusMutation(id: string) {
  const queryClient = useQueryClient();
  const showError = useUIStore((state) => state.showError);

  return useMutation({
    mutationFn: (status: InvoiceStatus) => api.invoices.updateStatus(id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(["invoices", id], updated);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : "Error desconocido");
    },
  });
}
