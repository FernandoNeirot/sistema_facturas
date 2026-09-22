"use client";

import { useEffect, useState } from "react";
import { api, type Client } from "@/lib/api";

const emptyForm = { name: "", email: "", taxId: "", address: "" };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadClients = () => api.clients.list().then(setClients).catch((err) => setError(err.message));

  useEffect(() => {
    loadClients();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.clients.create({
        name: form.name,
        email: form.email || null,
        taxId: form.taxId || null,
        address: form.address || null,
      });
      setForm(emptyForm);
      await loadClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este cliente?")) return;
    await api.clients.remove(id);
    await loadClients();
  }

  return (
    <div className="grid gap-8 md:grid-cols-[2fr_3fr]">
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Nuevo cliente</h1>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-gray-200 bg-white p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre *</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CUIT / Tax ID</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={form.taxId}
              onChange={(e) => setForm({ ...form, taxId: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {submitting ? "Guardando..." : "Crear cliente"}
          </button>
        </form>
      </div>

      <div>
        <h1 className="mb-4 text-2xl font-semibold">Clientes</h1>
        {!clients && <p className="text-sm text-gray-500">Cargando...</p>}
        {clients && clients.length === 0 && (
          <p className="text-sm text-gray-500">Todavía no hay clientes cargados.</p>
        )}
        {clients && clients.length > 0 && (
          <ul className="divide-y divide-gray-100 rounded-md border border-gray-200 bg-white">
            {clients.map((client) => (
              <li key={client.id} className="flex items-start justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-500">
                    {[client.email, client.taxId, client.address].filter(Boolean).join(" · ") || "Sin datos adicionales"}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
