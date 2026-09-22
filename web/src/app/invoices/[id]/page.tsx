"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, type Invoice, type InvoiceStatus } from "@/lib/api";
import { cardClass } from "@/lib/ui";

const currency = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });
const dateFormatter = new Intl.DateTimeFormat("es-AR", { timeZone: "UTC" });
const statuses: InvoiceStatus[] = ["DRAFT", "SENT", "PAID", "OVERDUE"];

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.invoices.get(id).then(setInvoice).catch((err) => setError(err.message));
  }, [id]);

  async function handleStatusChange(status: InvoiceStatus) {
    if (!invoice) return;
    const updated = await api.invoices.updateStatus(invoice.id, status);
    setInvoice(updated);
  }

  if (error) return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  if (!invoice) return <p className="text-sm text-gray-500 dark:text-gray-400">Cargando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{invoice.number}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.client.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            value={invoice.status}
            onChange={(e) => handleStatusChange(e.target.value as InvoiceStatus)}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <a
            href={api.invoices.pdfUrl(invoice.id)}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
          >
            Descargar PDF
          </a>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className={`p-4 ${cardClass}`}>
          <h2 className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Cliente</h2>
          <p className="font-medium">{invoice.client.name}</p>
          {invoice.client.email && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.client.email}</p>
          )}
          {invoice.client.taxId && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.client.taxId}</p>
          )}
          {invoice.client.address && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.client.address}</p>
          )}
        </div>
        <div className={`p-4 ${cardClass}`}>
          <h2 className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Fechas</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Emisión: {dateFormatter.format(new Date(invoice.issueDate))}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vencimiento: {dateFormatter.format(new Date(invoice.dueDate))}
          </p>
        </div>
      </div>

      <div className={`overflow-hidden ${cardClass}`}>
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3 text-right">Cantidad</th>
              <th className="px-4 py-3 text-right">Precio unitario</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.description}</td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right">{currency.format(item.unitPrice)}</td>
                <td className="px-4 py-3 text-right">{currency.format(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200 dark:border-gray-800">
              <td colSpan={3} className="px-4 py-3 text-right font-semibold">
                Total
              </td>
              <td className="px-4 py-3 text-right font-semibold">{currency.format(invoice.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {invoice.notes && (
        <div className={`p-4 ${cardClass}`}>
          <h2 className="mb-1 text-sm font-semibold text-gray-500 dark:text-gray-400">Notas</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}
