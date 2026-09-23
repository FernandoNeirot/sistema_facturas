"use client";

import Link from "next/link";
import { useInvoicesQuery } from "@/hooks/use-invoices";
import { StatusBadge } from "@/components/ui/status-badge";
import { currency, dateFormatter } from "@/lib/format";

export default function InvoicesPage() {
  const { data: invoices, isLoading, isError, error } = useInvoicesQuery();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Facturas</h1>
      </div>

      {isError && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          No se pudo conectar con el servidor: {error instanceof Error ? error.message : "Error desconocido"}
        </p>
      )}

      {!isError && isLoading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Cargando facturas...</p>
      )}

      {invoices && invoices.length === 0 && (
        <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          Todavía no hay facturas.{" "}
          <Link href="/invoices/new" className="text-gray-900 underline dark:text-gray-100">
            Crear la primera
          </Link>
        </div>
      )}

      {invoices && invoices.length > 0 && (
        <div className="overflow-hidden rounded-md border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Número</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Vencimiento</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                  <td className="px-4 py-3">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="font-medium text-gray-900 hover:underline dark:text-gray-100"
                    >
                      {invoice.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{invoice.client.name}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {dateFormatter.format(new Date(invoice.dueDate))}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{currency.format(invoice.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
