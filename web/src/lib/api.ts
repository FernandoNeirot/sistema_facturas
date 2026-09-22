const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export type Client = {
  id: string;
  name: string;
  email: string | null;
  taxId: string | null;
  address: string | null;
  createdAt: string;
};

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE";

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Invoice = {
  id: string;
  number: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  notes: string | null;
  clientId: string;
  client: Client;
  items: InvoiceItem[];
  total: number;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
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
    remove: (id: string) => request<void>(`/invoices/${id}`, { method: "DELETE" }),
    pdfUrl: (id: string) => `${API_URL}/invoices/${id}/pdf`,
  },
};
