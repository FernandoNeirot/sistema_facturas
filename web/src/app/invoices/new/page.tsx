"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type Client } from "@/lib/api";
import { cardClass, inputClass, itemInputClass, labelClass } from "@/lib/ui";

type LineItem = { description: string; quantity: string; unitPrice: string };

const emptyItem: LineItem = { description: "", quantity: "1", unitPrice: "0" };

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([emptyItem]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.clients.list().then((list) => {
      setClients(list);
      if (list.length > 0) setClientId(list[0].id);
    });
  }, []);

  const total = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !dueDate || items.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const invoice = await api.invoices.create({
        clientId,
        dueDate,
        notes: notes || undefined,
        items: items
          .filter((item) => item.description.trim())
          .map((item) => ({
            description: item.description,
            quantity: Number(item.quantity) || 0,
            unitPrice: Number(item.unitPrice) || 0,
          })),
      });
      router.push(`/invoices/${invoice.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setSubmitting(false);
    }
  }

  if (clients.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Primero necesitás crear un cliente en la sección{" "}
        <a href="/clients" className="underline">
          Clientes
        </a>
        .
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Nueva factura</h1>
      <form onSubmit={handleSubmit} className={`space-y-6 p-6 ${cardClass}`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Cliente *</label>
            <select className={inputClass} value={clientId} onChange={(e) => setClientId(e.target.value)}>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Fecha de vencimiento *</label>
            <input
              type="date"
              className={inputClass}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className={labelClass}>Ítems</label>
            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, emptyItem])}
              className="text-sm text-gray-900 underline dark:text-gray-100"
            >
              + Agregar ítem
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-[1fr_80px_100px_28px] items-center gap-2">
                <input
                  placeholder="Descripción"
                  className={itemInputClass}
                  value={item.description}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                />
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Cant."
                  className={itemInputClass}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: e.target.value })}
                />
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Precio"
                  className={itemInputClass}
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, { unitPrice: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="text-gray-400 hover:text-red-600 disabled:opacity-30 dark:text-gray-500 dark:hover:text-red-400"
                  aria-label="Quitar ítem"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Notas</label>
          <textarea className={inputClass} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
          <p className="text-lg font-semibold">
            Total: {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(total)}
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
          >
            {submitting ? "Creando..." : "Crear factura"}
          </button>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </form>
    </div>
  );
}
