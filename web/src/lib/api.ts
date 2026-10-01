import type { Client } from "@/schemas/client.schema";
import type { Invoice, InvoiceStatus } from "@/schemas/invoice.schema";
import { useAuthStore } from "@/store/auth-store";

export type { Client, Invoice, InvoiceStatus };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 401) {
    useAuthStore.getState().setUnauthenticated();
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? body.error ?? `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<{ username: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    me: () => request<{ username: string }>("/auth/me"),
    logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),
  },
  clients: {
    list: () => request<Client[]>("/clients"),
    get: (id: string) => request<Client>(`/clients/${id}`),
    create: (data: Pick<Client, "name" | "email" | "taxId" | "address">) =>
      request<Client>("/clients", { method: "POST", body: JSON.stringify(data) }),
    remove: (id: string) => request<void>(`/clients/${id}`, { method: "DELETE" }),
  },
  invoices: {
    list: () => request<Invoice[]>("/invoices"),
    get: (id: string) => request<Invoice>(`/invoices/${id}`),
    create: (data: {
      clientId: string;
      dueDate: string;
      notes?: string;
      items: { description: string; quantity: number; unitPrice: number }[];
    }) => request<Invoice>("/invoices", { method: "POST", body: JSON.stringify(data) }),
    updateStatus: (id: string, status: InvoiceStatus) =>
      request<Invoice>(`/invoices/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
    update: (
      id: string,
      data: {
        clientId: string;
        dueDate: string;
        notes?: string;
        items: { description: string; quantity: number; unitPrice: number }[];
      },
    ) => request<Invoice>(`/invoices/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: string) => request<void>(`/invoices/${id}`, { method: "DELETE" }),
    downloadPdf: async (id: string): Promise<Blob> => {
      const res = await fetch(`${API_URL}/invoices/${id}/pdf`, { credentials: "include", cache: "no-store" });
      if (res.status === 401) {
        useAuthStore.getState().setUnauthenticated();
      }
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      return res.blob();
    },
  },
};
