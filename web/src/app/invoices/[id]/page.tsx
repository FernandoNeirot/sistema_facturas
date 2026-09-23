"use client";

import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useInvoiceQuery, useUpdateInvoiceStatusMutation } from "@/hooks/use-invoices";
import { InvoiceStatusSchema, type InvoiceStatus } from "@/schemas/invoice.schema";
import { inputClass } from "@/lib/ui";
import { currency, dateFormatter } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const statuses = InvoiceStatusSchema.options;

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: invoice, isError, error } = useInvoiceQuery(id);
  const updateStatus = useUpdateInvoiceStatusMutation(id);

  function handleStatusChange(status: InvoiceStatus) {
    updateStatus.mutate(status);
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {error instanceof Error ? error.message : "Error desconocido"}
      </p>
    );
  }
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
            className={inputClass}
            value={invoice.status}
            onChange={(e) => handleStatusChange(e.target.value as InvoiceStatus)}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <Button href={api.invoices.pdfUrl(invoice.id)} className="px-4 py-2">
            Descargar PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="p-4">
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
        </Card>
        <Card className="p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Fechas</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Emisión: {dateFormatter.format(new Date(invoice.issueDate))}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vencimiento: {dateFormatter.format(new Date(invoice.dueDate))}
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden">
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
      </Card>

      {invoice.notes && (
        <Card className="p-4">
          <h2 className="mb-1 text-sm font-semibold text-gray-500 dark:text-gray-400">Notas</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">{invoice.notes}</p>
        </Card>
      )}
    </div>
  );
}
